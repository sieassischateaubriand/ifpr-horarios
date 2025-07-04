const express = require('express');
const ProfessorModel = require('../models/Professor');
const MDXProcessor = require('../services/MDXProcessor');

const router = express.Router();
const professorModel = new ProfessorModel();
const mdxProcessor = new MDXProcessor();

// Rota para listar todos os professores
router.get('/professores', async (req, res) => {
    try {
        const professores = await professorModel.getAllProfessores();
        res.json(professores);
    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para buscar horários de um professor específico
router.get('/professores/:professorId/horarios', async (req, res) => {
    try {
        const { professorId } = req.params;
        const horarios = await professorModel.getHorariosByProfessor(professorId);
        res.json(horarios);
    } catch (error) {
        console.error('Erro ao buscar horários:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para iniciar processamento dos arquivos MDX
router.post('/processar-mdx', async (req, res) => {
    try {
        const status = mdxProcessor.getProcessingStatus();
        
        if (status.is_processing) {
            return res.status(400).json({ 
                error: 'Processamento já em andamento' 
            });
        }

        const { versao = '2025.1.8' } = req.body;

        // Iniciar processamento em background
        setImmediate(() => {
            mdxProcessor.processVersionFolder(versao);
        });

        res.json({ 
            message: `Processamento iniciado para versão ${versao}` 
        });

    } catch (error) {
        console.error('Erro ao iniciar processamento:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para verificar status do processamento
router.get('/status-processamento', (req, res) => {
    try {
        const status = mdxProcessor.getProcessingStatus();
        res.json(status);
    } catch (error) {
        console.error('Erro ao buscar status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota de teste
router.get('/test', (req, res) => {
    res.json({ 
        message: 'API funcionando!', 
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;

