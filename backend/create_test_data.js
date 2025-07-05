const { MongoClient, ObjectId } = require('mongodb');

// Dados de teste para demonstração
const testData = {
    professores: [
        {
            _id: new ObjectId(),
            nome: "Alex Soares de Brito",
            email: "alex.brito@ifpr.edu.br",
            departamento: "Física",
            versoes_horario: [
                {
                    ano: "2025",
                    semestre: "1",
                    url_mdx: "/professor/alex_soares_de_brito.mdx",
                    data_leitura: new Date()
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            _id: new ObjectId(),
            nome: "Maria Silva Santos",
            email: "maria.santos@ifpr.edu.br",
            departamento: "Matemática",
            versoes_horario: [
                {
                    ano: "2025",
                    semestre: "1",
                    url_mdx: "/professor/maria_silva_santos.mdx",
                    data_leitura: new Date()
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            _id: new ObjectId(),
            nome: "João Carlos Oliveira",
            email: "joao.oliveira@ifpr.edu.br",
            departamento: "Informática",
            versoes_horario: [
                {
                    ano: "2025",
                    semestre: "1",
                    url_mdx: "/professor/joao_carlos_oliveira.mdx",
                    data_leitura: new Date()
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        }
    ]
};

// Gerar horários para cada professor
function generateHorarios() {
    const horarios = [];
    const dias = ["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"];
    const disciplinas = ["Física I", "Física II", "Matemática I", "Programação", "Algoritmos", "Banco de Dados"];
    const salas = ["Lab. Física", "Sala 101", "Lab. Informática", "Sala 205", "Auditório"];
    const turmas = ["AGO2025", "INFO2024", "MECA2025", "ELET2024"];
    
    testData.professores.forEach((professor, profIndex) => {
        // Cada professor terá entre 8-12 horários
        const numHorarios = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numHorarios; i++) {
            const dia = dias[Math.floor(Math.random() * dias.length)];
            const disciplina = disciplinas[Math.floor(Math.random() * disciplinas.length)];
            const sala = salas[Math.floor(Math.random() * salas.length)];
            const turma = turmas[Math.floor(Math.random() * turmas.length)];
            
            // Gerar horários aleatórios
            const horaInicio = 7 + Math.floor(Math.random() * 10); // 7h às 16h
            const minutoInicio = Math.random() < 0.5 ? 30 : 0;
            const horaFim = horaInicio + 1 + Math.floor(Math.random() * 2); // 1-3 horas de duração
            const minutoFim = Math.random() < 0.5 ? 30 : 0;
            
            const horarioInicio = `${horaInicio.toString().padStart(2, '0')}:${minutoInicio.toString().padStart(2, '0')}`;
            const horarioFim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
            
            horarios.push({
                professor_id: professor._id,
                versao_horario_ano: "2025",
                versao_horario_semestre: "1",
                dia_semana: dia,
                horario_inicio: horarioInicio,
                horario_fim: horarioFim,
                disciplina: disciplina,
                turma: turma,
                sala: sala,
                created_at: new Date()
            });
        }
    });
    
    return horarios;
}

async function insertTestData() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('Conectado ao MongoDB local');
        
        const db = client.db('ifpr_horarios');
        
        // Limpar dados existentes
        await db.collection('professores').deleteMany({});
        await db.collection('horarios').deleteMany({});
        console.log('Dados existentes removidos');
        
        // Inserir professores
        await db.collection('professores').insertMany(testData.professores);
        console.log(`${testData.professores.length} professores inseridos`);
        
        // Gerar e inserir horários
        const horarios = generateHorarios();
        await db.collection('horarios').insertMany(horarios);
        console.log(`${horarios.length} horários inseridos`);
        
        console.log('Dados de teste inseridos com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inserir dados de teste:', error);
    } finally {
        await client.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    insertTestData();
}

module.exports = { insertTestData };

