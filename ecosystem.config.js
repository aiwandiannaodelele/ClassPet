module.exports = {
  apps: [
    {
      name: 'classpet',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1, // 对于 SQLite 数据库，建议只开 1 个实例以避免并发写入锁死问题
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};