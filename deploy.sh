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
    DEPLOY_METHOD=${1:-"github"}
    
    case $DEPLOY_METHOD in
        "github")
            print_status "Deploying to GitHub Pages..."
            ;;
        "netlify")
            print_status "Deploying to Netlify..."
            ;;
        "vercel")
            print_status "Deploying to Vercel..."
            ;;
        "build-only")
            print_status "Building only, no deployment..."
            ;;
        *)
            print_error "Unknown deployment method: $DEPLOY_METHOD"
            echo "Usage: $0 [github|netlify|vercel|build-only]"
            exit 1
            ;;
    esac
    
    # Run the build process
    check_dependencies
    install_frontend_deps
    install_backend_deps
    setup_backend
    build_frontend
    
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
        "build-only")
            print_success "Build completed. Files are in the 'dist' directory."
            ;;
    esac
    
    print_success "=== Deployment completed successfully! ==="
}

# Run main function with all arguments
main "$@"
