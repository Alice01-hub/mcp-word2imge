import { ContentAnalysis } from '../types/index.js';
/**
 * 内容分析服务类
 * 负责分析网页和文档内容，识别需要图片的位置
 */
export declare class ContentAnalysisService {
    /**
     * 分析HTML网页内容
     */
    analyzeWebpage(htmlContent: string): ContentAnalysis;
    /**
     * 分析文章或文档内容
     */
    analyzeArticle(textContent: string): ContentAnalysis;
    /**
     * 分析文本是否需要图片
     */
    private analyzesTextForImageNeed;
    /**
     * 获取元素的上下文内容
     */
    private getElementContext;
    /**
     * 生成CSS选择器
     */
    private generateCSSSelector;
    /**
     * 检测是否为标题
     */
    private isHeading;
    /**
     * 根据上下文生成英文prompt
     */
    private generatePromptFromContext;
}
//# sourceMappingURL=contentAnalysis.d.ts.map