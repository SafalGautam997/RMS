#!/bin/bash
# Restaurant Management System - Setup Script
# Run this to complete the setup after MySQL is installed

echo "=========================================="
echo "  Restaurant Management System Setup"
echo "=========================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Build backend
echo "🔨 Step 2: Compiling backend TypeScript..."
npm run build:backend
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo "✅ Backend compiled"
echo ""

# Step 3: Initialize database
echo "🗄️  Step 3: Initializing database..."
echo "   (Make sure MySQL 8.0.42 is running!)"
npm run db:init
if [ $? -eq 0 ]; then
    echo "✅ Database initialized"
else
    echo "⚠️  Database initialization failed"
    echo "   Possible cause: MySQL not running"
    echo "   See MYSQL_SETUP.md for help"
    exit 1
fi
echo ""

# Step 4: Start application
echo "🚀 Step 4: Starting application..."
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo "   Login: admin / admin123"
echo ""
npm run dev:full

