# 🚀 Deploying Bean Stash to v0 (berni.lol/chat)

## 📋 Prerequisites

1. **v0 Account**: You already have this
2. **Domain**: `berni.lol` connected to v0
3. **Spotify Developer App**: Already set up

## 🎯 Step-by-Step Deployment

### 1. **Update Spotify App Settings**

Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and update your app:

**Redirect URIs:**
- Add: `https://berni.lol/chat/callback.html`
- Remove the old one if needed

### 2. **Deploy to v0**

#### **Option A: Using v0 CLI (Recommended)**
```bash
# Install v0 CLI if you haven't already
npm install -g @v0dev/cli

# Login to v0
v0 login

# Deploy your project
v0 deploy
```

#### **Option B: Using v0 Dashboard**
1. Go to [v0.dev](https://v0.dev)
2. Create a new project
3. Upload your files or connect your GitHub repo

### 3. **File Structure for v0**

Upload these files to your v0 project:

```
/chat/
├── index.html          # Main chatbox
├── styles.css          # Styling
├── script.js           # Functionality
├── callback.html       # Spotify OAuth callback
├── README.md           # Documentation
└── .wakatime-project   # WakaTime config
```

### 4. **v0 Configuration**

Create a `v0.json` file in your project root:

```json
{
  "name": "bean-stash-chatbox",
  "version": "1.0.0",
  "routes": {
    "/chat/*": {
      "static": true,
      "directory": "/chat"
    }
  },
  "headers": {
    "/chat/*": {
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block"
    }
  }
}
```

### 5. **Environment Variables (if needed)**

In your v0 dashboard, add these environment variables:
- `SPOTIFY_CLIENT_ID`: `29acee31192b49e8a7bc0f3e846e46bf`

## 🔧 **Alternative: Deploy to GitHub Pages First**

If v0 deployment is complex, you can deploy to GitHub Pages first:

### 1. **Create GitHub Repository**
```bash
git init
git add .
git commit -m "Initial commit: Bean Stash Chatbox"
git remote add origin https://github.com/yourusername/bean-stash-chatbox.git
git push -u origin main
```

### 2. **Enable GitHub Pages**
- Go to your repo settings
- Enable GitHub Pages
- Set source to main branch
- Your site will be available at: `https://yourusername.github.io/bean-stash-chatbox/`

### 3. **Update Spotify Redirect URI**
- Add: `https://yourusername.github.io/bean-stash-chatbox/callback.html`

## 🎯 **Testing After Deployment**

1. Visit your deployed URL
2. Test AI chat functionality
3. Test Spotify integration (should work now!)
4. Test study timer
5. Test fullscreen mode

## 🔧 **Troubleshooting**

### **v0 Specific Issues:**
- Check v0 logs for deployment errors
- Ensure all files are uploaded correctly
- Verify domain configuration

### **Spotify Issues:**
- Double-check redirect URI in Spotify app settings
- Clear browser cache and localStorage
- Test in incognito mode

## 🎉 **Success!**

Once deployed, your Bean Stash chatbox will be available at:
**https://berni.lol/chat/**

## 📞 **Need Help with v0?**

If you're having trouble with v0 deployment:
1. Check v0 documentation
2. Contact v0 support
3. Consider GitHub Pages as an alternative
4. I can help you with any specific v0 issues

---

**Made with ❤️ for Hack Club** 