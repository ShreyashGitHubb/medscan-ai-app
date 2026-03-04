# Setup GitHub Repository & GitHub Actions Build

## Step 1: Create New GitHub Repository

1. Go to https://github.com/new
2. Repository name: `MedScan-Mobile` (or your choice)
3. Description: "MedScan AI Mobile App with Offline ONNX Models"
4. ✅ Public (or Private if you have Actions minutes)
5. ❌ Don't initialize with README
6. Click **Create repository**

## Step 2: Prepare Mobile App Directory

```powershell
cd "C:\Users\HP\3D Objects\medscan\MedScan-AI\mobile-app"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Mobile app with ONNX models"
```

## Step 3: Connect to GitHub

```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/MedScan-Mobile.git

# Push code
git branch -M main
git push -u origin main
```

## Step 4: Get Expo Token

```powershell
# Login to Expo (if not already)
npx expo login

# Get your token
npx eas whoami
```

Then go to https://expo.dev/accounts/[your-account]/settings/access-tokens
- Click "Create Token"
- Name: "GitHub Actions"
- Copy the token (you'll need it in Step 5)

## Step 5: Add Secret to GitHub

1. Go to your repo: `https://github.com/YOUR_USERNAME/MedScan-Mobile`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste the token from Step 4
6. Click **Add secret**

## Step 6: Trigger Build

**Option A: Automatic (on push)**
```powershell
# Make any change
git commit --allow-empty -m "Trigger build"
git push
```

**Option B: Manual**
1. Go to your repo on GitHub
2. Click **Actions** tab
3. Click **Build Android APK** workflow
4. Click **Run workflow** → **Run workflow**

## Step 7: Download APK

1. Wait for build to complete (~15-20 minutes)
2. Go to **Actions** tab
3. Click the completed workflow run
4. Scroll to **Artifacts** section
5. Download `app-release` ZIP file
6. Extract and install the APK on your device!

---

## ✅ Benefits of GitHub Actions

- ☁️ **Cloud build** - No local environment issues
- 🆓 **Free** for public repos (2000 minutes/month)
- 🔄 **Automatic** - Builds on every push
- 📦 **Artifact storage** - APKs saved for 30 days
- 🚀 **Fast** - Uses GitHub's powerful servers

## ⚠️ Important Notes

1. **First build may fail** - You'll need to configure EAS credentials
2. **Build time** - ~15-20 minutes per build
3. **Secrets** - Never commit your EXPO_TOKEN to code
4. **Models included** - 89.78 MB + 42.9 MB = ~133 MB in APK

## 🆘 Troubleshooting

**Build fails with "No credentials found":**
```powershell
# Run locally once to setup
eas build:configure
```

**"EXPO_TOKEN not found":**
- Double-check the secret name is exactly `EXPO_TOKEN`
- Make sure you added it to the correct repository

**APK too large:**
- This is normal with AI models (~200+ MB)
- Models must be bundled for offline use
