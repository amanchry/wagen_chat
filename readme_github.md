1. Generate a new SSH key on your server:
ssh-keygen -t ed25519 -C "your-email@example.com"

2. Copy your public key:
cat ~/.ssh/id_ed25519.pub

3. Add this key to GitHub:
Go to GitHub → Settings → SSH and GPG keys
Click New SSH key → paste the public key.

4. Test connection:
ssh -T git@github.com

5. Clone using SSH instead of HTTPS:
git clone git@github.com:amanchry/wagen_chat.git




Show all listening ports
sudo lsof -i -P -n | grep LISTEN



- Install dependencies
npm install


- Start Next JS Project using PM2 process
PORT=3007 pm2 start npm --name "wagen_chat" -- start


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