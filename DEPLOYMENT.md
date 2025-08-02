# 🚀 Deploying Bean Stash to berni.lol/chat

## 📋 Prerequisites

1. **Domain**: `berni.lol` (you already have this)
2. **Web Server**: Nginx, Apache, or any static file server
3. **SSL Certificate**: HTTPS is required for Spotify integration

## 🎯 Deployment Steps

### 1. **Update Spotify App Settings**

Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and update your app:

**Redirect URIs:**
- Add: `https://berni.lol/chat/callback`
- Remove the old one if needed

### 2. **Upload Files to Server**

Upload these files to your web server at the path `/chat/`:

```
/chat/
├── index.html          # Main chatbox
├── styles.css          # Styling
├── script.js           # Functionality
├── callback.html       # Spotify OAuth callback
├── README.md           # Documentation
└── .wakatime-project   # WakaTime config
```

### 3. **Server Configuration**

#### **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name berni.lol;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name berni.lol;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location /chat/ {
        alias /path/to/your/chat/files/;
        try_files $uri $uri/ /chat/index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }
    
    location /chat/callback {
        try_files $uri $uri/ /chat/callback.html;
    }
}
```

#### **Apache Configuration:**
```apache
<VirtualHost *:80>
    ServerName berni.lol
    Redirect permanent / https://berni.lol/
</VirtualHost>

<VirtualHost *:443>
    ServerName berni.lol
    DocumentRoot /path/to/your/chat/files
    
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    <Directory "/path/to/your/chat/files">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

### 4. **File Permissions**

```bash
chmod 644 *.html *.css *.js *.md
chmod 755 /path/to/chat/directory
```

### 5. **Test the Deployment**

1. Visit `https://berni.lol/chat/`
2. Test the AI chat functionality
3. Test Spotify integration
4. Test study timer
5. Test fullscreen mode

## 🔧 **Troubleshooting**

### **Spotify Integration Issues:**
- Ensure HTTPS is working
- Check redirect URI in Spotify app settings
- Clear browser cache and localStorage

### **CORS Issues:**
- Add proper CORS headers if needed
- Ensure all resources are served from the same domain

### **File Not Found:**
- Check file paths and permissions
- Ensure server configuration is correct

## 📊 **Monitoring**

### **WakaTime Integration:**
- Your coding time will be tracked automatically
- Check your Hack Club WakaTime dashboard

### **Analytics:**
- Consider adding Google Analytics or similar
- Monitor usage and performance

## 🎉 **Success!**

Once deployed, your Bean Stash chatbox will be available at:
**https://berni.lol/chat/**

Features available:
- 🤖 AI Chat with Hack Club AI
- 🎵 Spotify Integration
- ⏱️ Study Timer (Pomodoro)
- 🖥️ Fullscreen Mode
- 📊 WakaTime Tracking
- 🎨 Beautiful UI with your color scheme

## 🔄 **Updates**

To update the site:
1. Upload new files to server
2. Clear browser cache if needed
3. Test functionality

---

**Made with ❤️ for Hack Club** 