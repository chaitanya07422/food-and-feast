module.exports = {
  apps: [
    {
      name: 'ff-api',
      cwd: '/home/ubuntu/apps/food-and-feast-api/current',
      script: 'dist/main.js',
      // Load shared/.env into process.env so Multer/Config see MAX_UPLOAD_BYTES etc.
      env_file: '/home/ubuntu/apps/food-and-feast-api/shared/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        MAX_UPLOAD_BYTES: '20971520',
      },
    },
  ],
};
