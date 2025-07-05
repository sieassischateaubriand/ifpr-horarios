const { ObjectId } = require('mongodb');

// Dados mock para demonstração
const mockProfessores = [
    {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        nome: "Alex Soares de Brito",
        email: "alex.brito@ifpr.edu.br",
        departamento: "Física",
        versoes_horario: [
            {
                ano: "2025",
                semestre: "1",
                url_mdx: "/professor/alex_soares_de_brito.mdx",
                data_leitura: new Date("2025-01-15")
            }
        ],
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("507f1f77bcf86cd799439012"),
        nome: "Maria Silva Santos",
        email: "maria.santos@ifpr.edu.br",
        departamento: "Matemática",
        versoes_horario: [
            {
                ano: "2025",
                semestre: "1",
                url_mdx: "/professor/maria_silva_santos.mdx",
                data_leitura: new Date("2025-01-15")
            }
        ],
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("507f1f77bcf86cd799439013"),
        nome: "João Carlos Oliveira",
        email: "joao.oliveira@ifpr.edu.br",
        departamento: "Informática",
        versoes_horario: [
            {
                ano: "2025",
                semestre: "1",
                url_mdx: "/professor/joao_carlos_oliveira.mdx",
                data_leitura: new Date("2025-01-15")
            },
            {
                ano: "2024",
                semestre: "2",
                url_mdx: "/professor/joao_carlos_oliveira.mdx",
                data_leitura: new Date("2024-08-15")
            }
        ],
        created_at: new Date("2024-08-01"),
        updated_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("507f1f77bcf86cd799439014"),
        nome: "Ana Paula Costa",
        email: "ana.costa@ifpr.edu.br",
        departamento: "Química",
        versoes_horario: [
            {
                ano: "2025",
                semestre: "1",
                url_mdx: "/professor/ana_paula_costa.mdx",
                data_leitura: new Date("2025-01-15")
            }
        ],
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-15")
    }
];

