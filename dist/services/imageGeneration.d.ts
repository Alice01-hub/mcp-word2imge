import { APIConfig, ImageGenerationRequest } from '../types/index.js';
/**
 * 图片生成服务类
 * 负责调用ModelScope AI图片生成API
 */
export declare class ImageGenerationService {
    private apiConfig;
    private readonly defaultModel;
    private readonly defaultBaseUrl;
    constructor(apiConfig: APIConfig);
    /**
     * 更新API配置
     */
    updateConfig(apiConfig: Partial<APIConfig>): void;
    /**
     * 生成单张图片
     */
    generateImage(request: ImageGenerationRequest): Promise<string>;
    /**
     * 批量生成图片
     */
    generateImages(requests: ImageGenerationRequest[]): Promise<Array<{
        prompt: string;
        imageUrl: string;
        error?: string;
    }>>;
    /**
     * 验证API配置
     */
    validateConfig(): Promise<boolean>;
    /**
     * 获取当前配置状态
     */
    getConfigStatus(): {
        hasApiKey: boolean;
        model: string;
        baseUrl: string;
    };
}
//# sourceMappingURL=imageGeneration.d.ts.map