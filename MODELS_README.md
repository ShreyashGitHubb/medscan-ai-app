# MedScan Mobile - Model Download Instructions

## ⚠️ IMPORTANT: Models Too Large for Git

The ONNX model files are **too large** to be stored in GitHub (~133 MB total):
- `dermnet_resnet50.onnx` (89.78 MB)
- `chest_xray_resnet18.onnx` (42.9 MB)

## 📥 Download Models

### Option 1: From Original Location
Copy the models from the parent project:
```powershell
# From the mobile-app directory
Copy-Item "../backend/app/model/dermnet_resnet50_full.pth" -Destination "assets/models/"
Copy-Item "../backend/app/model/chest_xray_resnet18.pth" -Destination "assets/models/"

# Then convert them
python ../convert_dermnet_smart.py
python ../convert_all_models.py
```

### Option 2: Use Google Drive / Dropbox
Upload the models to cloud storage and share the link.

### Option 3: Git LFS (if you have it setup)
```powershell
git lfs track "*.onnx"
git add .gitattributes
git add assets/models/*.onnx
git commit -m "Add models via LFS"
git push
```

## 🎯 For GitHub Actions Build

The models need to be available during the build. Options:

1. **Upload to Release Assets** (Recommended)
   - Create a GitHub release
   - Upload the .onnx files as release assets  
   - Update workflow to download them during build

2. **Use External Storage**
   - Upload to Google Drive/Dropbox
   - Add download step in GitHub Actions workflow

3. **Build Locally**
   - Keep models local
   - Use `expo build` or `eas build --local`

## Current Status

- ✅ Code pushed to GitHub (without models)
- ⚠️ Models must be added separately before building
- 📝 Update workflow to download models before build
