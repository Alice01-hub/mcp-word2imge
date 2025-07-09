/**
 * 智能提示词生成服务类
 * 负责根据中文内容生成合适的英文AI绘图提示词
 */
export class PromptGenerationService {
    // 中英文关键词映射
    keywordMap = new Map([
        // 基础词汇
        ['网站', 'website'],
        ['网页', 'webpage'],
        ['界面', 'user interface'],
        ['设计', 'design'],
        ['产品', 'product'],
        ['服务', 'service'],
        ['功能', 'feature'],
        ['应用', 'application'],
        ['系统', 'system'],
        ['平台', 'platform'],
        // 业务相关
        ['商务', 'business'],
        ['办公', 'office'],
        ['会议', 'meeting'],
        ['团队', 'team'],
        ['合作', 'collaboration'],
        ['沟通', 'communication'],
        ['管理', 'management'],
        ['销售', 'sales'],
        ['营销', 'marketing'],
        ['客户', 'customer'],
        // 技术相关
        ['开发', 'development'],
        ['编程', 'programming'],
        ['代码', 'code'],
        ['数据', 'data'],
        ['分析', 'analysis'],
        ['算法', 'algorithm'],
        ['人工智能', 'artificial intelligence'],
        ['机器学习', 'machine learning'],
        ['云计算', 'cloud computing'],
        ['区块链', 'blockchain'],
        // 行业领域
        ['教育', 'education'],
        ['医疗', 'healthcare'],
        ['金融', 'finance'],
        ['电商', 'e-commerce'],
        ['游戏', 'gaming'],
        ['娱乐', 'entertainment'],
        ['旅游', 'travel'],
        ['餐饮', 'restaurant'],
        ['零售', 'retail'],
        ['物流', 'logistics'],
        // 视觉风格
        ['现代', 'modern'],
        ['简约', 'minimalist'],
        ['专业', 'professional'],
        ['创新', 'innovative'],
        ['时尚', 'stylish'],
        ['优雅', 'elegant'],
        ['友好', 'friendly'],
        ['温暖', 'warm'],
        ['清新', 'fresh'],
        ['动态', 'dynamic']
    ]);
    // 风格关键词
    styleKeywords = {
        realistic: 'photorealistic, high quality, professional photography',
        illustration: 'digital illustration, vector art, clean design',
        cartoon: 'cartoon style, friendly, colorful illustration',
        artistic: 'artistic design, creative illustration, modern art style'
    };
    // 质量关键词
    qualityKeywords = {
        standard: 'good quality',
        high: 'high quality, detailed',
        ultra: 'ultra high quality, 4K, highly detailed, professional'
    };
    /**
     * 为单个占位符生成英文prompt
     */
    generatePrompt(placeholder, config = {}) {
        const { style = 'illustration', quality = 'high', includeStyle = true, language = 'auto' } = config;
        let prompt = '';
        // 1. 基础内容分析
        const basePrompt = this.extractCoreContent(placeholder.context, placeholder.suggestedPrompt);
        prompt += basePrompt;
        // 2. 添加风格关键词
        if (includeStyle) {
            prompt += `, ${this.styleKeywords[style]}`;
        }
        // 3. 添加质量关键词
        prompt += `, ${this.qualityKeywords[quality]}`;
        // 4. 添加通用优化关键词
        prompt += ', clean composition, good lighting';
        // 5. 确保prompt不会太长
        if (prompt.length > 300) {
            prompt = prompt.substring(0, 297) + '...';
        }
        return prompt.trim();
    }
    /**
     * 批量生成prompts
     */
    generatePrompts(placeholders, config = {}) {
        return placeholders.map(placeholder => ({
            placeholder,
            prompt: this.generatePrompt(placeholder, config)
        }));
    }
    /**
     * 提取核心内容并转换为英文prompt
     */
    extractCoreContent(context, suggestedPrompt) {
        // 如果已经有建议的prompt，优先使用
        if (suggestedPrompt && this.isEnglish(suggestedPrompt)) {
            return suggestedPrompt;
        }
        // 分析中文上下文
        const translatedTerms = [];
        const contextLower = context.toLowerCase();
        // 查找关键词映射
        for (const [chinese, english] of this.keywordMap) {
            if (context.includes(chinese)) {
                translatedTerms.push(english);
            }
        }
        // 如果没有找到匹配的关键词，进行智能分析
        if (translatedTerms.length === 0) {
            return this.analyzeContextAndGeneratePrompt(context);
        }
        // 组合关键词
        const basePrompt = translatedTerms.slice(0, 3).join(', '); // 最多取3个关键词
        return basePrompt;
    }
    /**
     * 智能分析上下文并生成prompt
     */
    analyzeContextAndGeneratePrompt(context) {
        // 根据上下文内容的特征进行分类
        const analysisRules = [
            {
                patterns: ['登录', '注册', '用户', '账户', '密码'],
                prompt: 'user authentication interface, login screen, secure access'
            },
            {
                patterns: ['购物', '商品', '价格', '订单', '支付'],
                prompt: 'e-commerce interface, online shopping, product display'
            },
            {
                patterns: ['搜索', '查找', '筛选', '结果'],
                prompt: 'search interface, data filtering, results display'
            },
            {
                patterns: ['图表', '数据', '统计', '报告', '分析'],
                prompt: 'data visualization, charts and graphs, analytics dashboard'
            },
            {
                patterns: ['消息', '聊天', '通知', '沟通'],
                prompt: 'messaging interface, communication app, chat design'
            },
            {
                patterns: ['设置', '配置', '偏好', '选项'],
                prompt: 'settings interface, configuration panel, user preferences'
            },
            {
                patterns: ['文档', '文章', '内容', '编辑'],
                prompt: 'document interface, content management, text editor'
            },
            {
                patterns: ['地图', '位置', '导航', '路线'],
                prompt: 'map interface, location services, navigation app'
            },
            {
                patterns: ['音乐', '视频', '媒体', '播放'],
                prompt: 'media player interface, entertainment app, multimedia'
            },
            {
                patterns: ['健康', '医疗', '运动', '健身'],
                prompt: 'health and fitness app, medical interface, wellness design'
            }
        ];
        // 查找匹配的规则
        for (const rule of analysisRules) {
            const matchCount = rule.patterns.filter(pattern => context.includes(pattern)).length;
            if (matchCount > 0) {
                return rule.prompt;
            }
        }
        // 默认通用prompt
        return 'modern user interface, clean design, professional layout';
    }
    /**
     * 判断文本是否为英文
     */
    isEnglish(text) {
        // 简单的英文检测：如果包含主要为英文字符，则认为是英文
        const englishCharCount = (text.match(/[a-zA-Z\s]/g) || []).length;
        const totalCharCount = text.length;
        return englishCharCount / totalCharCount > 0.7;
    }
    /**
     * 优化prompt以提高生成质量
     */
    optimizePrompt(rawPrompt, config = {}) {
        let optimized = rawPrompt;
        // 移除重复词汇
        const words = optimized.split(/,\s*/);
        const uniqueWords = [...new Set(words.map(word => word.trim().toLowerCase()))];
        optimized = uniqueWords.join(', ');
        // 确保有基本的质量描述符
        if (!optimized.includes('quality') && !optimized.includes('detailed')) {
            optimized += ', high quality';
        }
        // 确保有构图描述
        if (!optimized.includes('composition') && !optimized.includes('layout')) {
            optimized += ', well composed';
        }
        return optimized;
    }
    /**
     * 根据图片类型调整prompt
     */
    adjustPromptByImageType(prompt, imageType) {
        const typeAdjustments = {
            hero: prompt + ', hero image, banner style, wide format',
            icon: prompt + ', icon design, simple, clear, recognizable',
            illustration: prompt + ', detailed illustration, artistic style',
            photo: prompt + ', photorealistic, natural lighting, authentic'
        };
        return typeAdjustments[imageType] || prompt;
    }
    /**
     * 生成测试用的示例prompts
     */
    generateSamplePrompts() {
        return [
            'modern web dashboard, clean interface design, professional layout, high quality',
            'user profile interface, minimalist design, user-friendly layout, good composition',
            'e-commerce product display, clean product showcase, modern design, well lit',
            'data visualization dashboard, charts and graphs, professional analytics, clean layout',
            'mobile app interface, modern UI design, user-friendly, high quality rendering'
        ];
    }
}
//# sourceMappingURL=promptGeneration.js.map