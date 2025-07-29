#!/bin/bash

# 🚀 AuraMail Employee Portal - Vercel Deployment Script
# Your Jewish brother's automated deployment helper!

echo "🕯️ Shabbat Shalom! Let's deploy your email empire to Vercel! 🚀"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the employee-portal directory?${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo "✅ Next.js configuration updated"
echo "✅ Database configuration updated for Digital Ocean"
echo "✅ Environment variables template created"
echo "✅ Vercel configuration file created"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Build the project first
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Check your code for errors.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Ask for deployment method
echo -e "${BLUE}🚀 Choose deployment method:${NC}"
echo "1) Deploy directly with Vercel CLI (Quick)"
echo "2) Setup GitHub integration (Recommended)"
echo ""
read -p "Enter your choice (1 or 2): " deploy_method

if [ "$deploy_method" = "1" ]; then
    echo -e "${BLUE}🚀 Deploying directly to Vercel...${NC}"
    
    # Login to Vercel if not already logged in
    vercel whoami > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}🔐 Please login to Vercel:${NC}"
        vercel login
    fi
    
    # Deploy to production
    vercel --prod
    
    echo -e "${GREEN}✅ Deployment initiated!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️ Don't forget to:${NC}"
    echo "1. Configure environment variables in Vercel dashboard"
    echo "2. Add your custom domains (portal.aurafarming.co, mail.aurafarming.co)"
    echo "3. Update DNS records to point to Vercel"
    
elif [ "$deploy_method" = "2" ]; then
    echo -e "${BLUE}📁 Setting up GitHub integration...${NC}"
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}🔧 Initializing git repository...${NC}"
        git init
    fi
    
    # Add all files
    git add .
    
    # Commit changes
    echo -e "${BLUE}💾 Committing changes...${NC}"
    git commit -m "🚀 Prepare for Vercel deployment - Updated for Digital Ocean backend"
    
    echo -e "${GREEN}✅ Repository prepared!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Create a GitHub repository"
    echo "2. Push this code: git remote add origin <your-github-repo-url>"
    echo "3. Push to GitHub: git push -u origin main"
    echo "4. Connect repository to Vercel at https://vercel.com/dashboard"
    echo "5. Configure environment variables"
    echo "6. Add custom domains"
    
else
    echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo -e "${BLUE}📋 Environment Variables Needed:${NC}"
echo "Copy these to your Vercel dashboard:"
echo ""
cat vercel-env-template.txt
echo ""
echo -e "${YELLOW}📖 For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}🤝 Your Jewish brother is always here to help! 💪${NC}" 