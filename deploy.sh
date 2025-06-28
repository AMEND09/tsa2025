#!/bin/bash

# Build and Deploy Script for AgriMind.ai
# This script handles building the frontend and backend, then deploying to various platforms

set -e  # Exit on any error

echo "🚀 Starting AgriMind.ai Build and Deploy Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required commands exist
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
        print_warning "Python is not installed - Django backend deployment will be skipped"
    fi
    
    print_success "Dependencies check completed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    # Check if .env exists, if not create from example
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env with your actual API keys before deploying to production"
    fi
    
    npm run build
    print_success "Frontend build completed"
}

# Install backend dependencies (if Python is available)
install_backend_deps() {
    if command -v python3 &> /dev/null || command -v python &> /dev/null; then
        print_status "Installing backend dependencies..."
        
        # Try to activate virtual environment if it exists
        if [ -d "venv" ]; then
            source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true
        fi
        
        # Install Python dependencies
        if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt || pip3 install -r requirements.txt
            print_success "Backend dependencies installed"
        else
            print_warning "No requirements.txt found, skipping backend dependencies"
        fi
    else
        print_warning "Python not found, skipping backend setup"
    fi
}

# Run Django migrations (if applicable)
setup_backend() {
    if command -v python3 &> /dev/null || command -v python &> /dev/null; then
        if [ -f "manage.py" ]; then
            print_status "Setting up Django backend..."
            
            # Try to activate virtual environment if it exists
            if [ -d "venv" ]; then
                source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true
            fi
            
            python manage.py makemigrations || python3 manage.py makemigrations
            python manage.py migrate || python3 manage.py migrate
            print_success "Django backend setup completed"
        fi
    fi
}

# Deploy to GitHub Pages
deploy_github_pages() {
    print_status "Deploying to GitHub Pages..."
    npm run deploy
    print_success "Deployed to GitHub Pages"
}

# Deploy to Netlify (requires netlify-cli)
deploy_netlify() {
    if command -v netlify &> /dev/null; then
        print_status "Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        print_success "Deployed to Netlify"
    else
        print_warning "Netlify CLI not found. Install with: npm install -g netlify-cli"
    fi
}

# Deploy to Vercel (requires vercel-cli)
deploy_vercel() {
    if command -v vercel &> /dev/null; then
        print_status "Deploying to Vercel..."
        vercel --prod
        print_success "Deployed to Vercel"
    else
        print_warning "Vercel CLI not found. Install with: npm install -g vercel"
    fi
}

# Main deployment function
main() {
    print_status "=== AgriMind.ai Build and Deploy ==="
    
    # Check what deployment method to use
    DEPLOY_METHOD=${1:-""}
    
    if [ -z "$DEPLOY_METHOD" ]; then
        echo "🔧 Choose deployment option:"
        echo "1) Frontend only (GitHub Pages)"
        echo "2) Frontend only (Netlify)"
        echo "3) Frontend only (Vercel)"
        echo "4) Full stack (Render)"
        echo "5) Full stack (Railway)"
        echo "6) Full stack (Heroku)"
        echo "7) Build only (no deploy)"
        echo "8) Quick build"
        
        read -p "Enter your choice (1-8): " choice
        
        case $choice in
            1) DEPLOY_METHOD="github" ;;
            2) DEPLOY_METHOD="netlify" ;;
            3) DEPLOY_METHOD="vercel" ;;
            4) DEPLOY_METHOD="render" ;;
            5) DEPLOY_METHOD="railway" ;;
            6) DEPLOY_METHOD="heroku" ;;
            7) DEPLOY_METHOD="build" ;;
            8) DEPLOY_METHOD="quick" ;;
            *) 
                print_error "Invalid choice. Exiting."
                exit 1
                ;;
        esac
    fi
    
    case $DEPLOY_METHOD in
        "github")
            print_status "Deploying to GitHub Pages..."
            check_dependencies
            install_frontend_deps
            build_frontend
            deploy_github_pages
            ;;
        "netlify")
            print_status "Deploying to Netlify..."
            check_dependencies
            install_frontend_deps
            build_frontend
            deploy_netlify
            ;;
        "vercel")
            print_status "Deploying to Vercel..."
            check_dependencies
            install_frontend_deps
            build_frontend
            deploy_vercel
            ;;
        "render"|"railway"|"heroku")
            print_status "Preparing full stack deployment for $DEPLOY_METHOD..."
            check_dependencies
            install_frontend_deps
            install_backend_deps
            setup_backend
            build_frontend
            print_success "Build complete! Deploy manually through $DEPLOY_METHOD dashboard or configure auto-deploy."
            ;;
        "build")
            print_status "Building everything..."
            check_dependencies
            install_frontend_deps
            install_backend_deps
            setup_backend
            build_frontend
            print_success "Build complete! Ready for manual deployment."
            ;;
        "quick")
            print_status "Quick build (frontend only)..."
            install_frontend_deps
            build_frontend
            print_success "Quick build complete!"
            ;;
        *)
            print_error "Unknown deployment method: $DEPLOY_METHOD"
            echo "Usage: $0 [github|netlify|vercel|render|railway|heroku|build|quick]"
            exit 1
            ;;
    esac
    
    # Deploy based on method
    case $DEPLOY_METHOD in
        "github")
            deploy_github_pages
            ;;
        "netlify")
            deploy_netlify
            ;;
        "vercel")
            deploy_vercel
            ;;
        *)
            print_error "Unknown deployment method: $DEPLOY_METHOD"
            echo "Usage: $0 [github|netlify|vercel|render|railway|heroku|build|quick]"
            exit 1
            ;;
    esac
    
    print_success "=== Deployment completed successfully! ==="
}

# Run main function with all arguments
main "$@"
