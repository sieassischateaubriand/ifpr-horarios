// backend/src/routes/exportRoutes.js

const express = require('express');
const { create } = require('xmlbuilder2');

// Importar todos os modelos que vamos precisar
const Activity = require('../models/Activity');
const TeacherRestriction = require('../models/TeacherRestriction');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const StudentGroup = require('../models/StudentGroup');
// Adicione outros modelos como Rooms, Buildings se forem usados

const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();


// Middleware de autenticação para todas as rotas
router.use(authenticate);


// POST /api/export/fet
router.post('/fet', async (req, res) => {
    const { distributionId } = req.body;

    if (!distributionId) {
        return res.status(400).send({ message: 'O ID da distribuição é obrigatório.' });
    }

    try {
        // --- ETAPA 1: BUSCAR TODOS OS DADOS NECESSÁRIOS ---
        
        // Buscar todas as atividades da distribuição, populando TUDO
        const activities = await Activity.find({ distributionId })
            .populate({
                path: 'subject',
                populate: { path: 'course', select: 'name' } // Popular curso dentro da disciplina
            })
            .populate('studentGroup')
            .populate('teachers');
        
        // Buscar apenas as restrições APROVADAS para esta distribuição
        const approvedRestrictions = await TeacherRestriction.find({
            distributionId,
            status: 'Aprovado'
        }).populate('teacher', 'name');

        // Extrair listas únicas de entidades a partir das atividades
        const allTeachers = new Map();
        const allSubjects = new Map();
        const allStudentGroups = new Map();
        
        activities.forEach(act => {
            act.teachers.forEach(t => allTeachers.set(t._id.toString(), t));
            allSubjects.set(act.subject._id.toString(), act.subject);
            allStudentGroups.set(act.studentGroup._id.toString(), act.studentGroup);
        });


        // --- ETAPA 2: CONSTRUIR O DOCUMENTO XML ---
        
        const root = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('fet', { version: '7.2.5' }); // Usando a versão do seu print

        // Dados estáticos (podem vir de um BD de configurações no futuro)
        root.ele('Institution_Name').txt('Instituição Gerada pelo Manus IA System').up();
        root.ele('Comments').txt(`Exportação para a distribuição: ${distributionId}`).up();
        
        // Dias e Horas (estático por enquanto)
        const daysList = root.ele('Days_List');
        ["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"].forEach(d => daysList.ele('Day').txt(d));
        daysList.up();
        
        const hoursList = root.ele('Hours_List');
        ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00"].forEach(h => hoursList.ele('Hour').txt(h));
        hoursList.up();
        
        // Listas de Entidades
        const teachersList = root.ele('Teachers_List');
        allTeachers.forEach(teacher => teachersList.ele('Teacher').ele('Name').txt(teacher.name));
        teachersList.up();
        
        const subjectsList = root.ele('Subjects_List');
        allSubjects.forEach(subject => subjectsList.ele('Subject').ele('Name').txt(subject.name));
        subjectsList.up();
        
        // Simplificação: Nosso 'Curso' é o 'Year' e nossa 'Turma' é o 'Group'
        const studentsList = root.ele('Students_List');
        const courses = _.groupBy(Array.from(allStudentGroups.values()), sg => sg.course.toString());
        // ... Lógica para construir a hierarquia de Alunos (Year/Group/Subgroup) ...

        // Lista de Atividades (a parte mais complexa)
        const activitiesList = root.ele('Activities_List');
        let activityIdCounter = 1;
        activities.forEach(act => {
            // Lógica para 'divideTurma': cria duas atividades se a checkbox estiver marcada
            if (act.divideTurma) {
                // Atividade para Subgrupo 1
                const activity1 = activitiesList.ele('Activity');
                activity1.ele('Teacher').txt(act.teachers.map(t => t.name).join('; ')).up();
                activity1.ele('Subject').txt(act.subject.name).up();
                activity1.ele('Students').txt(`${act.studentGroup.name} Subgrupo 1`).up();
                activity1.ele('Duration').txt(act.aulasPorSemana).up();
                activity1.ele('Total_Duration').txt(act.aulasPorSemana).up();
                activity1.ele('Id').txt(activityIdCounter++).up();
                activity1.ele('Activity_Group_Id').txt(activityIdCounter).up(); // Agrupa com a próxima
                activity1.ele('Active').txt('true').up();
                
                // Atividade para Subgrupo 2
                const activity2 = activitiesList.ele('Activity');
                // ... preencher igual, mas com 'Subgrupo 2'
                activity2.ele('Id').txt(activityIdCounter++).up();
                activity2.ele('Activity_Group_Id').txt(activityIdCounter - 1).up();

            } else {
                // Atividade normal
                const activity = activitiesList.ele('Activity');
                activity.ele('Teacher').txt(act.teachers.map(t => t.name).join('; ')).up();
                activity.ele('Subject').txt(act.subject.name).up();
                activity.ele('Students').txt(act.studentGroup.name).up();
                activity.ele('Duration').txt(act.aulasPorSemana).up();
                activity.ele('Total_Duration').txt(act.aulasPorSemana).up();
                activity.ele('Id').txt(activityIdCounter++).up();
                activity.ele('Activity_Group_Id').txt(0).up(); // 0 = sem grupo
                activity.ele('Active').txt('true').up();
            }
        });
        activitiesList.up();

        // Lista de Restrições de Tempo
        const timeConstraintsList = root.ele('Time_Constraints_List');
        approvedRestrictions.forEach(restr => {
            restr.slots.forEach(slot => {
                if (slot.restrictionType === 'Bloqueado') {
                    const constraint = timeConstraintsList.ele('ConstraintTeacherNotAvailable');
                    constraint.ele('Teacher').txt(restr.teacher.name).up();
                    constraint.ele('Day').txt(slot.day).up();
                    constraint.ele('Hour').txt(slot.hour).up();
                }
            });
        });
        timeConstraintsList.up();
        
        // --- ETAPA 3: ENVIAR O ARQUIVO PARA O CLIENTE ---

        const xmlString = root.end({ prettyPrint: true });

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="horario_${distributionId}.fet"`);
        res.status(200).send(xmlString);

    } catch (error) {
        console.error("Erro na geração do arquivo FET:", error);
        res.status(500).send({ message: "Ocorreu um erro interno ao gerar o arquivo FET." });
    }
});


module.exports = router;