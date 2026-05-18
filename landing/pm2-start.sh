#!/bin/bash

# PM2 Start Script for Focuspilot Landing Page
# Usage: ./pm2-start.sh [dev|prod|stop|restart|logs|status]

APP_NAME="techstyles-landing"
PORT_DEV=3005
PORT_PROD=3000

case "$1" in
  dev)
    echo "Starting development server on port $PORT_DEV..."
    pm2 delete $APP_NAME 2>/dev/null
    pm2 start ecosystem.config.js --env development
    echo "Development server started. View at http://localhost:$PORT_DEV"
    ;;
  prod)
    echo "Starting production server on port $PORT_PROD..."
    npm run build
    pm2 delete $APP_NAME 2>/dev/null
    pm2 start ecosystem.config.js --env production
    echo "Production server started. View at http://localhost:$PORT_PROD"
    ;;
  stop)
    echo "Stopping $APP_NAME..."
    pm2 stop $APP_NAME
    ;;
  restart)
    echo "Restarting $APP_NAME..."
    pm2 restart $APP_NAME
    ;;
  logs)
    pm2 logs $APP_NAME
    ;;
  status)
    pm2 status
    ;;
  *)
    echo "Focuspilot PM2 Manager"
    echo ""
    echo "Usage: ./pm2-start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev      Start development server (port $PORT_DEV)"
    echo "  prod     Build and start production server (port $PORT_PROD)"
    echo "  stop     Stop the server"
    echo "  restart  Restart the server"
    echo "  logs     View server logs"
    echo "  status   View PM2 process status"
    echo ""
    ;;
esac
