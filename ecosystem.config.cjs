module.exports = {
  apps: [
    {
      name: 'calculator',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/opt/calculator',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/calculator/error.log',
      out_file: '/var/log/calculator/out.log',
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
