module.exports = {
  apps: [
    {
      name: 'ff-web',
      cwd: '/home/ubuntu/apps/food-and-feast-web/current',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // 0.0.0.0 so Nginx Proxy Manager (Docker) can reach the host via the bridge IP
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
