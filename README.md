<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Elara 3.0 - AI Virtual Assistant 🚀

An advanced AI virtual assistant powered by Google Gemini, featuring integrated development tools, creative studio, and intelligent collaboration capabilities.

View your app in AI Studio: https://ai.studio/apps/drive/19jqfQTMSapioINoNOHkP9bhI2hG3zx8U

---

## ✨ New in Version 3.0

### 🛠️ **Sandbox IDE**
- Full-featured integrated development environment
- Multi-file support (HTML, CSS, JavaScript, TypeScript)
- Live preview with console output
- GitHub repository integration
- AI-assisted code generation
- Real-time syntax validation
- Code formatting with Prettier

### 🎨 **Creative Studio**
- Professional image generation platform
- Dual AI models (Gemini 3 Pro Image & Imagen 3)
- Multiple aspect ratios (1:1, 16:9, 9:16, 3:4, 4:3)
- Image comparison mode
- Gallery management
- Set as wallpaper feature

### 💭 **Thought Logger**
- Real-time display of AI reasoning process
- Transparent decision-making
- Educational insights
- Collapsible interface

### 📺 **Screen Share**
- Capture and analyze user's screen
- Gemini Vision-powered analysis
- Debug UI/UX issues
- Visual problem-solving

### 🎭 **Adaptive Persona**
- Context-aware personality adjustment
- Automatic mode switching
- 6 persona modes including Adaptive
- Emotional intelligence

### 🌌 **Proactive Background Generation**
- Automatic ambient wallpaper creation
- Beautiful generative art every 10 minutes
- Non-intrusive design
- Customizable themes

### 🔮 **AR Hologram Mode** ✨ NEW
- Immersive 3D augmented reality interface
- Holographic avatar with cyberpunk aesthetic
- Floating UI widgets with real-time data
- Neon blue/purple lighting with bloom effects
- Interactive orbit controls (rotate, zoom, pan)
- Wireframe hologram with glitch effects
- Desk grid anchor for spatial reference
- Full-screen AR experience

---

## 🚀 Quick Start

