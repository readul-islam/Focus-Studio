module.exports = {
  apps: [
    {
      name: "techstyles-landing",
      script: "npm",
      args: "run dev -- -p 3005",
      cwd: "/Users/davidzeeman/Desktop/techstyles-landingPage",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3005,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
}