const mockHorarios = [
    // Alex Soares de Brito
    {
        _id: new ObjectId("607f1f77bcf86cd799439021"),
        professor_id: new ObjectId("507f1f77bcf86cd799439011"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Segunda-Feira",
        horario_inicio: "08:00",
        horario_fim: "09:40",
        disciplina: "Física I",
        turma: "AGO2025",
        sala: "Laboratório de Física",
        created_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("607f1f77bcf86cd799439022"),
        professor_id: new ObjectId("507f1f77bcf86cd799439011"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Quarta-Feira",
        horario_inicio: "10:15",
        horario_fim: "11:55",
        disciplina: "Física III",
        turma: "AGO2023",
        sala: "Laboratório de Física",
        created_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("607f1f77bcf86cd799439023"),
        professor_id: new ObjectId("507f1f77bcf86cd799439011"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Sexta-Feira",
        horario_inicio: "14:00",
        horario_fim: "15:40",
        disciplina: "Física II",
        turma: "AGO2024",
        sala: "Sala 201",
        created_at: new Date("2025-01-15")
    },
    
    // Maria Silva Santos
    {
        _id: new ObjectId("607f1f77bcf86cd799439024"),
        professor_id: new ObjectId("507f1f77bcf86cd799439012"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Terça-Feira",
        horario_inicio: "07:30",
        horario_fim: "09:10",
        disciplina: "Matemática I",
        turma: "INFO2025",
        sala: "Sala 105",
        created_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("607f1f77bcf86cd799439025"),
        professor_id: new ObjectId("507f1f77bcf86cd799439012"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Quinta-Feira",
        horario_inicio: "09:20",
        horario_fim: "11:00",
        disciplina: "Cálculo I",
        turma: "MECA2025",
        sala: "Sala 203",
        created_at: new Date("2025-01-15")
    },
    
    // João Carlos Oliveira
    {
        _id: new ObjectId("607f1f77bcf86cd799439026"),
        professor_id: new ObjectId("507f1f77bcf86cd799439013"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Segunda-Feira",
        horario_inicio: "13:30",
        horario_fim: "15:10",
        disciplina: "Programação I",
        turma: "INFO2025",
        sala: "Lab. Informática 1",
        created_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("607f1f77bcf86cd799439027"),
        professor_id: new ObjectId("507f1f77bcf86cd799439013"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Quarta-Feira",
        horario_inicio: "15:20",
        horario_fim: "17:00",
        disciplina: "Banco de Dados",
        turma: "INFO2023",
        sala: "Lab. Informática 2",
        created_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("607f1f77bcf86cd799439028"),
        professor_id: new ObjectId("507f1f77bcf86cd799439013"),
        versao_horario_ano: "2024",
        versao_horario_semestre: "2",
        dia_semana: "Terça-Feira",
        horario_inicio: "08:00",
        horario_fim: "09:40",
        disciplina: "Algoritmos",
        turma: "INFO2024",
        sala: "Lab. Informática 1",
        created_at: new Date("2024-08-15")
    },
    
    // Ana Paula Costa
    {
        _id: new ObjectId("607f1f77bcf86cd799439029"),
        professor_id: new ObjectId("507f1f77bcf86cd799439014"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Terça-Feira",
        horario_inicio: "10:15",
        horario_fim: "11:55",
        disciplina: "Química Geral",
        turma: "QUIM2025",
        sala: "Lab. Química",
        created_at: new Date("2025-01-15")
    },
    {
        _id: new ObjectId("607f1f77bcf86cd799439030"),
        professor_id: new ObjectId("507f1f77bcf86cd799439014"),
        versao_horario_ano: "2025",
        versao_horario_semestre: "1",
        dia_semana: "Quinta-Feira",
        horario_inicio: "14:00",
        horario_fim: "15:40",
        disciplina: "Química Orgânica",
        turma: "QUIM2023",
        sala: "Lab. Química",
        created_at: new Date("2025-01-15")
    }
];

class MockProfessorModel {
    constructor() {
        this.professores = mockProfessores;
        this.horarios = mockHorarios;
    }

    async connect() {
        // Simula conexão
        return true;
    }

    async getAllProfessoresComHorarios() {
        // Simula agregação MongoDB
        const result = this.professores.map(professor => {
            const horariosProf = this.horarios.filter(h => 
                h.professor_id.toString() === professor._id.toString()
            );
            
            const versoesUnicas = [...new Set(horariosProf.map(h => ({
                ano: h.versao_horario_ano,
                semestre: h.versao_horario_semestre
            })))];

            return {
                ...professor,
                horarios: horariosProf,
                total_horarios: horariosProf.length,
                versoes_unicas: versoesUnicas
            };
        }).filter(prof => prof.horarios.length > 0);

        return result;
    }

    async getProfessorComHorariosPorVersao(versaoAno = null, versaoSemestre = null) {
        let horariosFiltered = this.horarios;
        
        if (versaoAno) {
            horariosFiltered = horariosFiltered.filter(h => h.versao_horario_ano === versaoAno);
        }
        if (versaoSemestre) {
            horariosFiltered = horariosFiltered.filter(h => h.versao_horario_semestre === versaoSemestre);
        }

        const result = this.professores.map(professor => {
            const horariosProf = horariosFiltered.filter(h => 
                h.professor_id.toString() === professor._id.toString()
            );
            
            if (horariosProf.length === 0) return null;

            const versoesUnicas = [...new Set(horariosProf.map(h => ({
                ano: h.versao_horario_ano,
                semestre: h.versao_horario_semestre
            })))];

            return {
                ...professor,
                horarios: horariosProf,
                total_horarios: horariosProf.length,
                versoes_unicas: versoesUnicas
            };
        }).filter(prof => prof !== null);

        return result;
    }

    async getEstatisticasGerais() {
        const totalProfessores = this.professores.length;
        const professoresComHorarios = this.professores.filter(prof => 
            this.horarios.some(h => h.professor_id.toString() === prof._id.toString())
        ).length;

        const versoesDisponiveis = [...new Set(this.horarios.map(h => ({
            _id: {
                ano: h.versao_horario_ano,
                semestre: h.versao_horario_semestre
            }
        })))];

        return {
            total_professores: [{ count: totalProfessores }],
            professores_com_horarios: [{ count: professoresComHorarios }],
            versoes_disponiveis: versoesDisponiveis.sort((a, b) => {
                if (a._id.ano !== b._id.ano) return b._id.ano - a._id.ano;
                return b._id.semestre - a._id.semestre;
            })
        };
    }

    async getAllProfessores() {
        return this.professores;
    }

    async getHorariosByProfessor(professorId) {
        return this.horarios.filter(h => 
            h.professor_id.toString() === professorId.toString()
        );
    }

    // Métodos não implementados para mock (não necessários para visualização)
    async createProfessor() { throw new Error('Mock: método não implementado'); }
    async addVersaoHorario() { throw new Error('Mock: método não implementado'); }
    async createHorario() { throw new Error('Mock: método não implementado'); }
    async clearHorariosByVersao() { throw new Error('Mock: método não implementado'); }
    async close() { return true; }
}

module.exports = MockProfessorModel;

