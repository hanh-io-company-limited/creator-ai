# Creator AI - Video Avatar Creator

A modern web application for creating AI-powered video avatars with lip sync and emotion generation capabilities.

## Features

### 🎬 Video Upload
- Upload short video clips (3-5 seconds)
- Supported formats: MP4, MOV, AVI
- File size limit: 50MB
- Automatic duration validation
- Drag & drop interface

### 🎵 Audio Integration
- Upload audio files for lip sync
- Supported formats: MP3, WAV, M4A
- File size limit: 20MB
- Audio preview with duration display

### 📝 Script-Based Generation
- Enter custom scripts for AI voice generation
- Multiple voice profiles available:
  - Neutral Voice
  - Friendly Voice
  - Professional Voice
  - Energetic Voice
- Option to use uploaded audio voice profile

### 🎯 AI Processing
- Automatic video avatar analysis
- Audio feature processing
- Lip sync generation
- Real-time processing status updates

### 📱 User Experience
- Responsive design for mobile and desktop
- Intuitive drag & drop interface
- Real-time progress tracking
- Professional UI with modern design
- Accessibility features included

### 🎥 Output Options
- High-quality video rendering
- Multiple quality options:
  - 1080p (Recommended)
  - 720p
  - 480p
- Video download functionality
- Share capabilities

## Usage

1. **Upload Video Avatar**: Select or drag a 3-5 second video clip
2. **Add Audio**: Upload an audio file for lip sync OR enter a script
3. **Configure Settings**: Choose voice profile and output quality
4. **Generate**: Click "Generate AI Video Avatar" to start processing
5. **Download**: Save your generated video in high quality

## Technical Implementation

### Frontend Stack
- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with animations and responsive design
- **Vanilla JavaScript**: No dependencies, pure ES6+

### Key Features
- File validation and error handling
- Progress tracking with visual feedback
- Mobile-responsive design
- Accessibility features (ARIA labels, keyboard navigation)
- Modern UI with gradient backgrounds and smooth animations

### File Structure
```
creator-ai/
├── index.html          # Main application interface
├── styles.css          # Complete styling and responsive design
├── script.js           # Application logic and file handling
└── README.md           # Documentation
```

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Installation

1. Clone the repository
2. Open `index.html` in a web browser
3. Or serve via HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

## Security Features

- Client-side file validation
- File size restrictions
- Type checking for uploads
- No server-side dependencies

## Future Enhancements

- Backend integration for actual AI processing
- Real-time video preview during processing
- Advanced emotion control options
- Multiple avatar support
- Cloud storage integration

## License

Apache License 2.0 - See LICENSE file for details.