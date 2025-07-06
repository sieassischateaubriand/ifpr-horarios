const express = require('express');
const TeacherRestriction = require('../models/TeacherRestriction');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();


// Middleware de autenticação para todas as rotas
router.use(authenticate);



// ROTA PARA O COORDENADOR LISTAR TODAS AS RESTRIÇÕES DE UMA DISTRIBUIÇÃO
// GET /api/restrictions/by-distribution/distributionId
router.get('/by-distribution/:distributionId', async (req, res) => {
    try {
        const { distributionId } = req.params;
        const restrictions = await TeacherRestriction.find({ distributionId })
            .populate('teacher', 'name'); // Traz o nome do professor junto!
        res.status(200).send(restrictions);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao listar restrições por distribuição.', error: error.message });
    }
});

// ROTA PARA O COORDENADOR ATUALIZAR O STATUS DE UMA RESTRIÇÃO
// PATCH /api/restrictions/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const restriction = await TeacherRestriction.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!restriction) {
            return res.status(404).send({ message: 'Restrição não encontrada.' });
        }
        res.status(200).send(restriction);
    } catch (error) {
        res.status(400).send({ message: 'Erro ao atualizar status da restrição.', error: error.message });
    }
});


// ROTA PARA O PROFESSOR BUSCAR SUA RESTRIÇÃO
// GET /api/restrictions/by-teacher/teacherId/distributionId
router.get('/by-teacher/:teacherId/:distributionId', async (req, res) => {
  try {
    const { teacherId, distributionId } = req.params;
    const restriction = await TeacherRestriction.findOne({ teacher: teacherId, distributionId });
    if (!restriction) {
      // Se não existe, retorna um objeto vazio para o frontend saber que é uma nova restrição
      return res.status(200).send({ status: 'Rascunho', slots: [], observations: '' });
    }
    res.status(200).send(restriction);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar restrições.', error: error.message });
  }
});

// ROTA PARA O PROFESSOR SALVAR/ENVIAR SUA RESTRIÇÃO (UPSERT)
// POST /api/restrictions
router.post('/', async (req, res) => {
  const { teacher, distributionId, status, slots, observations } = req.body;

  try {
    const restriction = await TeacherRestriction.findOneAndUpdate(
      { teacher, distributionId }, // Critério de busca
      { status, slots, observations }, // Dados para atualizar/inserir
      {
        new: true, // Retorna o novo documento
        upsert: true, // Cria se não encontrar
        runValidators: true,
      }
    );
    res.status(200).send(restriction);
  } catch (error) {
    res.status(400).send({ message: 'Erro ao salvar restrição.', error: error.message });
  }
});

module.exports = router;
