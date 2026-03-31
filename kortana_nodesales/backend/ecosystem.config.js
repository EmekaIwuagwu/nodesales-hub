module.exports = {
  apps: [
    {
      name:         "kortana-nodesale-api",
      script:       "src/index.js",
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: "512M",
      env_production: {
        NODE_ENV: "production",
        PORT:     4000,
      },
      error_file:  "logs/pm2-error.log",
      out_file:    "logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
