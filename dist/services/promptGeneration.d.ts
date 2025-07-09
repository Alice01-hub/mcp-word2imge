import { PromptGenerationConfig, ImagePlaceholder } from '../types/index.js';
/**
 * 智能提示词生成服务类
 * 负责根据中文内容生成合适的英文AI绘图提示词
 */
export declare class PromptGenerationService {
    private readonly keywordMap;
    private readonly styleKeywords;
    private readonly qualityKeywords;
    /**
     * 为单个占位符生成英文prompt
     */
    generatePrompt(placeholder: ImagePlaceholder, config?: PromptGenerationConfig): string;
    /**
     * 批量生成prompts
     */
    generatePrompts(placeholders: ImagePlaceholder[], config?: PromptGenerationConfig): Array<{
        placeholder: ImagePlaceholder;
        prompt: string;
    }>;
    /**
     * 提取核心内容并转换为英文prompt
     */
    private extractCoreContent;
    /**
     * 智能分析上下文并生成prompt
     */
    private analyzeContextAndGeneratePrompt;
    /**
     * 判断文本是否为英文
     */
    private isEnglish;
    /**
     * 优化prompt以提高生成质量
     */
    optimizePrompt(rawPrompt: string, config?: PromptGenerationConfig): string;
    /**
     * 根据图片类型调整prompt
     */
    adjustPromptByImageType(prompt: string, imageType: 'hero' | 'icon' | 'illustration' | 'photo'): string;
    /**
     * 生成测试用的示例prompts
     */
    generateSamplePrompts(): string[];
}
//# sourceMappingURL=promptGeneration.d.ts.map