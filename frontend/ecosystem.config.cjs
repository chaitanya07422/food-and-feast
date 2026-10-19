module.exports = {
  apps: [
    {
      name: 'ff-web',
      cwd: '/home/ubuntu/apps/food-and-feast-web/current',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
};
