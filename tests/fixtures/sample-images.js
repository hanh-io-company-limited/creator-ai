// Sample training images data for testing
// Simulates 10 images for model training validation

const sampleImages = [
  {
    id: 'img_001',
    path: '/test/images/portrait_001.jpg',
    size: 1024 * 1024, // 1MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'abc123def456'
  },
  {
    id: 'img_002', 
    path: '/test/images/portrait_002.jpg',
    size: 1.2 * 1024 * 1024, // 1.2MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'def456ghi789'
  },
  {
    id: 'img_003',
    path: '/test/images/portrait_003.jpg', 
    size: 0.9 * 1024 * 1024, // 0.9MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'ghi789jkl012'
  },
  {
    id: 'img_004',
    path: '/test/images/portrait_004.jpg',
    size: 1.1 * 1024 * 1024, // 1.1MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg', 
    checksum: 'jkl012mno345'
  },
  {
    id: 'img_005',
    path: '/test/images/portrait_005.jpg',
    size: 1.3 * 1024 * 1024, // 1.3MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'mno345pqr678'
  },
  {
    id: 'img_006',
    path: '/test/images/portrait_006.jpg',
    size: 0.8 * 1024 * 1024, // 0.8MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'pqr678stu901'
  },
  {
    id: 'img_007',
    path: '/test/images/portrait_007.jpg',
    size: 1.4 * 1024 * 1024, // 1.4MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'stu901vwx234'
  },
  {
    id: 'img_008',
    path: '/test/images/portrait_008.jpg',
    size: 1.0 * 1024 * 1024, // 1MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'vwx234yza567'
  },
  {
    id: 'img_009',
    path: '/test/images/portrait_009.jpg',
    size: 1.2 * 1024 * 1024, // 1.2MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'yza567bcd890'
  },
  {
    id: 'img_010',
    path: '/test/images/portrait_010.jpg',
    size: 1.1 * 1024 * 1024, // 1.1MB
    dimensions: { width: 512, height: 512 },
    format: 'jpg',
    checksum: 'bcd890efg123'
  }
];

const sampleAudioFiles = [
  {
    id: 'audio_001',
    path: '/test/audio/voice_sample.mp3',
    size: 3.2 * 1024 * 1024, // 3.2MB
    duration: 180, // 3 minutes
    format: 'mp3',
    sampleRate: 44100,
    bitrate: 128
  },
  {
    id: 'audio_002', 
    path: '/test/audio/music_background.mp3',
    size: 5.5 * 1024 * 1024, // 5.5MB
    duration: 300, // 5 minutes
    format: 'mp3',
    sampleRate: 44100,
    bitrate: 192
  }
];

const sampleVideoConfigs = [
  {
    resolution: '1920x1080',
    format: 'mp4',
    fps: 30,
    duration: 300, // 5 minutes
    quality: 'high'
  },
  {
    resolution: '3840x2160', // 4K
    format: 'mp4', 
    fps: 30,
    duration: 300,
    quality: 'ultra'
  }
];

module.exports = {
  sampleImages,
  sampleAudioFiles,
  sampleVideoConfigs
};