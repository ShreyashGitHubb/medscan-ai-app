# Quick Start - New GitHub Repo Setup
# Run these commands in PowerShell

# 1. First, create a new repository on GitHub at https://github.com/new
#    Name it: MedScan-Mobile (or whatever you prefer)
#    Don't initialize with README

# 2. Then run these commands (replace YOUR_USERNAME with your GitHub username):

cd "C:\Users\HP\3D Objects\medscan\MedScan-AI\mobile-app"

# Initialize if needed (skip if already initialized)
git init

# Add GitHub Actions and new files
git add .github/
git add GITHUB_ACTIONS_SETUP.md
git add .env.example

# Commit
git commit -m "Add GitHub Actions workflow for automated APK builds"

# Add your new repo as remote (REPLACE YOUR_USERNAME!)
# git remote add origin https://github.com/YOUR_USERNAME/MedScan-Mobile.git
# OR if you want to keep it in the same repo, just push:
git push

# 3. Get your Expo token:
npx eas whoami

# 4. Go to your GitHub repo → Settings → Secrets → Actions
#    Add new secret:
#    Name: EXPO_TOKEN
#    Value: [your token from expo.dev/accounts/.../settings/access-tokens]

# 5. Trigger build:
#    - Go to Actions tab on GitHub
#    - Click "Run workflow"
#    - Wait ~15-20 minutes
#    - Download APK from Artifacts!
