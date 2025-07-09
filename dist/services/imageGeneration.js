import axios from 'axios';
/**
 * 图片生成服务类
 * 负责调用ModelScope AI图片生成API
 */
export class ImageGenerationService {
    apiConfig;
    defaultModel = 'MusePublic/489_ckpt_FLUX_1';
    defaultBaseUrl = 'https://api-inference.modelscope.cn/v1/images/generations';
    constructor(apiConfig) {
        this.apiConfig = {
            ...apiConfig,
            modelId: apiConfig.modelId || this.defaultModel,
            baseUrl: apiConfig.baseUrl || this.defaultBaseUrl
        };
    }
    /**
     * 更新API配置
     */
    updateConfig(apiConfig) {
        this.apiConfig = { ...this.apiConfig, ...apiConfig };
    }
    /**
     * 生成单张图片
     */
    async generateImage(request) {
        try {
            const payload = {
                model: request.model || this.apiConfig.modelId,
                prompt: request.prompt
            };
            const headers = {
                'Authorization': `Bearer ${this.apiConfig.apiKey}`,
                'Content-Type': 'application/json'
            };
            console.log(`[图片生成] 开始生成图片，提示词: "${request.prompt}"`);
            const response = await axios.post(this.apiConfig.baseUrl, payload, { headers });
            const responseData = response.data;
            if (!responseData.images || responseData.images.length === 0) {
                throw new Error('API返回结果中没有生成的图片');
            }
            const imageUrl = responseData.images[0].url;
            console.log(`[图片生成] 成功生成图片: ${imageUrl}`);
            return imageUrl;
        }
        catch (error) {
            console.error('[图片生成] 生成失败:', error);
            if (error.response) {
                const errorMsg = `API请求失败 (状态码: ${error.response.status}): ${error.response.data?.message || error.response.statusText}`;
                throw new Error(errorMsg);
            }
            if (error.request) {
                throw new Error('无法连接到图片生成API服务');
            }
            throw new Error(`图片生成失败: ${error.message}`);
        }
    }
    /**
     * 批量生成图片
     */
    async generateImages(requests) {
        console.log(`[批量图片生成] 开始生成 ${requests.length} 张图片`);
        const results = await Promise.allSettled(requests.map(async (request) => {
            const imageUrl = await this.generateImage(request);
            return {
                prompt: request.prompt,
                imageUrl,
            };
        }));
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                console.error(`[批量图片生成] 第${index + 1}张图片生成失败:`, result.reason);
                return {
                    prompt: requests[index].prompt,
                    imageUrl: '',
                    error: result.reason.message || '未知错误'
                };
            }
        });
    }
    /**
     * 验证API配置
     */
    async validateConfig() {
        try {
            // 使用简单的测试提示词验证API配置
            const testPrompt = "A simple test image";
            await this.generateImage({ prompt: testPrompt });
            return true;
        }
        catch (error) {
            console.error('[配置验证] API配置验证失败:', error);
            return false;
        }
    }
    /**
     * 获取当前配置状态
     */
    getConfigStatus() {
        return {
            hasApiKey: !!this.apiConfig.apiKey,
            model: this.apiConfig.modelId || this.defaultModel,
            baseUrl: this.apiConfig.baseUrl || this.defaultBaseUrl
        };
    }
}
//# sourceMappingURL=imageGeneration.js.map