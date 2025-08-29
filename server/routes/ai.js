const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('./auth');
const AIService = require('../services/aiService');
const router = express.Router();

// Khởi tạo AI service
const aiService = new AIService();

// Middleware xác thực cho tất cả AI endpoints
router.use(authenticateToken);

// Text Generation với GPT
router.post('/text/generate', async (req, res) => {
    try {
        const { prompt, maxTokens = 150, temperature = 0.7, personality = 'creative' } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp prompt để tạo văn bản'
            });
        }

        const result = await aiService.generateText({
            prompt,
            maxTokens,
            temperature,
            personality,
            userId: req.user.id
        });

        res.json({
            success: true,
            data: {
                generatedText: result.text,
                usage: result.usage,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Text generation error:', error);
        res.status(500).json({
            error: 'Lỗi trong quá trình tạo văn bản',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Text Chat với AI Assistant
router.post('/text/chat', async (req, res) => {
    try {
        const { message, conversationId, context } = req.body;

        if (!message) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp tin nhắn'
            });
        }

        const result = await aiService.chatWithAI({
            message,
            conversationId,
            context,
            userId: req.user.id
        });

        res.json({
            success: true,
            data: {
                response: result.response,
                conversationId: result.conversationId,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Lỗi trong quá trình chat với AI',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Image Generation với Stable Diffusion
router.post('/image/generate', async (req, res) => {
    try {
        const { 
            prompt, 
            negativePrompt, 
            width = 512, 
            height = 512, 
            steps = 20,
            cfgScale = 7,
            style = 'artistic'
        } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp prompt để tạo hình ảnh'
            });
        }

        const result = await aiService.generateImage({
            prompt,
            negativePrompt,
            width,
            height,
            steps,
            cfgScale,
            style,
            userId: req.user.id
        });

        res.json({
            success: true,
            data: {
                imageUrl: result.imageUrl,
                imageData: result.imageData,
                parameters: result.parameters,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({
            error: 'Lỗi trong quá trình tạo hình ảnh',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Speech Recognition với Whisper
router.post('/speech/transcribe', async (req, res) => {
    try {
        const { audioData, audioUrl, language = 'vi' } = req.body;

        if (!audioData && !audioUrl) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp dữ liệu âm thanh hoặc URL'
            });
        }

        const result = await aiService.transcribeAudio({
            audioData,
            audioUrl,
            language,
            userId: req.user.id
        });

        res.json({
            success: true,
            data: {
                transcription: result.text,
                language: result.language,
                confidence: result.confidence,
                segments: result.segments,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Speech transcription error:', error);
        res.status(500).json({
            error: 'Lỗi trong quá trình nhận diện giọng nói',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Text to Speech
router.post('/speech/synthesize', async (req, res) => {
    try {
        const { text, voice = 'vi-VN-Standard-A', speed = 1.0 } = req.body;

        if (!text) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp văn bản để chuyển đổi thành giọng nói'
            });
        }

        const result = await aiService.synthesizeSpeech({
            text,
            voice,
            speed,
            userId: req.user.id
        });

        res.json({
            success: true,
            data: {
                audioUrl: result.audioUrl,
                audioData: result.audioData,
                duration: result.duration,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Speech synthesis error:', error);
        res.status(500).json({
            error: 'Lỗi trong quá trình chuyển đổi văn bản thành giọng nói',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// AI Models Status
router.get('/models/status', async (req, res) => {
    try {
        const status = await aiService.getModelsStatus();
        
        res.json({
            success: true,
            data: {
                models: status,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Models status error:', error);
        res.status(500).json({
            error: 'Lỗi khi kiểm tra trạng thái AI models',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// AI Suggestions cho creative workflow
router.post('/suggestions', async (req, res) => {
    try {
        const { type, context, previousWork } = req.body;

        const suggestions = await aiService.getCreativeSuggestions({
            type,
            context,
            previousWork,
            userId: req.user.id
        });

        res.json({
            success: true,
            data: {
                suggestions,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({
            error: 'Lỗi khi tạo gợi ý sáng tạo',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;