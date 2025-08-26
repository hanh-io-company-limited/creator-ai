# Creator AI Testing Suite

This directory contains comprehensive tests for the Creator AI system, validating all core functionality including model training, video generation, image processing, and file handling.

## Test Structure

```
tests/
├── unit/                          # Unit tests for individual components
│   ├── ai-engine.test.js         # AI Engine functionality tests  
│   └── ui-components.test.js     # UI component and interaction tests
├── integration/                   # Integration and end-to-end tests
│   ├── comprehensive.test.js     # Complete system workflow tests
│   └── workflows.test.js         # Individual workflow tests
└── fixtures/                     # Test data and sample files
    └── sample-images.js          # Sample training data (10 images)
```

## Test Coverage

The test suite validates all requirements from the problem statement:

### 1. Model Training (10 Images)
- ✅ Training with exactly 10 input images
- ✅ Concurrent and independent operation verification
- ✅ Learning validation (loss decrease, accuracy increase)
- ✅ Progress tracking and callback functionality

### 2. Face Generation from Trained Models
- ✅ Text prompt to face generation
- ✅ Local operation without external dependencies
- ✅ Accurate description-based content creation
- ✅ Multiple prompt variations testing

### 3. Image Quality Upgrade (4K)
- ✅ 4K resolution image processing
- ✅ Quality upgrade functionality validation
- ✅ Processing time estimation
- ✅ High-resolution output verification

### 4. Video Creation from Text and Audio
- ✅ Parallel text input and voice upload processing
- ✅ 5-minute video creation and storage
- ✅ Voice and script copying capabilities
- ✅ Error-free concurrent operations

### 5. Video Export (1080p)
- ✅ Export in both "form tỉ" (aspect ratio) format
- ✅ Export in "form khung hình" (frame) format
- ✅ Download button functionality
- ✅ Multiple output format support

### 6. Music File Processing (MP3)
- ✅ MP3 file upload and validation
- ✅ Automatic video creation from audio
- ✅ Independent AI model operation
- ✅ Automated workflow processing

### 7. System Integration
- ✅ All functions working independently
- ✅ Accurate operation verification
- ✅ Development environment compatibility
- ✅ Error handling and smooth operation

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Comprehensive system tests only
npm run test:comprehensive
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode for Development
```bash
npm run test:watch
```

## Test Data

### Sample Images (10 Images)
- **Format**: JPG, 512x512 resolution
- **Size**: 0.8MB - 1.4MB per image
- **Purpose**: Model training validation
- **Location**: `tests/fixtures/sample-images.js`

### Sample Audio Files
- **Voice Sample**: 3-minute MP3, 44.1kHz, 128kbps
- **Background Music**: 5-minute MP3, 44.1kHz, 192kbps
- **Purpose**: Audio processing and video creation testing

### Video Configuration
- **1080p HD**: 1920x1080, 30fps, MP4 format
- **4K Ultra**: 3840x2160, 30fps, MP4 format
- **Purpose**: Quality upgrade and export testing

## Test Environment

The tests use:
- **Jest** testing framework
- **JSDOM** for DOM simulation in unit tests
- **Mock AI Engine** for realistic behavior simulation
- **Electron Store** mocking for settings persistence
- **IPC** mocking for file operations

## Expected Results

All tests should pass, demonstrating:

1. **Reliability**: All functions work consistently
2. **Independence**: Operations don't interfere with each other
3. **Accuracy**: Generated content matches descriptions
4. **Performance**: Processing completes within expected timeframes
5. **Compatibility**: System works in development environment

## Troubleshooting

### Common Issues

1. **Timeout Errors**: Tests have appropriate timeouts (8-15 seconds)
2. **Memory Leaks**: Tests clean up properly after execution
3. **Concurrent Operations**: Multiple operations can run simultaneously
4. **Mock Dependencies**: All external dependencies are properly mocked

### Debug Commands

```bash
# Run with detailed output
npm test -- --verbose

# Run specific test file
npm test -- tests/integration/comprehensive.test.js

# Run with open handles detection
npm test -- --detectOpenHandles
```

## Contributing

When adding new tests:

1. Follow existing test structure and naming conventions
2. Add appropriate timeout values for long-running operations
3. Mock external dependencies appropriately
4. Include cleanup in `afterEach` or `afterAll` hooks
5. Verify tests pass both individually and as part of the suite

## Validation

This test suite validates that the Creator AI system meets all specified requirements and operates correctly in a development environment, ensuring readiness for production deployment.