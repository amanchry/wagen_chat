


Show all listening ports
sudo lsof -i -P -n | grep LISTEN



- Install dependencies
npm install


- Start Next JS Project using PM2 process
PORT=3007 pm2 start npm --name "wagen_chat" -- start
HOST=127.0.0.1 PORT=3007 pm2 start npm --name "wagen_chat" -- start

Or if ecosystem.config.js exist
pm2 start ecosystem.config.js



- Check status:
pm2 status
pm2 logs wagen_chat







- Update code from GitHub
git pull origin main
git pull --no-rebase --no-autostash origin main
 
- Reinstall dependencies (if needed)
npm install

- Rebuild Next.js
npm run build

- Stop PM2 process
pm2 stop wagen_chat




- Restart PM2 process
pm2 restart wagen_chat





Check all PM2 processes:
pm2 list


Delete the errored one:
pm2 delete 0


(or use the name if needed)
pm2 delete wagen_chat


Then restart the good one if needed:
pm2 restart wagen_chat

If you’re unsure which is which
Run:
pm2 logs 0
pm2 logs 1