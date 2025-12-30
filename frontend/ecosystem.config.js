module.exports = {
  apps: [
    {
      name: "wagen_chat",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3007 -H 127.0.0.1",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
