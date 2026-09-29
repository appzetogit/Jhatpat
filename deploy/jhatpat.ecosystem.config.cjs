/**
 * pm2 config for the jhatpat (food + taxi) production instance.
 *
 * Isolated from every other app on this box:
 *   name  jhatpat-backend   (port 5040, not used by anything else)
 *   cwd   /root/jhatpat/Backend
 *   db    dedicated database — set in Backend/.env's MONGODB_URI path
 *   uploads  /var/www/jhatpat-uploads (NOT the shared /var/www/uploads)
 *
 * Fork mode, single instance: this box is RAM-constrained (~1.8G free across
 * 30+ existing pm2 apps), and food/taxi here don't need cluster mode to start.
 *
 * Start:   pm2 start deploy/jhatpat.ecosystem.config.cjs
 * Reload:  pm2 reload jhatpat-backend
 * Never:   pm2 delete all / pm2 kill / pm2 restart all  <- would take down every other project
 */
module.exports = {
  apps: [
    {
      name: 'jhatpat-backend',
      cwd: '/root/jhatpat/Backend',
      script: 'server.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '20s',
      max_memory_restart: '450M',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5040
      },
      error_file: '/var/log/pm2/jhatpat-backend.error.log',
      out_file: '/var/log/pm2/jhatpat-backend.out.log',
      merge_logs: true,
      time: true,
      kill_timeout: 12000
    }
  ]
};
