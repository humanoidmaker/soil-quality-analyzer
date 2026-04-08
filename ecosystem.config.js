module.exports = {
  apps: [
    {
      name: "soil-quality-analyzer-backend",
      cwd: "./backend",
      script: "uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 8000",
      interpreter: "python3",
      env: {
        MONGODB_URI: "mongodb://localhost:27017/soil_quality_analyzer",
        JWT_SECRET: "change-in-production",
        CORS_ORIGINS: "http://localhost:3000",
        CUDA_VISIBLE_DEVICES: "0",
      },
      max_restarts: 10,
    },
    {
      name: "soil-quality-analyzer-frontend",
      cwd: "./frontend",
      script: "npx",
      args: "vite --host 0.0.0.0 --port 3000",
      env: { PORT: 3000 },
      max_restarts: 10,
    },
  ],
};
