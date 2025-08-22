# Creator AI - Video Avatar Generation System

A comprehensive web application for creating AI-powered video avatars from both photos and videos.

## Features

### Core Functionality
- **Photo Avatar Creation**: Upload photos and transform them into speaking video avatars
- **Video Avatar Creation**: Upload short video clips (3-5 seconds) for enhanced avatar generation
- **Content Creation Tools**: Multiple ways to generate avatar content

### Video Upload Requirements
- **Duration**: 3-5 seconds
- **Formats**: MP4, MOV, AVI
- **Size Limit**: 50MB maximum
- **Quality**: Clear face visibility recommended

### Content Generation Options

#### 1. Script-Based Generation
- Enter custom text scripts
- AI processes text to generate synchronized speech
- Automatic lip movement and expression mapping

#### 2. Audio Synchronization
- Upload MP3 audio files
- Sync avatar movements with provided audio
- Perfect lip-sync with uploaded voice recordings

#### 3. Voice + Emotion Matching
- Generate speech from text with emotion control
- Available emotions: Neutral, Happy, Excited, Serious, Calm
- AI-driven voice synthesis with matching facial expressions

### Output Features
- **High Quality**: 1080p video output
- **Format**: MP4 for universal compatibility
- **Processing**: Real-time progress tracking
- **Download**: Direct video file download

## Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic structure with accessibility features
- **CSS3**: Modern responsive design with gradient backgrounds
- **JavaScript ES6**: Interactive functionality and file handling

### Key Components

#### File Upload System
- Drag-and-drop interface
- File validation (type, size, duration)
- Real-time preview generation
- Progress feedback

#### Processing Pipeline
- Multi-step processing simulation
- Progress bar with status updates
- Steps include:
  - Content analysis
  - Avatar model generation
  - Facial feature processing
  - Lip movement synchronization
  - Emotion mapping
  - 1080p rendering

#### User Interface
- **Responsive Design**: Works on desktop and mobile
- **Tab Navigation**: Switch between photo and video modes
- **Upload Areas**: Intuitive drag-and-drop zones
- **Content Creation**: Three distinct generation methods
- **Results Display**: Video preview with metadata

### File Structure
```
creator-ai/
├── index.html          # Main application structure
├── styles.css          # Complete styling and responsive design
├── script.js           # All JavaScript functionality
├── LICENSE             # Apache 2.0 license
└── README.md           # This documentation
```

## Usage Instructions

### 1. Upload Content
Choose between photo or video avatar creation:
- **Photos**: Any standard image format
- **Videos**: 3-5 second clips in MP4, MOV, or AVI format

### 2. Select Generation Method
- **Script**: Enter text for AI voice generation
- **Audio**: Upload MP3 file for synchronization
- **Voice + Emotion**: Combine text with emotion selection

### 3. Process and Download
- Monitor real-time processing progress
- Preview generated 1080p video
- Download final result

## Browser Compatibility
- Modern browsers with HTML5 support
- File API support for uploads
- ES6 JavaScript compatibility

## Development Setup
1. Clone the repository
2. Serve files using any web server (e.g., `python3 -m http.server`)
3. Access via `http://localhost:8080`

## Future Enhancements
- Backend integration for actual AI processing
- Cloud storage for generated videos
- User accounts and project management
- Advanced editing tools
- Multiple output formats and resolutions

## License
Apache License 2.0 - see LICENSE file for details.

## Screenshots

The application features a modern, intuitive interface with:
- Clean gradient background design
- Responsive tab navigation
- Clear upload requirements
- Real-time processing feedback
- Professional results display

Visit the live application to see the complete video avatar generation workflow in action.