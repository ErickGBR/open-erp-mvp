#!/usr/bin/env bash
#
# Open ERP — Ubuntu Server Installer
# Interactive wizard with whiptail dialogs
#

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

VERSION="1.0.0"
INSTALL_DIR="/opt/openerp"
REPO_URL="https://github.com/ErickGBR/run-mvp.git"

# ── Whiptail helper ──
welcome() {
    whiptail --title "Open ERP v${VERSION} Installer" \
        --msgbox "\nWelcome to Open ERP Installer!\n\n\
Open-source Enterprise Resource Planning system.\n\n\
Stack: NestJS + Next.js + PostgreSQL + Redis + Docker\n\
This wizard will guide you through the installation.\n\
Estimated time: 2-5 minutes" 15 60
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ This installer must be run as root (sudo).${NC}"
        exit 1
    fi
}

check_prerequisites() {
    local missing=""
    
    # Check Docker
    if ! command -v docker &>/dev/null; then
        missing="${missing}  - Docker (will be installed)\n"
    fi
    
    # Check Docker Compose
    if ! docker compose version &>/dev/null 2>&1; then
        missing="${missing}  - Docker Compose (will be installed)\n"
    fi
    
    # Check Git
    if ! command -v git &>/dev/null; then
        missing="${missing}  - Git (will be installed)\n"
    fi
    
    # Check ports
    for port in 3000 3001 5432; do
        if ss -tlnp | grep -q ":$port "; then
            echo -e "${YELLOW}⚠ Port $port is in use by another service${NC}"
        fi
    done
    
    if [[ -n "$missing" ]]; then
        whiptail --title "Prerequisites" \
            --yesno "The following will be installed:\n${missing}\n\nContinue?" 12 60
    fi
}

install_docker() {
    echo -e "${CYAN}📦 Installing Docker...${NC}"
    if ! command -v docker &>/dev/null; then
        curl -fsSL https://get.docker.com | bash
        systemctl enable docker
        systemctl start docker
    fi
    echo -e "${GREEN}✅ Docker ready${NC}"
}

configure_environment() {
    local DB_PASS=$(openssl rand -hex 16)
    local JWT_SECRET=$(openssl rand -hex 32)
    local SERVER_IP=$(ip route get 1 | awk '{print $NF;exit}')
    
    # Globals for show_completion
    DB_HOST="postgres"
    DB_PORT="5432"
    DB_USER="openerp"
    REDIS_HOST="redis"
    REDIS_PORT="6379"
    
    local DOMAIN=$(whiptail --title "Configuration" \
        --inputbox "\nEnter your server domain or IP address:\n(default: ${SERVER_IP})" \
        10 60 "${SERVER_IP}" 3>&1 1>&2 2>&3)
    
    # ── PostgreSQL Configuration ──
    local DB_MODE="docker"
    if whiptail --title "PostgreSQL Database" \
        --yesno "How would you like to configure PostgreSQL?\n\n\
Choose YES → Create new PostgreSQL in Docker (recommended)\n\
Choose NO  → Use an existing PostgreSQL instance" \
        12 60; then
        DB_MODE="docker"
    else
        DB_MODE="existing"
    fi
    
    DB_NAME="openerp"
    DB_HOST="postgres"
    DB_PORT="5432"
    DB_USER="openerp"
    
    if [[ "$DB_MODE" == "existing" ]]; then
        DB_HOST=$(whiptail --title "PostgreSQL — Existing Instance" \
            --inputbox "\nPostgreSQL Host:" 8 40 "localhost" 3>&1 1>&2 2>&3)
        DB_PORT=$(whiptail --title "PostgreSQL — Existing Instance" \
            --inputbox "\nPostgreSQL Port:" 8 40 "5432" 3>&1 1>&2 2>&3)
        DB_NAME=$(whiptail --title "PostgreSQL — Existing Instance" \
            --inputbox "\nDatabase name:" 8 40 "openerp" 3>&1 1>&2 2>&3)
        DB_USER=$(whiptail --title "PostgreSQL — Existing Instance" \
            --inputbox "\nUsername:" 8 40 "openerp" 3>&1 1>&2 2>&3)
        DB_PASS=$(whiptail --title "PostgreSQL — Existing Instance" \
            --passwordbox "\nPassword:" 8 40 3>&1 1>&2 2>&3)
    fi
    
    # ── Redis Configuration ──
    local REDIS_MODE="docker"
    if whiptail --title "Redis Cache" \
        --yesno "How would you like to configure Redis?\n\n\
Choose YES → Create new Redis in Docker (recommended)\n\
Choose NO  → Use an existing Redis instance" \
        12 60; then
        REDIS_MODE="docker"
    else
        REDIS_MODE="existing"
    fi
    
    REDIS_HOST="redis"
    REDIS_PORT="6379"
    
    if [[ "$REDIS_MODE" == "existing" ]]; then
        REDIS_HOST=$(whiptail --title "Redis — Existing Instance" \
            --inputbox "\nRedis Host:" 8 40 "localhost" 3>&1 1>&2 2>&3)
        REDIS_PORT=$(whiptail --title "Redis — Existing Instance" \
            --inputbox "\nRedis Port:" 8 40 "6379" 3>&1 1>&2 2>&3)
    fi
    
    # ── OAuth Configuration ──
    whiptail --title "OAuth Configuration" \
        --msgbox "You can configure OAuth providers later in /opt/openerp/.env\n\n\
- Google OAuth: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET\n\
- Microsoft 365: MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET" 12 60
    
    # Create .env
    cat > /tmp/openerp.env << EOF
NODE_ENV=production

# PostgreSQL
POSTGRES_DB=${DB_NAME}
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASS}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}

