module.exports = {
    apps: [
      {
        name: "daftaros",
        script: "npm",
        args: "start",
        env: {
          NODE_ENV: "production",
          PORT: 3000,
        },
        instances: 1,
        autorestart: true,
        watch: false,
        error_file: "/home/ubuntu/pm2-logs/daftaros-error.log",
        out_file: "/home/ubuntu/pm2-logs/daftaros-out.log",
        merge_logs: true,
      },
      {
        name: "chunks_merger",
        script: "workers/chunks_merger/worker.js",
        env: {
          NODE_ENV: "production",
        },
        instances: 1,
        autorestart: true,
        watch: false,
        error_file: "/home/ubuntu/pm2-logs/chunks_merger-error.log",
        out_file: "/home/ubuntu/pm2-logs/chunks_merger-out.log",
        merge_logs: true,
      },
      {
        name: "compression_worker",
        script: "workers/compression/worker.js",
        env: {
          NODE_ENV: "production",
        },
        instances: 1,
        autorestart: true,
        watch: false,
        error_file: "/home/ubuntu/pm2-logs/compression-error.log",
        out_file: "/home/ubuntu/pm2-logs/compression-out.log",
        merge_logs: true,
      },
      {
        name: "notifications_worker",
        script: "workers/notifications/worker.js",
        env: {
          NODE_ENV: "production",
        },
        instances: 1,
        autorestart: true,
        watch: false,
        error_file: "/home/ubuntu/pm2-logs/notifications-error.log",
        out_file: "/home/ubuntu/pm2-logs/notifications-out.log",
        merge_logs: true,
      }
    ]
  };
  