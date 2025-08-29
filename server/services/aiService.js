const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AIService {
    constructor() {
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.stableDiffusionUrl = process.env.STABLE_DIFFUSION_API_URL || 'http://localhost:7860';
        this.whisperUrl = process.env.WHISPER_API_URL || 'http://localhost:8080';
        
        // Conversation memory (trong production nên lưu vào database)
        this.conversations = new Map();
        
        // AI personalities cho creative experience
        this.personalities = {
            creative: {
                systemPrompt: "Bạn là một AI sáng tạo đầy cảm hứng, luôn hỗ trợ người dùng trong các hoạt động nghệ thuật và sáng tạo. Hãy trả lời bằng tiếng Việt một cách thân thiện và đầy nhiệt huyết.",
                temperature: 0.8,
                style: "creative"
            },
            professional: {
                systemPrompt: "Bạn là một AI chuyên nghiệp, cung cấp thông tin chính xác và hữu ích. Hãy trả lời bằng tiếng Việt một cách chuyên nghiệp và rõ ràng.",
                temperature: 0.5,
                style: "professional"
            },
            friendly: {
                systemPrompt: "Bạn là một AI thân thiện như một người bạn, luôn sẵn sàng trò chuyện và hỗ trợ. Hãy trả lời bằng tiếng Việt một cách gần gũi và ấm áp.",
                temperature: 0.7,
                style: "friendly"
            }
        };
    }

    // Text Generation với OpenAI GPT
    async generateText({ prompt, maxTokens = 150, temperature = 0.7, personality = 'creative', userId }) {
        try {
            if (!this.openaiApiKey) {
                throw new Error('OpenAI API key chưa được cấu hình');
            }

            const personalityConfig = this.personalities[personality] || this.personalities.creative;
            const systemPrompt = personalityConfig.systemPrompt;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                max_tokens: maxTokens,
                temperature: personalityConfig.temperature || temperature,
                presence_penalty: 0.6,
                frequency_penalty: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                text: response.data.choices[0].message.content,
                usage: response.data.usage,
                model: response.data.model
            };

        } catch (error) {
            console.error('Text generation error:', error.response?.data || error.message);
            throw new Error(`Lỗi tạo văn bản: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    // Chat với AI Assistant
    async chatWithAI({ message, conversationId, context, userId }) {
        try {
            conversationId = conversationId || `conv_${userId}_${Date.now()}`;
            
            // Lấy hoặc tạo conversation history
            if (!this.conversations.has(conversationId)) {
                this.conversations.set(conversationId, []);
            }
            
            const conversation = this.conversations.get(conversationId);
            
            // Thêm context nếu có
            const messages = [];
            if (context) {
                messages.push({ role: 'system', content: context });
            } else {
                messages.push({ 
                    role: 'system', 
                    content: this.personalities.creative.systemPrompt 
                });
            }
            
            // Thêm conversation history (giới hạn 10 tin nhắn gần nhất)
            messages.push(...conversation.slice(-10));
            
            // Thêm tin nhắn hiện tại
            messages.push({ role: 'user', content: message });

            const response = await this.generateText({
                prompt: message,
                maxTokens: 200,
                temperature: 0.7,
                personality: 'creative',
                userId
            });

            // Lưu vào conversation history
            conversation.push({ role: 'user', content: message });
            conversation.push({ role: 'assistant', content: response.text });
            
            // Giới hạn conversation history (tối đa 50 tin nhắn)
            if (conversation.length > 50) {
                conversation.splice(0, conversation.length - 50);
            }

            return {
                response: response.text,
                conversationId,
                usage: response.usage
            };

        } catch (error) {
            console.error('Chat error:', error);
            throw new Error(`Lỗi chat: ${error.message}`);
        }
    }

    // Image Generation với Stable Diffusion
    async generateImage({ prompt, negativePrompt, width = 512, height = 512, steps = 20, cfgScale = 7, style = 'artistic', userId }) {
        try {
            // Enhance prompt based on style
            const stylePrompts = {
                artistic: "masterpiece, best quality, highly detailed, artistic, beautiful",
                realistic: "photorealistic, high resolution, detailed, realistic lighting",
                anime: "anime style, manga, colorful, detailed, beautiful art",
                painting: "oil painting, classical art, masterpiece, detailed brushwork"
            };

            const enhancedPrompt = `${stylePrompts[style] || stylePrompts.artistic}, ${prompt}`;
            const defaultNegativePrompt = "low quality, blurry, distorted, ugly, bad anatomy, bad hands, text, watermark";
            
            const requestData = {
                prompt: enhancedPrompt,
                negative_prompt: negativePrompt ? `${defaultNegativePrompt}, ${negativePrompt}` : defaultNegativePrompt,
                width,
                height,
                steps,
                cfg_scale: cfgScale,
                sampler_name: "DPM++ 2M Karras",
                n_iter: 1,
                batch_size: 1
            };

            try {
                // Thử kết nối với Stable Diffusion local API
                const response = await axios.post(`${this.stableDiffusionUrl}/sdapi/v1/txt2img`, requestData, {
                    timeout: 60000 // 60 seconds timeout
                });

                const imageData = response.data.images[0];
                const filename = `generated_${Date.now()}_${userId}.png`;
                const imagePath = path.join(__dirname, '../../uploads', userId, filename);
                
                // Tạo thư mục nếu chưa tồn tại
                await fs.mkdir(path.dirname(imagePath), { recursive: true });
                
                // Lưu image
                await fs.writeFile(imagePath, Buffer.from(imageData, 'base64'));

                return {
                    imageUrl: `/api/upload/file/${filename}`,
                    imageData: `data:image/png;base64,${imageData}`,
                    parameters: requestData
                };

            } catch (localError) {
                console.warn('Local Stable Diffusion not available, falling back to mock generation');
                
                // Fallback: tạo placeholder image hoặc sử dụng API khác
                return {
                    imageUrl: 'https://via.placeholder.com/512x512/FF6B6B/FFFFFF?text=AI+Generated+Image',
                    imageData: null,
                    parameters: requestData,
                    note: 'Đây là placeholder - cần cấu hình Stable Diffusion API'
                };
            }

        } catch (error) {
            console.error('Image generation error:', error);
            throw new Error(`Lỗi tạo hình ảnh: ${error.message}`);
        }
    }

    // Speech Recognition với Whisper
    async transcribeAudio({ audioData, audioUrl, language = 'vi', userId }) {
        try {
            let audioBuffer;
            
            if (audioUrl) {
                // Download audio từ URL
                const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                audioBuffer = Buffer.from(response.data);
            } else if (audioData) {
                // Decode base64 audio data
                audioBuffer = Buffer.from(audioData, 'base64');
            } else {
                throw new Error('Không có dữ liệu âm thanh');
            }

            try {
                // Thử sử dụng local Whisper API
                const formData = new FormData();
                formData.append('audio', new Blob([audioBuffer]), 'audio.wav');
                formData.append('language', language);

                const response = await axios.post(`${this.whisperUrl}/v1/audio/transcriptions`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 30000
                });

                return {
                    text: response.data.text,
                    language: response.data.language,
                    confidence: response.data.confidence || 0.9,
                    segments: response.data.segments || []
                };

            } catch (localError) {
                console.warn('Local Whisper not available, using OpenAI Whisper API');
                
                if (!this.openaiApiKey) {
                    throw new Error('Cần OpenAI API key để sử dụng Whisper');
                }

                // Fallback to OpenAI Whisper API
                const formData = new FormData();
                formData.append('file', new Blob([audioBuffer]), 'audio.wav');
                formData.append('model', 'whisper-1');
                formData.append('language', language);

                const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                    headers: {
                        'Authorization': `Bearer ${this.openaiApiKey}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                return {
                    text: response.data.text,
                    language: language,
                    confidence: 0.85,
                    segments: []
                };
            }

        } catch (error) {
            console.error('Speech transcription error:', error);
            throw new Error(`Lỗi nhận diện giọng nói: ${error.message}`);
        }
    }

    // Text to Speech
    async synthesizeSpeech({ text, voice = 'vi-VN-Standard-A', speed = 1.0, userId }) {
        try {
            if (!this.openaiApiKey) {
                throw new Error('OpenAI API key chưa được cấu hình cho Text-to-Speech');
            }

            const response = await axios.post('https://api.openai.com/v1/audio/speech', {
                model: 'tts-1',
                input: text,
                voice: 'alloy', // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
                speed: speed
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            const filename = `speech_${Date.now()}_${userId}.mp3`;
            const audioPath = path.join(__dirname, '../../uploads', userId, filename);
            
            // Tạo thư mục nếu chưa tồn tại
            await fs.mkdir(path.dirname(audioPath), { recursive: true });
            
            // Lưu audio file
            await fs.writeFile(audioPath, Buffer.from(response.data));

            return {
                audioUrl: `/api/upload/file/${filename}`,
                audioData: Buffer.from(response.data).toString('base64'),
                duration: null // Có thể tính toán thời lượng nếu cần
            };

        } catch (error) {
            console.error('Speech synthesis error:', error);
            throw new Error(`Lỗi chuyển đổi text thành speech: ${error.message}`);
        }
    }

    // Check AI Models Status
    async getModelsStatus() {
        const status = {
            gpt: { available: false, model: null },
            stableDiffusion: { available: false, model: null },
            whisper: { available: false, model: null }
        };

        // Check OpenAI GPT
        if (this.openaiApiKey) {
            try {
                await axios.get('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${this.openaiApiKey}` },
                    timeout: 5000
                });
                status.gpt.available = true;
                status.gpt.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
            } catch (error) {
                console.warn('OpenAI API not available:', error.message);
            }
        }

        // Check Stable Diffusion
        try {
            await axios.get(`${this.stableDiffusionUrl}/sdapi/v1/options`, { timeout: 5000 });
            status.stableDiffusion.available = true;
            status.stableDiffusion.model = 'Stable Diffusion';
        } catch (error) {
            console.warn('Stable Diffusion API not available:', error.message);
        }

        // Check Whisper
        try {
            await axios.get(`${this.whisperUrl}/health`, { timeout: 5000 });
            status.whisper.available = true;
            status.whisper.model = process.env.WHISPER_MODEL || 'base';
        } catch (error) {
            console.warn('Whisper API not available:', error.message);
        }

        return status;
    }

    // Creative Suggestions
    async getCreativeSuggestions({ type, context, previousWork, userId }) {
        try {
            const suggestions = {
                text: [],
                image: [],
                audio: [],
                workflow: []
            };

            const prompt = `Dựa trên ngữ cảnh: "${context}" và loại công việc sáng tạo: "${type}", hãy đưa ra 5 gợi ý sáng tạo cụ thể bằng tiếng Việt. Mỗi gợi ý nên ngắn gọn, thực tế và có thể thực hiện được.`;

            const response = await this.generateText({
                prompt,
                maxTokens: 200,
                temperature: 0.8,
                personality: 'creative',
                userId
            });

            // Parse suggestions từ response
            const lines = response.text.split('\n').filter(line => line.trim());
            suggestions[type] = lines.map((line, index) => ({
                id: `suggestion_${Date.now()}_${index}`,
                text: line.replace(/^\d+\.\s*/, '').trim(),
                type,
                timestamp: new Date().toISOString()
            }));

            return suggestions;

        } catch (error) {
            console.error('Creative suggestions error:', error);
            throw new Error(`Lỗi tạo gợi ý sáng tạo: ${error.message}`);
        }
    }
}

module.exports = AIService;