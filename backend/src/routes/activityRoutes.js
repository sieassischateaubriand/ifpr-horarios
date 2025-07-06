const express = require('express');
const Activity = require('../models/Activity');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();


// Middleware de autenticação para todas as rotas
router.use(authenticate);


// ROTA PRINCIPAL: BUSCAR ATIVIDADES POR ID DA DISTRIBUIÇÃO
// Ex: GET /api/activities/by-distribution/2025.2-TGC
router.get('/by-distribution/:distributionId', async (req, res) => {
    try {
        const activities = await Activity.find({ distributionId: req.params.distributionId })
            .populate('subject', 'name')
            .populate('studentGroup', 'name')
            .populate('teachers', 'name'); // Popula todos os nomes!
        res.status(200).send(activities);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar atividades", error: error.message });
    }
});

// Rota para criar/atualizar um bloco de atividades
router.post('/bulk-update', async (req, res) => {
    const { activities, distributionId } = req.body;
    
    try {
        // Deleta todas as atividades antigas daquela distribuição
        await Activity.deleteMany({ distributionId: distributionId });

        // Insere as novas atividades
        if(activities && activities.length > 0) {
            const activitiesWithDistribution = activities.map(act => ({
                ...act,
                distributionId: distributionId,
            }));
            await Activity.insertMany(activitiesWithDistribution);
        }
        
        res.status(201).send({ message: 'Distribuição salva com sucesso!' });

    } catch (error) {
        res.status(400).send({ message: "Erro ao salvar distribuição", error: error.message });
    }
});

module.exports = router;
