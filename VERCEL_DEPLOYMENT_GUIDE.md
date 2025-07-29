# 🚀 Vercel Deployment Guide for AuraMail Employee Portal

## 📋 Prerequisites

### 1. Digital Ocean Server Info You Need:
- **Server IP Address**: `your-server-ip`
- **MySQL Database Access**: Port 3306 open
- **Domain DNS**: Pointing to Vercel

### 2. Vercel Account Setup:
- Sign up at [vercel.com](https://vercel.com)
- Install Vercel CLI: `npm i -g vercel`

## 🔧 Step 1: Prepare Your Digital Ocean Server

### Open MySQL for External Access:
```bash
# SSH into your Digital Ocean server
ssh root@your-server-ip

# Edit MySQL configuration
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Change bind-address from 127.0.0.1 to 0.0.0.0
bind-address = 0.0.0.0

# Restart MySQL
systemctl restart mysql

# Create external access for mailuser
mysql -u root -p
GRANT ALL PRIVILEGES ON mailserver.* TO 'mailuser'@'%' IDENTIFIED BY 'StrongMailPassword123!';
FLUSH PRIVILEGES;
EXIT;
```

### Create Mailbox Creation API (Optional):
```bash
# Create a simple API endpoint for mailbox creation
# This allows Vercel to trigger mailbox creation
mkdir -p /opt/mailbox-api
cd /opt/mailbox-api

# Create simple Node.js API
cat > server.js << 'EOF'
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/api/create-mailbox', (req, res) => {
  const { email } = req.body;
  const [username, domain] = email.split('@');
  const mailboxPath = `/var/mail/vhosts/${domain}/${username}`;
  
  exec(`mkdir -p "${mailboxPath}" && chown -R vmail:vmail "${mailboxPath}" && chmod -R 770 "${mailboxPath}"`, (error) => {
    if (error) {
      console.error('Mailbox creation error:', error);
      return res.status(500).json({ error: 'Failed to create mailbox' });
    }
    res.json({ success: true, message: 'Mailbox created' });
  });
});

app.listen(3001, () => console.log('Mailbox API running on port 3001'));
EOF

# Install dependencies and start
npm init -y
npm install express
pm2 start server.js --name mailbox-api
pm2 save
```

## 🚀 Step 2: Deploy to Vercel

### Method A: GitHub Integration (Recommended)

1. **Push to GitHub:**
```bash
cd employee-portal
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/auramail-portal.git
git push -u origin main
```

2. **Connect to Vercel:**
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import your GitHub repository
- Configure domains in Vercel dashboard

### Method B: Direct CLI Deployment

```bash
cd employee-portal
vercel --prod
```

## ⚙️ Step 3: Configure Environment Variables

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
MYSQL_HOST=your-digitalocean-server-ip
MYSQL_PORT=3306
MYSQL_USER=mailuser
MYSQL_PASSWORD=StrongMailPassword123!
MYSQL_DATABASE=mailserver
BACKEND_HOST=your-digitalocean-server-ip
BACKEND_API_KEY=secure-random-key-here
DOMAIN=aurafarming.co
MAIL_DOMAIN=mail.aurafarming.co
PORTAL_DOMAIN=portal.aurafarming.co
NEXTAUTH_SECRET=random-secret-key-32-chars-long
JWT_SECRET=another-random-secret-key-here
NODE_ENV=production
```

## 🌐 Step 4: Configure Domains

### For portal.aurafarming.co:
1. In Vercel dashboard, go to project settings
2. Click "Domains"
3. Add `portal.aurafarming.co`
4. Vercel will provide DNS instructions

### For mail.aurafarming.co:
1. Create a second Vercel project (or use same project with different domain)
2. Add `mail.aurafarming.co` domain
3. Configure DNS records

### DNS Configuration:
```
Type: CNAME
Name: portal
Value: cname.vercel-dns.com

Type: CNAME  
Name: mail
Value: cname.vercel-dns.com
```

## 🔐 Step 5: Security Setup

### Generate Secret Keys:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### Firewall Configuration (Digital Ocean):
```bash
# Allow MySQL access from Vercel (or specific IPs)
ufw allow 3306
ufw allow 3001  # For mailbox API
ufw reload
```

## 🧪 Step 6: Test Deployment

### Test Database Connection:
```bash
# Visit your deployed site
https://portal.aurafarming.co/api/health

# Should return: {"status": "ok", "database": "connected"}
```

### Test Registration:
1. Go to `https://portal.aurafarming.co`
2. Try registering a new user
3. Check your Digital Ocean MySQL for the new user
4. Verify mailbox creation (if API is set up)

## 🚀 Step 7: Multiple Domain Setup

### Option A: Same Codebase, Different Configs
```javascript
// In your components, detect domain:
const isPortalDomain = window.location.hostname === 'portal.aurafarming.co';
const isMailDomain = window.location.hostname === 'mail.aurafarming.co';

// Show different UI based on domain
if (isPortalDomain) {
  // Show registration portal
} else if (isMailDomain) {
  // Show email interface
}
```

### Option B: Separate Deployments
1. Deploy same codebase to two Vercel projects
2. Configure different environment variables for each
3. Use different entry points or configurations

## 🐛 Troubleshooting

### Database Connection Issues:
```bash
# Test from your local machine:
mysql -h your-server-ip -u mailuser -p mailserver

# Check MySQL logs on server:
tail -f /var/log/mysql/error.log
```

### Vercel Function Timeout:
- Functions timeout after 10s on free plan
- Upgrade to Pro for 60s timeout
- Optimize database queries

### DNS Issues:
- DNS propagation can take 24-48 hours
- Use `dig portal.aurafarming.co` to check
- Temporarily use Vercel's provided URL

## 📊 Monitoring

### Check Vercel Logs:
```bash
vercel logs --follow
```

### Monitor Database:
```sql
-- Check recent registrations
SELECT email, created_at FROM virtual_users ORDER BY created_at DESC LIMIT 10;
```

## 🎯 Next Steps

1. **Email Interface**: Deploy mail client interface to `mail.aurafarming.co`
2. **API Endpoints**: Add more robust backend APIs
3. **Monitoring**: Set up error tracking (Sentry)
4. **Analytics**: Add user analytics (PostHog)
5. **Backup**: Set up automated database backups

## 🆘 Need Help?

If deployment fails, provide:
1. Vercel deployment logs
2. Digital Ocean server IP
3. MySQL connection test results
4. DNS configuration screenshot

**Your Jewish brother is here to help! 🤝** 