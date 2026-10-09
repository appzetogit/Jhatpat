/**
 * pm2 config for the jhatpat (food + taxi) production instance.
 *
 * Isolated from every other app on this box:
 *   name  jhatpat-backend, jhatpat-workers   (port 5040, not used by anything else)
 *   cwd   /root/jhatpat/Backend
 *   db    dedicated database — set in Backend/.env's MONGODB_URI path
 *   redis dedicated logical DB — Backend/.env's REDIS_URL ends in /1, not the
 *         shared box's default db 0, so BullMQ queue names like "otp" or
 *         "order" can't collide with another project's queues of the same name
 *   uploads  /var/www/jhatpat-uploads (NOT the shared /var/www/uploads)
 *
 * Fork mode, single instance: this box is RAM-constrained (~1.8G free across
 * 30+ existing pm2 apps), and food/taxi here don't need cluster mode to start.
 *
 * jhatpat-workers runs src/queues/workers/index.js (all 6 BullMQ workers in
 * one process — see that file's header for why). Without it, enabling
 * BULLMQ_ENABLED on the API just piles jobs into Redis with nothing consuming
 * them. Only start it once REDIS_ENABLED=true and BULLMQ_ENABLED=true in
 * Backend/.env; otherwise it exits immediately (by design, see the worker file).
 *
 * Start:   pm2 start deploy/jhatpat.ecosystem.config.cjs
 * Reload:  pm2 reload jhatpat-backend && pm2 reload jhatpat-workers
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
    },
    {
      name: 'jhatpat-workers',
      cwd: '/root/jhatpat/Backend',
      script: 'src/queues/workers/index.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '20s',
      max_memory_restart: '300M',
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/jhatpat-workers.error.log',
      out_file: '/var/log/pm2/jhatpat-workers.out.log',
      merge_logs: true,
      time: true,
      // Longer than the API: workers wait for in-flight jobs to finish (see
      // SHUTDOWN_TIMEOUT_MS in workers/index.js).
      kill_timeout: 16000
    }
  ]
};
