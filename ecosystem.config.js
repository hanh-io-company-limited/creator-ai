module.exports = {
  apps: [{
    name: 'creator-ai',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    min_uptime: '10s',
    max_restarts: 10,
    cron_restart: '0 2 * * *' // Restart every day at 2 AM for maintenance
  }]
};