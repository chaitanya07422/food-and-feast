module.exports = {
  apps: [
    {
      name: 'ff-api',
      cwd: '/home/ubuntu/apps/food-and-feast-api/current',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
