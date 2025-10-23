#!/bin/bash

echo "=== STUDENT APP TROUBLESHOOTING SCRIPT ==="
echo "Date: $(date)"
echo ""

# Check if docker is running
echo "1. Checking Docker status..."
docker --version
docker ps

echo ""
echo "2. Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "3. Checking container logs..."
echo "=== BACKEND LOGS ==="
docker compose -f docker-compose.prod.yml logs --tail=50 backend

echo ""
echo "=== FRONTEND LOGS ==="
docker compose -f docker-compose.prod.yml logs --tail=50 frontend

echo ""
echo "=== MONGODB LOGS ==="
docker compose -f docker-compose.prod.yml logs --tail=50 mongo

echo ""
echo "4. Testing connectivity..."
echo "Testing backend health..."
curl -v http://localhost:5000/api/admin/students || echo "Backend not responding"

echo ""
echo "Testing frontend..."
curl -v http://localhost:3000 || echo "Frontend not responding"

echo ""
echo "5. Checking network connectivity..."
docker network ls
docker network inspect studentapp_studentapp-net

echo ""
echo "6. Checking MongoDB connection..."
docker exec student-app-backend node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/studentapp')
  .then(() => console.log('✅ MongoDB connection successful'))
  .catch(err => console.log('❌ MongoDB connection failed:', err.message));
"

echo ""
echo "=== TROUBLESHOOTING COMPLETE ==="
