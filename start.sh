#!/bin/bash

# MADHURAM POS - Server Startup Script
# Run this script to start both the backend server and frontend

echo "=========================================="
echo "  🍽️  MADHURAM POS System"
echo "=========================================="
echo ""

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "Starting servers..."
echo ""

# Check if server dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "=========================================="
echo "  Access the POS System:"
echo "=========================================="
echo ""
echo "  From this computer:"
echo "    http://localhost:5173"
echo ""
echo "  From other devices on the network:"
echo "    http://$LOCAL_IP:5173"
echo ""
echo "=========================================="
echo ""

# Start both servers
npm run start