**Prerequisites:**  Node.js

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your Gemini API key:**
   Create a `.env` file in the root directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000`

---

## 🎯 Features

### Core Capabilities
- 🧠 **Chat**: Advanced conversational AI with context understanding
- 🔍 **Search**: Web search powered by Google
- 🗺️ **Maps**: Location services and navigation
- 🖼️ **Imagine**: AI image generation
- 🎬 **Veo**: AI video generation
- 🎤 **Live Voice**: Real-time voice interaction

### Developer Tools
- 💻 **Code together** in the Sandbox IDE
- 🔗 **GitHub integration** for repository exploration
- 🤖 **AI code generation** and assistance
- 🐛 **Visual debugging** with screen share

### Creative Tools
- 🎨 **Generate art** with multiple AI models
- 🖼️ **Manage gallery** of creations
- 🔄 **Remix prompts** for iteration
- 🌈 **Dynamic backgrounds** for inspiration

### Intelligence
- 📊 **12-axis self-evaluation** metrics
- 🧠 **Recursive learning** from interactions
- 💾 **External memory database** with persistence
- 🎓 **Knowledge base** expansion
- ⚖️ **Ethical auditing** system

---

## 💡 Usage Examples

### Open the Sandbox
```
User: "open sandbox"
Elara: 🛠️ Sandbox IDE opened. Let's build something together!
```

### Generate Art
```
User: "open studio"
Elara: 🎨 Creative Studio opened. Let's create some art!
```

### Enter AR Hologram Mode
```
User: "open hologram"
Elara: 🔮 AR Hologram mode activated. Entering augmented reality interface!
```

### Screen Assistance
```
User: [Clicks screen share icon]
Elara: 📺 I can see your screen. How can I help?
```

### Collaborate on Code
```
User: "Let's build a calculator"
Elara: [Opens Sandbox] Great! I'll start with the HTML structure...
```

---

## 🏗️ Project Structure

```
Elara2.0/
├── components/
│   ├── Avatar3D.tsx          # 3D avatar rendering
│   ├── Dashboard.tsx         # Metrics and controls
│   ├── Sandbox.tsx           # 🆕 IDE component
│   ├── CreativeStudio.tsx    # 🆕 Image generation
│   ├── ThoughtLogger.tsx     # 🆕 Reasoning display
│   ├── LiveSession.tsx       # Voice interaction
│   └── YouTubePlayer.tsx     # Video player
├── services/
│   ├── geminiService.ts      # AI integration
│   ├── memoryDatabase.ts     # Persistent storage
│   └── githubService.ts      # 🆕 GitHub API
├── types.ts                  # TypeScript definitions
├── constants.ts              # 🆕 Model constants
├── App.tsx                   # Main application
└── NEW_CAPABILITIES.md       # 🆕 Feature documentation
```

---

## 🧪 Testing

Run the integration test suite:
```bash
bash test-integration.sh
```

All 41 tests should pass ✅

---

## 📦 Dependencies

### Core
- React 19.2.1
- TypeScript 5.8.2
- Vite 6.2.0
- @google/genai 1.31.0

### UI & Graphics
- @react-three/fiber 9.4.2
- @react-three/drei 10.7.7
- @react-three/postprocessing (latest)
- three 0.181.2
- recharts 3.5.1

### Development Tools
- prettier (for code formatting)
- react-simple-code-editor (IDE component)
- prismjs (syntax highlighting)

---

## 🎨 Customization

### Persona Modes
- Professional: Formal and precise
- Casual: Friendly and relaxed
- Empathetic: Supportive and understanding
- Humorous: Light and entertaining
- Motivational: Encouraging and inspiring
- **Adaptive**: Automatically adjusts based on context

### Themes
Elara generates dynamic backgrounds with themes including:
- Cosmic nebulas
- Digital landscapes
- Gradient waves
- Geometric patterns
- Light particles

---

## 🔧 Configuration

### Environment Variables
```bash
GEMINI_API_KEY=your_api_key_here
```

### GitHub Integration
For private repositories, add a Personal Access Token in the Sandbox UI.

### Memory Database
Stored in browser localStorage:
- `elara_messages`: Chat history
- `elara_kb`: Knowledge base
- `milla_sandbox_files`: Sandbox files
- `milla_creative_studio_images`: Generated images

---

## 🔧 Browser Compatibility

### Recommended Browsers
- **Chrome/Edge** (v100+): Full support for all features
- **Firefox** (v100+): Full support for all features
- **Safari** (v15+): Supported with minor limitations on screen share

### WebGL Requirements
The AR Hologram mode requires WebGL 2.0 support. Most modern browsers support this by default.

**To check WebGL support:**
1. Visit: https://get.webgl.org/webgl2/
2. If you see a spinning cube, WebGL is working

---

## 🐛 Troubleshooting

### Common Issues

#### AR Hologram Mode Not Loading
**Problem:** Black screen or no rendering in AR mode  
**Solutions:**
- Ensure your browser supports WebGL 2.0
- Check browser console for errors (F12)
- Update your graphics drivers
- Try a different browser (Chrome recommended)
- Disable browser extensions that block 3D rendering

#### Performance Issues / Low FPS
**Problem:** Laggy or choppy AR hologram experience  
**Solutions:**
- Close other tabs/applications to free up GPU resources
- Reduce browser window size
- Disable postprocessing effects (if custom settings added)
- Ensure hardware acceleration is enabled in browser settings
  - Chrome: `chrome://settings` → Advanced → System → Use hardware acceleration

#### React Three Fiber Errors
**Problem:** Console errors about Three.js or Fiber  
**Solutions:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure all peer dependencies are satisfied
- Check that Three.js version matches `@react-three/fiber` requirements

#### Postprocessing Effects Not Visible
**Problem:** Bloom or glow effects not showing  
**Solutions:**
- Ensure `@react-three/postprocessing` is installed
- Check that your GPU supports the effects
- Verify WebGL 2.0 is working
- Try refreshing the page

#### Build Warnings
**Problem:** Large chunk size warnings during build  
**Solutions:**
- This is expected due to Three.js size
- For production, consider code splitting
- Warning does not affect functionality

### Getting Help
If issues persist:
1. Check the browser console for errors (F12)
2. Verify all dependencies are installed: `npm install`
3. Try a clean rebuild: `npm run build`
4. Create an issue with console logs and browser info

---

## 📚 Documentation

- **NEW_CAPABILITIES.md**: Comprehensive guide to new features
- **GEMINI.md**: Original Gemini API documentation
- **MEMORY_DATABASE.md**: Memory system documentation

---

## 🤝 Contributing

Elara is designed for collaboration! Use the Sandbox to:
1. Prototype new features
2. Debug existing code
3. Experiment with AI integration
4. Build extensions

---

## 📄 License

Private project - All rights reserved

---

## 🎉 Get Started!

```bash
npm install
# Add your GEMINI_API_KEY to .env
npm run dev
# Visit http://localhost:3000
# Type: "open sandbox", "open studio", or "open hologram"
```

---

<div align="center">
<strong>Built with ❤️ using Google Gemini</strong>
<br />
<em>Your AI development partner, creative collaborator, and intelligent assistant</em>
</div>
