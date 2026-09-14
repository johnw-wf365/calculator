#!/bin/bash
# Calculator Platform — Production Server Setup
# Run as root on fresh Ubuntu 24.04 server

set -euo pipefail

echo "=== Calculator Platform Server Setup ==="

# Update system
apt-get update && apt-get upgrade -y

# Install essentials
apt-get install -y \
    curl \
    git \
    ufw \
    fail2ban \
    unattended-upgrades \
    jq \
    nginx \
    certbot \
    python3-certbot-nginx

# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure Fail2ban
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Enable automatic security updates
dpkg-reconfigure -plow unattended-upgrades

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install pnpm and PM2
npm install -g pnpm pm2

# Create deploy user
useradd -m -s /bin/bash deploy || true
usermod -aG sudo deploy

# Setup app directory
mkdir -p /opt/calculator
chown deploy:deploy /opt/calculator

# Setup logs
mkdir -p /var/log/calculator
chown deploy:deploy /var/log/calculator

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Create database and user (will be customized)
sudo -u postgres psql -c "CREATE USER calculator WITH PASSWORD 'CHANGE_ME';" || true
sudo -u postgres psql -c "CREATE DATABASE calculator OWNER calculator;" || true

# Setup Nginx
cp /path/to/nginx-security.conf /etc/nginx/sites-available/calculator
ln -sf /etc/nginx/sites-available/calculator /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup Let's Encrypt (will run after DNS is configured)
# certbot --nginx -d example.com -d www.example.com

# Setup PM2 startup
pm2 startup systemd -u deploy --hp /home/deploy

# Setup Sentry DSN (will be added once account is created)
# echo "SENTRY_DSN=https://example@sentry.io/123" >> /opt/calculator/.env

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Add SSH key to /home/deploy/.ssh/authorized_keys"
echo "2. Update nginx config with correct domain"
echo "3. Run certbot for SSL certificate"
echo "4. Configure PostgreSQL password in app .env"
echo "5. Push initial deploy via GitHub Actions"
