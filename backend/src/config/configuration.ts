export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-and-feast',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-only-insecure-secret',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES ?? '5242880', 10),
});
