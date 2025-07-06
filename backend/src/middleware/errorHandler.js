const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error(err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: `Erro de validação: ${message}`
    };
  }

  // Erro de duplicação (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      statusCode: 400,
      message: `${field} '${value}' já existe`
    };
  }

  // Erro de ObjectId inválido
  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: 'ID inválido'
    };
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token inválido'
    };
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expirado'
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

