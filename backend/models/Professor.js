const { MongoClient, ObjectId } = require('mongodb');

class ProfessorModel {
    constructor() {
        this.client = null;
        this.db = null;
        this.professores = null;
        this.horarios = null;
    }

    async connect() {
        if (!this.client) {
            this.client = new MongoClient("mongodb+srv://user_log_acess:Log4c3ss2025@cluster0.nbt3sks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
            //this.client = new MongoClient(process.env.MONGODB_URI);
            await this.client.connect();
        }
        this.db = this.client.db('ifpr_horarios');
        this.professores = this.db.collection('professores');
        this.horarios = this.db.collection('horarios');
    }

    async createProfessor(nome, email = null, departamento = null) {
        await this.connect();

        // Verificar se professor já existe
        const professorExistente = await this.professores.findOne({ nome });
        if (professorExistente) {
            return professorExistente;
        }

        const professorData = {
            nome,
            email,
            departamento,
            versoes_horario: [],
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await this.professores.insertOne(professorData);
        return { ...professorData, _id: result.insertedId };
    }

    async addVersaoHorario(professorId, ano, semestre, urlMdx) {
        await this.connect();

        const versao = {
            ano,
            semestre,
            url_mdx: urlMdx,
            data_leitura: new Date()
        };

        await this.professores.updateOne(
            { _id: new ObjectId(professorId) },
            {
                $push: { versoes_horario: versao },
                $set: { updated_at: new Date() }
            }
        );
    }

    async createHorario(professorId, versaoAno, versaoSemestre, diaSemana,
        horarioInicio, horarioFim, disciplina, turma, sala) {
        await this.connect();

        const horarioData = {
            professor_id: new ObjectId(professorId),
            versao_horario_ano: versaoAno,
            versao_horario_semestre: versaoSemestre,
            dia_semana: diaSemana,
            horario_inicio: horarioInicio,
            horario_fim: horarioFim,
            disciplina,
            turma,
            sala,
            created_at: new Date()
        };

        const result = await this.horarios.insertOne(horarioData);
        return result.insertedId;
    }

    async getAllProfessoresComHorarios() {
        await this.connect();

        // Agregação MongoDB para fazer "inner join" entre professores e horários
        const pipeline = [
            {
                $lookup: {
                    from: 'horarios',
                    localField: '_id',
                    foreignField: 'professor_id',
                    as: 'horarios'
                }
            },
            {
                $match: {
                    'horarios.0': { $exists: true } // Apenas professores com horários
                }
            },
            {
                $addFields: {
                    total_horarios: { $size: '$horarios' },
                    versoes_unicas: {
                        $setUnion: [
                            {
                                $map: {
                                    input: '$horarios',
                                    as: 'horario',
                                    in: {
                                        ano: '$$horario.versao_horario_ano',
                                        semestre: '$$horario.versao_horario_semestre'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $sort: { nome: 1 }
            }
        ];

        return await this.professores.aggregate(pipeline).toArray();
    }

    async getProfessorComHorariosPorVersao(versaoAno = null, versaoSemestre = null) {
        await this.connect();

        const matchStage = {};
        if (versaoAno) matchStage['horarios.versao_horario_ano'] = versaoAno;
        if (versaoSemestre) matchStage['horarios.versao_horario_semestre'] = versaoSemestre;

        const pipeline = [
            {
                $lookup: {
                    from: 'horarios',
                    localField: '_id',
                    foreignField: 'professor_id',
                    as: 'horarios'
                }
            },
            {
                $match: {
                    'horarios.0': { $exists: true },
                    ...matchStage
                }
            },
            {
                $addFields: {
                    horarios_filtrados: {
                        $filter: {
                            input: '$horarios',
                            as: 'horario',
                            cond: {
                                $and: [
                                    versaoAno ? { $eq: ['$$horario.versao_horario_ano', versaoAno] } : true,
                                    versaoSemestre ? { $eq: ['$$horario.versao_horario_semestre', versaoSemestre] } : true
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    horarios_por_dia: {
                        $group: {
                            _id: null,
                            dias: {
                                $push: {
                                    $group: {
                                        _id: '$horarios_filtrados.dia_semana',
                                        horarios: { $push: '$horarios_filtrados' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $sort: { nome: 1 }
            }
        ];

        return await this.professores.aggregate(pipeline).toArray();
    }

    async getEstatisticasGerais() {
        await this.connect();

        const pipeline = [
            {
                $facet: {
                    total_professores: [
                        { $count: "count" }
                    ],
                    professores_com_horarios: [
                        {
                            $lookup: {
                                from: 'horarios',
                                localField: '_id',
                                foreignField: 'professor_id',
                                as: 'horarios'
                            }
                        },
                        {
                            $match: {
                                'horarios.0': { $exists: true }
                            }
                        },
                        { $count: "count" }
                    ],
                    versoes_disponiveis: [
                        {
                            $lookup: {
                                from: 'horarios',
                                localField: '_id',
                                foreignField: 'professor_id',
                                as: 'horarios'
                            }
                        },
                        { $unwind: '$horarios' },
                        {
                            $group: {
                                _id: {
                                    ano: '$horarios.versao_horario_ano',
                                    semestre: '$horarios.versao_horario_semestre'
                                }
                            }
                        },
                        {
                            $sort: {
                                '_id.ano': -1,
                                '_id.semestre': -1
                            }
                        }
                    ]
                }
            }
        ];

        const result = await this.professores.aggregate(pipeline).toArray();
        return result[0];
    }

    async getAllProfessores() {
        await this.connect();
        return await this.professores.find({}).toArray();
    }

    async getHorariosByProfessor(professorId) {
        await this.connect();
        return await this.horarios.find({
            professor_id: new ObjectId(professorId)
        }).toArray();
    }

    async clearHorariosByVersao(professorId, versaoAno, versaoSemestre) {
        await this.connect();

        await this.horarios.deleteMany({
            professor_id: new ObjectId(professorId),
            versao_horario_ano: versaoAno,
            versao_horario_semestre: versaoSemestre
        });
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
    }
}

module.exports = ProfessorModel;