# Redis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}

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
    
    echo -e "${GREEN}✅ Configuration generated${NC}"
    
    echo "$DB_PASS" > /tmp/openerp-db-pass.txt
    echo "$JWT_SECRET" > /tmp/openerp-jwt-secret.txt
}

clone_repository() {
    echo -e "${CYAN}📥 Cloning Open ERP...${NC}"
    
    if [[ -d "${INSTALL_DIR}" ]]; then
        whiptail --title "Existing Installation" \
            --yesno "Directory ${INSTALL_DIR} already exists.\n\nOverwrite it?" 10 60
        rm -rf "${INSTALL_DIR}"
    fi
    
    git clone --depth 1 "${REPO_URL}" "${INSTALL_DIR}"
    echo -e "${GREEN}✅ Repository cloned${NC}"
}

copy_env() {
    cp /tmp/openerp.env "${INSTALL_DIR}/.env"
    rm -f /tmp/openerp.env
    echo -e "${GREEN}✅ Environment configured${NC}"
}

start_services() {
    echo -e "${CYAN}🐳 Starting Docker services...${NC}"
    cd "${INSTALL_DIR}"
    docker compose up --build -d
    
    echo -e "${CYAN}⏳ Waiting for services to be ready...${NC}"
    sleep 15
    
    # Check health
    local attempts=0
    while [[ $attempts -lt 30 ]]; do
        if docker compose ps 2>/dev/null | grep -q "healthy"; then
            break
        fi
        sleep 2
        ((attempts++))
    done
    
    echo -e "${GREEN}✅ Services started${NC}"
}

install_systemd_service() {
    cat > /etc/systemd/system/openerp.service << 'EOF'
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
EOF
    
    systemctl daemon-reload
    systemctl enable openerp.service
    echo -e "${GREEN}✅ Systemd service installed (auto-start on boot)${NC}"
}

show_completion() {
    local DB_PASS=$(cat /tmp/openerp-db-pass.txt 2>/dev/null || echo "check .env")
    local JWT_SECRET=$(cat /tmp/openerp-jwt-secret.txt 2>/dev/null || echo "check .env")
    rm -f /tmp/openerp-db-pass.txt /tmp/openerp-jwt-secret.txt
    
    local SERVER_IP=$(ip route get 1 | awk '{print $NF;exit}')
    
    whiptail --title "✅ Installation Complete!" \
        --msgbox "\nOpen ERP is now running!\n\n\
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\
🌐 Frontend:  http://${SERVER_IP}:3000\n\
🔌 API:       http://${SERVER_IP}:3001\n\
🗄️ Database:  ${DB_HOST}:${DB_PORT}\n\
📦 Redis:     ${REDIS_HOST}:${REDIS_PORT}\n\
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n\
📁 Installation: ${INSTALL_DIR}\n\
⚙️ Config:       ${INSTALL_DIR}/.env\n\n\
━━ Credentials ───────────────────\n\
🔐 JWT Secret:  ${JWT_SECRET:0:16}...\n\
🚀 First run:   Visit http://${SERVER_IP}:3000 → setup wizard\n\n\
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n\
Visit http://${SERVER_IP}:3000 to get started!" 24 65
    
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✅ Open ERP v${VERSION} installed successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${CYAN}🌐 Frontend:${NC}  http://${SERVER_IP}:3000"
    echo -e "  ${CYAN}🔌 API:${NC}       http://${SERVER_IP}:3001"
    echo -e "  ${CYAN}🗄️ Database:${NC}  ${DB_HOST}:${DB_PORT}"
    echo -e "  ${CYAN}📦 Redis:${NC}     ${REDIS_HOST}:${REDIS_PORT}"
    echo -e "  ${CYAN}🚀 First run:${NC} http://${SERVER_IP}:3000 → setup wizard"
    echo -e "  ${CYAN}📁 Config:${NC}    ${INSTALL_DIR}/.env"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ── Main ──
main() {
    echo -e "${CYAN}"
    echo "   ____                    _____  ____  ____  "
    echo "  / __ \                  |  __ \|  _ \|  _ \ "
    echo " | |  | |_ __   ___ _ __ | |__) | |_) | |_) |"
    echo " | |  | | '_ \ / _ \ '_ \|  ___/|  _ <|  __/ "
    echo " | |__| | |_) |  __/ | | | |    | |_) | |    "
    echo "  \____/| .__/ \___|_| |_|_|    |____/|_|    "
    echo "        | |                                   "
    echo "        |_|  v${VERSION} - Ubuntu Server Installer"
    echo -e "${NC}"
    
    check_root
    welcome
    check_prerequisites
    install_docker
    configure_environment
    clone_repository
    copy_env
    start_services
    install_systemd_service
    show_completion
}

main "$@"
