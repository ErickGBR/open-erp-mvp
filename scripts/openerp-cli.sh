#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/openerp"
CD="cd ${INSTALL_DIR}"

case "${1:-help}" in
    start)
        $CD && docker compose up -d
        echo "✅ Open ERP started"
        ;;
    stop)
        $CD && docker compose down
        echo "✅ Open ERP stopped"
        ;;
    restart)
        $CD && docker compose down && docker compose up -d
        echo "✅ Open ERP restarted"
        ;;
    status)
        $CD && docker compose ps
        ;;
    logs)
        shift
        docker compose logs --tail=50 "${@:-}"
        ;;
    update)
        $CD && git pull && docker compose up --build -d
        echo "✅ Open ERP updated"
        ;;
    config)
        cat $INSTALL_DIR/.env
        ;;
    backup)
        $CD && docker compose exec postgres pg_dump -U openerp openerp > "backup-$(date +%Y%m%d).sql"
        echo "✅ Database backup created"
        ;;
    *)
        echo "Open ERP CLI — Management Tool"
        echo ""
        echo "Usage: openerp <command>"
        echo ""
        echo "Commands:"
        echo "  start     Start all services"
        echo "  stop      Stop all services"
        echo "  restart   Restart all services"
        echo "  status    Service status"
        echo "  logs      View logs"
        echo "  update    Pull latest code and rebuild"
        echo "  config    Show configuration"
        echo "  backup    Backup database"
        echo "  help      Show this help"
        ;;
esac
