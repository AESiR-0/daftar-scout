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
      }
    ]
  };
  