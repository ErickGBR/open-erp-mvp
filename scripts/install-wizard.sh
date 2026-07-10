#!/usr/bin/env bash
set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════╗"
echo "║       Open ERP Installer v1.0        ║"
echo "║   ERP System Setup               ║"
echo "║   Ubuntu Server Setup Wizard         ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# Check root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ Please run with sudo${NC}"
    exit 1
fi

# Step 1: Prerequisites
echo -e "\n${CYAN}[1/7]${NC} ${BOLD}Checking prerequisites...${NC}"
for cmd in curl git openssl; do
    if ! command -v "$cmd" &>/dev/null; then
        echo -e "  ${YELLOW}⚠ Installing ${cmd}...${NC}"
        apt-get install -y "$cmd" >/dev/null 2>&1
    fi
done
echo -e "  ${GREEN}✅ All prerequisites satisfied${NC}"

# Step 2: Docker
echo -e "\n${CYAN}[2/7]${NC} ${BOLD}Installing Docker...${NC}"
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | bash >/dev/null 2>&1
    systemctl enable docker >/dev/null 2>&1
    systemctl start docker >/dev/null 2>&1
    echo -e "  ${GREEN}✅ Docker installed${NC}"
else
    echo -e "  ${GREEN}✅ Docker already installed${NC}"
fi

# Step 3: Configuration
echo -e "\n${CYAN}[3/7]${NC} ${BOLD}Configuring environment...${NC}"
SERVER_IP=$(ip route get 1 | awk '{print $NF;exit}')
read -p "  Server domain/IP [${SERVER_IP}]: " DOMAIN
DOMAIN=${DOMAIN:-$SERVER_IP}

# PostgreSQL
echo ""
echo -e "  ${YELLOW}PostgreSQL:${NC}"
read -p "  Use existing PostgreSQL? (y/N): " DB_EXISTING
if [[ "$DB_EXISTING" =~ ^[Yy]$ ]]; then
    read -p "  Host [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    read -p "  Port [5432]: " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    read -p "  Database [openerp]: " DB_NAME
    DB_NAME=${DB_NAME:-openerp}
    read -p "  Username [openerp]: " DB_USER
    DB_USER=${DB_USER:-openerp}
    read -s -p "  Password: " DB_PASS
    echo ""
else
    DB_HOST="postgres"
    DB_PORT="5432"
    DB_NAME="openerp"
    DB_USER="openerp"
    DB_PASS=$(openssl rand -hex 16)
    echo -e "  ${GREEN}✅ PostgreSQL will be created in Docker${NC}"
fi

# Redis
echo ""
echo -e "  ${YELLOW}Redis:${NC}"
read -p "  Use existing Redis? (y/N): " REDIS_EXISTING
if [[ "$REDIS_EXISTING" =~ ^[Yy]$ ]]; then
    read -p "  Host [localhost]: " REDIS_HOST
    REDIS_HOST=${REDIS_HOST:-localhost}
    read -p "  Port [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}
else
    REDIS_HOST="redis"
    REDIS_PORT="6379"
    echo -e "  ${GREEN}✅ Redis will be created in Docker${NC}"
fi

JWT_SECRET=$(openssl rand -hex 32)
echo -e "\n  ${GREEN}✅ Configuration generated${NC}"

# Step 4: Clone
echo -e "\n${CYAN}[4/7]${NC} ${BOLD}Installing Open ERP...${NC}"
INSTALL_DIR="/opt/openerp"
if [[ -d "$INSTALL_DIR" ]]; then
    rm -rf "$INSTALL_DIR"
fi
git clone --depth 1 https://github.com/ErickGBR/run-mvp.git "$INSTALL_DIR" >/dev/null 2>&1
echo -e "  ${GREEN}✅ Repository cloned to ${INSTALL_DIR}${NC}"

# Create .env
cat > "${INSTALL_DIR}/.env" << EOF
NODE_ENV=production

# PostgreSQL
POSTGRES_DB=${DB_NAME:-openerp}
POSTGRES_USER=${DB_USER:-openerp}
POSTGRES_PASSWORD=${DB_PASS}
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}

# Redis
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=1d

# Frontend
FRONTEND_URL=http://${DOMAIN}:3000

# App mode — when true, landing page is skipped, redirect to setup/login
DISABLE_LANDING=true

# OAuth — Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://${DOMAIN}:3001/api/auth/google/callback

# OAuth — Microsoft 365
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_CALLBACK_URL=http://${DOMAIN}:3001/api/auth/microsoft/callback
EOF
echo -e "  ${GREEN}✅ Environment configured${NC}"

# Step 5: Start services
echo -e "\n${CYAN}[5/7]${NC} ${BOLD}Starting Docker services...${NC}"
cd "$INSTALL_DIR"
docker compose up --build -d >/dev/null 2>&1
echo -e "  ${YELLOW}⏳ Waiting for services...${NC}"
sleep 15
echo -e "  ${GREEN}✅ Services started${NC}"

# Install systemd service
cat > /etc/systemd/system/openerp.service << 'SVC'
[Unit]
Description=Open ERP Service
Requires=docker.service
After=docker.service
[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/openerp
ExecStart=/usr/bin/docker compose up --build -d
ExecStop=/usr/bin/docker compose down
StandardOutput=journal
StandardError=journal
[Install]
WantedBy=multi-user.target
SVC
systemctl daemon-reload >/dev/null 2>&1
systemctl enable openerp.service >/dev/null 2>&1
echo -e "  ${GREEN}✅ Auto-start configured${NC}"

# Step 6: Complete
echo -e "\n${CYAN}[6/7]${NC} ${BOLD}Finalizing...${NC}"
echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════╗"
echo "║  ✅ Installation Complete!           ║"
echo "╠══════════════════════════════════════╣"
echo -e "║  🌐 Frontend:  http://${DOMAIN}:3000     ║"
echo -e "║  🔌 API:       http://${DOMAIN}:3001     ║"
echo -e "║  🗄️ Database:  ${DB_HOST}:${DB_PORT}           ║"
echo -e "║  📦 Redis:     ${REDIS_HOST}:${REDIS_PORT}           ║"
echo "╠══════════════════════════════════════╣"
echo "║  📁 Path:      /opt/openerp         ║"
echo "║  ⚙️ Config:    /opt/openerp/.env    ║"
echo "╠══════════════════════════════════════╣"
echo "║  🔐 DB Password: ${DB_PASS}║"
echo "║  🔐 JWT Secret:  ${JWT_SECRET:0:16}...    ║"
echo "║  🚀 First run → setup wizard              ║"
echo "╠══════════════════════════════════════╣"
echo "║  🚀 Auto-start: enabled             ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"
