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
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES ?? '20971520', 10),
  publicApiOrigin:
    process.env.PUBLIC_API_ORIGIN ??
    `http://localhost:${process.env.PORT ?? '4000'}`,
  /** When true (production behind nginx), trust X-Forwarded-* for HTTPS cookies. */
  trustProxy:
    process.env.TRUST_PROXY === 'true' ||
    process.env.TRUST_PROXY === '1' ||
    process.env.NODE_ENV === 'production',
  storageDriver: (process.env.STORAGE_DRIVER ?? 'local').toLowerCase(),
  adminBootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL ?? '',
  adminBootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD ?? '',
  oci: {
    namespace: process.env.OCI_NAMESPACE ?? '',
    bucket: process.env.OCI_BUCKET ?? '',
    region: process.env.OCI_REGION ?? '',
    configFile: process.env.OCI_CONFIG_FILE ?? '',
    profile: process.env.OCI_PROFILE ?? 'DEFAULT',
    keyPrefix: process.env.OCI_KEY_PREFIX ?? 'food-and-feast',
  },
});
