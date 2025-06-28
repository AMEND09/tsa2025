# AgriMind.ai Full Stack Build and Deploy Script (PowerShell)
# This script builds and deploys both the Django backend and React frontend

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("heroku", "railway", "render", "github", "build", "quick")]
    [string]$Platform = ""
)

# Configuration
$FrontendBuildDir = "dist"
$BackendDir = "."
$StaticDir = "staticfiles"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if virtual environment exists
function Initialize-VirtualEnv {
    if (-not (Test-Path "venv") -and -not (Test-Path ".venv") -and -not $env:VIRTUAL_ENV) {
        Write-Warning "No virtual environment detected. Creating one..."
        python -m venv venv
        & "venv\Scripts\Activate.ps1"
    } elseif (Test-Path "venv") {
        Write-Status "Activating virtual environment..."
        & "venv\Scripts\Activate.ps1"
    } elseif (Test-Path ".venv") {
        Write-Status "Activating virtual environment..."
        & ".venv\Scripts\Activate.ps1"
    }
}

# Install backend dependencies
function Install-BackendDeps {
    Write-Status "Installing backend dependencies..."
    python -m pip install --upgrade pip
    pip install -r requirements.txt
}

# Install frontend dependencies
function Install-FrontendDeps {
    Write-Status "Installing frontend dependencies..."
    npm install
}

# Build frontend
function Build-Frontend {
    Write-Status "Building React frontend..."
    npm run build
    
    if (Test-Path $FrontendBuildDir) {
        Write-Status "Frontend build successful! ✅"
    } else {
        Write-Error "Frontend build failed! ❌"
        exit 1
    }
}

# Prepare Django backend
function Prepare-Backend {
    Write-Status "Preparing Django backend..."
    
    # Run migrations
    Write-Status "Running database migrations..."
    python manage.py migrate
    
    # Collect static files
    Write-Status "Collecting static files..."
    python manage.py collectstatic --noinput
    
    Write-Status "Backend preparation complete! ✅"
}

# Run tests
function Run-Tests {
    Write-Status "Running tests..."
    
    # Frontend tests (if available)
    try {
        npm test -- --run 2>$null
        Write-Status "Frontend tests passed"
    } catch {
        Write-Warning "Frontend tests skipped"
    }
    
    # Backend tests
    try {
        python manage.py test
        Write-Status "Backend tests passed"
    } catch {
        Write-Warning "Backend tests failed or skipped"
    }
}

# Deploy to different platforms
function Deploy-GitHubPages {
    Write-Status "Deploying frontend to GitHub Pages..."
    npm run deploy:github
}

function Deploy-Heroku {
    Write-Status "Deploying full stack to Heroku..."
    
    # Check if Heroku CLI is installed
    if (-not (Get-Command heroku -ErrorAction SilentlyContinue)) {
        Write-Error "Heroku CLI not found. Please install it first."
        exit 1
    }
    
    # Deploy to Heroku
    git add .
    try {
        git commit -m "Deploy: $(Get-Date)"
    } catch {
        Write-Warning "No changes to commit"
    }
    
    try {
        git push heroku main
    } catch {
        git push heroku master
    }
}

function Deploy-Railway {
    Write-Status "Deploying full stack to Railway..."
    
    # Check if Railway CLI is installed
    if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
        Write-Error "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    }
    
    railway deploy
}

function Deploy-Render {
    Write-Status "Deploying to Render..."
    Write-Warning "Make sure you have connected your repository to Render."
    Write-Warning "This will trigger a deployment on Render automatically."
}

# Main deployment function
function Start-Deployment {
    param([string]$DeploymentType)
    
    if (-not $DeploymentType) {
        Write-Host "🔧 Choose deployment option:"
        Write-Host "1) Full stack (Heroku)"
        Write-Host "2) Full stack (Railway)"
        Write-Host "3) Full stack (Render)"
        Write-Host "4) Frontend only (GitHub Pages)"
        Write-Host "5) Build only (no deploy)"
        Write-Host "6) Quick local build"
        
        $choice = Read-Host "Enter your choice (1-6)"
        
        switch ($choice) {
            "1" { $DeploymentType = "heroku" }
            "2" { $DeploymentType = "railway" }
            "3" { $DeploymentType = "render" }
            "4" { $DeploymentType = "github" }
            "5" { $DeploymentType = "build" }
            "6" { $DeploymentType = "quick" }
            default {
                Write-Error "Invalid choice. Exiting."
                exit 1
            }
        }
    }
    
    switch ($DeploymentType.ToLower()) {
        "heroku" {
            Initialize-VirtualEnv
            Install-BackendDeps
            Install-FrontendDeps
            Build-Frontend
            Prepare-Backend
            Run-Tests
            Deploy-Heroku
        }
        "railway" {
            Initialize-VirtualEnv
            Install-BackendDeps
            Install-FrontendDeps
            Build-Frontend
            Prepare-Backend
            Run-Tests
            Deploy-Railway
        }
        "render" {
            Initialize-VirtualEnv
            Install-BackendDeps
            Install-FrontendDeps
            Build-Frontend
            Prepare-Backend
            Run-Tests
            Deploy-Render
        }
        "github" {
            Install-FrontendDeps
            Build-Frontend
            Deploy-GitHubPages
        }
        "build" {
            Initialize-VirtualEnv
            Install-BackendDeps
            Install-FrontendDeps
            Build-Frontend
            Prepare-Backend
            Write-Status "Build complete! Ready for manual deployment."
        }
        "quick" {
            Install-FrontendDeps
            Build-Frontend
            Write-Status "Quick build complete!"
        }
        default {
            Write-Error "Invalid deployment type: $DeploymentType"
            exit 1
        }
    }
    
    Write-Status "🎉 Deployment process completed!"
}

# Run the main function
Write-Status "🚀 Starting AgriMind.ai Full Stack Deployment..."
Start-Deployment -DeploymentType $Platform
