# 🚀 AgriMind.ai Deployment Guide

This guide provides multiple options for deploying AgriMind.ai with a single command.

## Quick Start

### For GitHub Pages (Recommended for static deployment)
```bash
npm run deploy:github
```

### For other platforms
```bash
# Netlify
npm run deploy:netlify

# Vercel
npm run deploy:vercel

# Build only (no deployment)
npm run build:prod
```

## Platform-Specific Setup

### 1. GitHub Pages
Already configured! Just run:
```bash
npm run deploy:github
```

**Requirements:**
- GitHub repository
- GitHub Pages enabled in repository settings

### 2. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
npm run deploy:netlify
```

**Environment Variables to set in Netlify:**
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

### 3. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
npm run deploy:vercel
```

**Environment Variables to set in Vercel:**
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

### 4. Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t agrimind .
docker run -p 80:80 agrimind
```

## Automated Scripts

### Cross-Platform Scripts

**Linux/Mac:**
```bash
# Make executable
chmod +x deploy.sh

# Deploy to GitHub Pages
./deploy.sh github

# Deploy to Netlify
./deploy.sh netlify

# Deploy to Vercel
./deploy.sh vercel

# Build only
./deploy.sh build-only
```

**Windows:**
```cmd
# Deploy to GitHub Pages
deploy.bat github

# Deploy to Netlify
deploy.bat netlify

# Deploy to Vercel
deploy.bat vercel

# Build only
deploy.bat build-only
```

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**Required Environment Variables:**
- `VITE_GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- `REACT_APP_API_BASE_URL`: Backend URL (default: http://localhost:8000)

## Backend Deployment (Django)

If you're deploying the full-stack application:

### Requirements
- Python 3.8+
- PostgreSQL (for production)
- Redis (optional, for caching)

### Setup
```bash
# Install backend dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run server
python manage.py runserver
```

## Production Deployment Checklist

### Frontend
- [ ] Set `VITE_GEMINI_API_KEY` in environment variables
- [ ] Update `REACT_APP_API_BASE_URL` to production backend URL
- [ ] Run `npm run build` to create production build
- [ ] Test the built application with `npm run preview`

### Backend (if applicable)
- [ ] Set `DEBUG=False` in Django settings
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up proper CORS settings
- [ ] Configure static file serving
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables

### Security
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins
- [ ] Secure API keys
- [ ] Enable security headers
- [ ] Configure rate limiting

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables Not Loading:**
- Ensure `.env` file exists
- Variables must be prefixed with `VITE_` for Vite
- Restart development server after changes

**GitHub Pages 404:**
- Check `homepage` field in `package.json`
- Ensure repository name matches the path
- Verify GitHub Pages is enabled

**API Not Working:**
- Check CORS settings in Django backend
- Verify API base URL is correct
- Check network tab in browser dev tools

## Monitoring and Maintenance

### Logs
- **Netlify**: Check deploy logs in Netlify dashboard
- **Vercel**: Check function logs in Vercel dashboard
- **Docker**: `docker logs [container_id]`

### Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Support

For deployment issues:
1. Check this documentation
2. Review error logs
3. Check platform-specific documentation
4. Ensure all environment variables are set correctly

---

Happy deploying! 🎉
