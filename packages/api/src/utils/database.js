const mongoose = require('mongoose');
const logger = require('./logger');

// Detectar ambiente serverless
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

const connectDB = async () => {
  try {
    // Opções otimizadas para serverless
    const options = {
      maxPoolSize: isServerless ? 10 : 50, // Pool menor em serverless
      minPoolSize: isServerless ? 2 : 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Força IPv4 (mais rápido no Vercel)
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`📦 MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('Erro ao conectar MongoDB:', error.message);

    // Em serverless, não fazer process.exit - deixar a função falhar graciosamente
    if (!isServerless) {
      process.exit(1);
    }

    throw error; // Propagar erro para o middleware lidar
  }
};

// Eventos de conexão
mongoose.connection.on('connected', () => {
  logger.info('✅ Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ Erro na conexão Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('⚠️ Mongoose desconectado');
});

// Fechar conexão graciosamente (apenas em ambientes tradicionais)
if (!isServerless) {
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('🔌 Conexão MongoDB fechada devido ao término da aplicação');
    process.exit(0);
  });
}

module.exports = connectDB;
