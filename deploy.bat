@echo off
REM Build and Deploy Script for AgriMind.ai (Windows)
REM This script handles building the frontend and backend, then deploying to various platforms

setlocal enabledelayedexpansion

echo 🚀 Starting AgriMind.ai Build and Deploy Process...

REM Function to print status
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Check if required commands exist
:check_dependencies
call :print_status "Checking dependencies..."

where node >nul 2>nul
if errorlevel 1 (
    call :print_error "Node.js is not installed"
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    call :print_error "npm is not installed"
    exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
    where python3 >nul 2>nul
    if errorlevel 1 (
        call :print_warning "Python is not installed - Django backend deployment will be skipped"
    )
)

call :print_success "Dependencies check completed"
goto :eof

REM Install frontend dependencies
:install_frontend_deps
call :print_status "Installing frontend dependencies..."
npm install
if errorlevel 1 (
    call :print_error "Failed to install frontend dependencies"
    exit /b 1
)
call :print_success "Frontend dependencies installed"
goto :eof

REM Build frontend
:build_frontend
call :print_status "Building frontend..."

REM Check if .env exists, if not create from example
if not exist .env (
    call :print_warning ".env file not found. Creating from .env.example..."
    copy .env.example .env >nul
    call :print_warning "Please update .env with your actual API keys before deploying to production"
)

npm run build
if errorlevel 1 (
    call :print_error "Frontend build failed"
    exit /b 1
)
call :print_success "Frontend build completed"
goto :eof

REM Install backend dependencies
:install_backend_deps
where python >nul 2>nul || where python3 >nul 2>nul
if not errorlevel 1 (
    call :print_status "Installing backend dependencies..."
    
    REM Try to activate virtual environment if it exists
    if exist venv\Scripts\activate.bat (
        call venv\Scripts\activate.bat
    )
    
    REM Install Python dependencies
    if exist requirements.txt (
        pip install -r requirements.txt
        if errorlevel 1 (
            python -m pip install -r requirements.txt
        )
        call :print_success "Backend dependencies installed"
    ) else (
        call :print_warning "No requirements.txt found, skipping backend dependencies"
    )
) else (
    call :print_warning "Python not found, skipping backend setup"
)
goto :eof

REM Setup Django backend
:setup_backend
where python >nul 2>nul || where python3 >nul 2>nul
if not errorlevel 1 (
    if exist manage.py (
        call :print_status "Setting up Django backend..."
        
        REM Try to activate virtual environment if it exists
        if exist venv\Scripts\activate.bat (
            call venv\Scripts\activate.bat
        )
        
        python manage.py makemigrations
        python manage.py migrate
        call :print_success "Django backend setup completed"
    )
)
goto :eof

REM Deploy to GitHub Pages
:deploy_github_pages
call :print_status "Deploying to GitHub Pages..."
npm run deploy
if errorlevel 1 (
    call :print_error "GitHub Pages deployment failed"
    exit /b 1
)
call :print_success "Deployed to GitHub Pages"
goto :eof

REM Deploy to Netlify
:deploy_netlify
where netlify >nul 2>nul
if not errorlevel 1 (
    call :print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    call :print_success "Deployed to Netlify"
) else (
    call :print_warning "Netlify CLI not found. Install with: npm install -g netlify-cli"
)
goto :eof

REM Deploy to Vercel
:deploy_vercel
where vercel >nul 2>nul
if not errorlevel 1 (
    call :print_status "Deploying to Vercel..."
    vercel --prod
    call :print_success "Deployed to Vercel"
) else (
    call :print_warning "Vercel CLI not found. Install with: npm install -g vercel"
)
goto :eof

REM Main function
:main
call :print_status "=== AgriMind.ai Build and Deploy ==="

REM Get deployment method (default to github)
set DEPLOY_METHOD=%1
if "%DEPLOY_METHOD%"=="" set DEPLOY_METHOD=github

if "%DEPLOY_METHOD%"=="github" (
    call :print_status "Deploying to GitHub Pages..."
) else if "%DEPLOY_METHOD%"=="netlify" (
    call :print_status "Deploying to Netlify..."
) else if "%DEPLOY_METHOD%"=="vercel" (
    call :print_status "Deploying to Vercel..."
) else if "%DEPLOY_METHOD%"=="build-only" (
    call :print_status "Building only, no deployment..."
) else (
    call :print_error "Unknown deployment method: %DEPLOY_METHOD%"
    echo Usage: %0 [github^|netlify^|vercel^|build-only]
    exit /b 1
)

REM Run the build process
call :check_dependencies
if errorlevel 1 exit /b 1

call :install_frontend_deps
if errorlevel 1 exit /b 1

call :install_backend_deps

call :setup_backend

call :build_frontend
if errorlevel 1 exit /b 1

REM Deploy based on method
if "%DEPLOY_METHOD%"=="github" (
    call :deploy_github_pages
) else if "%DEPLOY_METHOD%"=="netlify" (
    call :deploy_netlify
) else if "%DEPLOY_METHOD%"=="vercel" (
    call :deploy_vercel
) else if "%DEPLOY_METHOD%"=="build-only" (
    call :print_success "Build completed. Files are in the 'dist' directory."
)

call :print_success "=== Deployment completed successfully! ==="
goto :eof

REM Call main function
call :main %*
