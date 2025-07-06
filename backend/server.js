const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');



// Conectar ao banco de dados
connectDB();

const app = express();

// Middleware de segurança
app.use(helmet());

// Middleware de compressão
app.use(compression());

// Middleware de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em alguns minutos.'
  }
});

app.use('/api/', limiter);

const professorRoutes = require('./src/routes/professorRoutes');
const teacherRoutes = require('./src/routes/teacherRoutes'); // Nova linha
const activityRoutes = require('./src/routes/activityRoutes'); // Nova linha
const restrictionRoutes = require('./src/routes/restrictionRoutes'); // Nova linha
const exportRoutes = require('./src/routes/exportRoutes'); // Nova linha


// Rotas da API
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/courses', require('./src/routes/courseRoutes'));
app.use('/api/student-groups', require('./src/routes/studentGroupRoutes'));
app.use('/api/subjects', require('./src/routes/subjectRoutes'));
app.use('/api/rooms', require('./src/routes/roomRoutes'));
app.use('/api/professores', professorRoutes);
app.use('/api/teachers', teacherRoutes); // Nova linha
app.use('/api/activities', activityRoutes); // Nova linha
app.use('/api/restrictions', restrictionRoutes); // Nova linha
app.use('/api/export', exportRoutes); // Nova linha


// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Horários API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rotas da API
app.use('/api/auth', require('./src/routes/auth'));

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
});


// Tratamento de erros não capturados
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erro não tratado: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(`Exceção não capturada: ${err.message}`);
  process.exit(1);
});

module.exports = app;

