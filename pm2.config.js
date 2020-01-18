module.exports = {
  apps: [
    {
      name: 'indigo-node-server',
      script: './dist/app.js',
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      instances: 0,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      exec_mode: 'cluster',
    },
  ],
  // deploy: {
  //   production: {
  //     user: 'node',
  //     host: '212.83.163.1',
  //     ref: 'origin/master',
  //     repo: 'git@github.com:repo.git',
  //     path: '/var/www/production',
  //     'post-deploy':
  //       'npm install && pm2 reload ecosystem.config.js --env production',
  //   },
  // },
}
