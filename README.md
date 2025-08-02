# Bean Stash 101 - AI Chatbox

A beautiful, modern AI chatbox powered by [Hack Club AI](https://github.com/hackclub/ai) - a free, unlimited AI chat service for teens.

![Bean Stash Chatbox](https://img.shields.io/badge/Status-Ready-brightgreen)
![Hack Club AI](https://img.shields.io/badge/Powered%20by-Hack%20Club%20AI-blue)

## ✨ Features

- **🤖 AI-Powered Chat**: Powered by Hack Club AI's free, unlimited chat completions
- **🎨 Beautiful UI**: Modern, responsive design with warm beige and brown color scheme
- **💬 Chat History**: Save and manage multiple conversations
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **⚙️ Settings**: Theme customization and chat management
- **🎯 No API Key Required**: Completely free to use with Hack Club AI
- **🚀 Real-time Typing**: Animated typing indicators for better UX

## 🚀 Quick Start

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Start Chatting** with Bean Stash!

No installation or setup required - it works right out of the box!

## 🎯 How to Use

### Basic Chat
1. Type your message in the input field at the bottom
2. Press Enter or click the send button
3. Bean Stash will respond using Hack Club AI

### Chat History
- **New Chat**: Click the "New Chat" button in the sidebar
- **Switch Chats**: Click on any chat in the history sidebar
- **Clear History**: Use the settings menu to clear all chat history

### Settings
- Click the gear icon in the top-right corner
- **Theme**: Choose between Default, Dark, or Light mode
- **Clear History**: Remove all saved conversations

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Vanilla JS with async/await
- **Hack Club AI API**: Free AI chat completions

### API Integration
The chatbox uses the [Hack Club AI API](https://ai.hackclub.com/chat/completions) which provides:
- Free, unlimited chat completions
- No API key required
- GPT-3.5-turbo model
- Designed for teens and educational use

### Browser Support
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🎨 Design Features

### Color Scheme
- **Primary**: Muted mauve (#6d5964)
- **Secondary**: Soft pink (#aa9496)
- **Accent**: Coral pink (#aa6f73)
- **Warm**: Peach (#eea990)
- **Background**: Cream (#f6e0b5)

### UI Elements
- **Glassmorphism**: Modern blur effects and transparency
- **Smooth Animations**: Fade-in effects and hover states
- **Responsive Layout**: Adapts to any screen size
- **Accessibility**: High contrast and readable fonts

## 📁 File Structure

```
bean-stash/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🔧 Customization

### Changing the AI Personality
Edit the system message in `script.js`:

```javascript
{
    role: 'system',
    content: 'You are Bean Stash, a friendly and helpful AI assistant...'
}
```

### Modifying Colors
Update the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #8B4513;
    --secondary-color: #A0522D;
    --background-color: #f5f1e8;
}
```

### Adding Features
The modular JavaScript structure makes it easy to add:
- File uploads
- Voice input
- Export conversations
- Custom themes

## 🤝 Contributing

Feel free to contribute to this project! Some ideas:
- Add new themes
- Implement voice chat
- Add conversation export
- Improve mobile experience
- Add more AI models

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Hack Club AI**: For providing the free AI API
- **Font Awesome**: For the beautiful icons
- **Google Fonts**: For the Inter font family
- **Hack Club**: For supporting teen developers

## 🆘 Support

If you encounter any issues:
1. Check that you have a stable internet connection
2. Try refreshing the page
3. Clear your browser cache
4. Check the browser console for errors

## 🌟 About Hack Club AI

[Hack Club AI](https://github.com/hackclub/ai) is an experimental service providing unlimited `/chat/completions` for free, specifically designed for teens in Hack Club. It's a great way to learn about AI and build cool projects without worrying about API costs.

---

**Made with ❤️ for the Hack Club community**

*Bean Stash - Your friendly AI assistant powered by Hack Club AI* 