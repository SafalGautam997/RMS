@echo off
REM Restaurant Management System - Windows Setup Script
REM Run this to complete the setup after MySQL is installed

cls
echo.
echo ==========================================
echo   Restaurant Management System Setup
echo ==========================================
echo.

REM Step 1: Install dependencies
echo 📦 Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 2: Build backend
echo 🔨 Step 2: Compiling backend TypeScript...
call npm run build:backend
if errorlevel 1 (
    echo ❌ TypeScript compilation failed
    pause
    exit /b 1
)
echo ✅ Backend compiled
echo.

REM Step 3: Initialize database
echo 🗄️  Step 3: Initializing database...
echo    (Make sure MySQL 8.0.42 is running!)
call npm run db:init
if errorlevel 1 (
    echo ⚠️  Database initialization failed
    echo    Possible cause: MySQL not running
    echo    See MYSQL_SETUP.md for help
    pause
    exit /b 1
)
echo ✅ Database initialized
echo.

REM Step 4: Start application
echo 🚀 Step 4: Starting application...
echo    Backend: http://localhost:3001
echo    Frontend: http://localhost:5173
echo    Login: admin / admin123
echo.
call npm run dev:full

pause
