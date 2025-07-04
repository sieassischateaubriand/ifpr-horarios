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
            this.client = new MongoClient(process.env.MONGODB_URI);
            await this.client.connect();
            this.db = this.client.db('ifpr_horarios');
            this.professores = this.db.collection('professores');
            this.horarios = this.db.collection('horarios');
        }
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

