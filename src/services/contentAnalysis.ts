import * as cheerio from 'cheerio';
import { ContentAnalysis, ImagePlaceholder, PlaceholderPosition } from '../types/index.js';

/**
 * 内容分析服务类
 * 负责分析网页和文档内容，识别需要图片的位置
 */
export class ContentAnalysisService {

  /**
   * 分析HTML网页内容
   */
  analyzeWebpage(htmlContent: string): ContentAnalysis {
    const $ = cheerio.load(htmlContent);
    const imagePlaceholders: ImagePlaceholder[] = [];
    const suggestions: string[] = [];

    // 1. 查找现有的img标签
    $('img').each((index, element) => {
      const $img = $(element);
      const src = $img.attr('src');
      const alt = $img.attr('alt') || '';
      
      // 如果是占位符图片或者没有src，标记为需要生成
      if (!src || src.includes('placeholder') || src.includes('example.com') || src.includes('via.placeholder')) {
        const context = this.getElementContext($, $img);
        imagePlaceholders.push({
          id: `img-${index}`,
          context,
          suggestedPrompt: this.generatePromptFromContext(context, alt),
          position: {
            selector: this.generateCSSSelector($, $img)
          },
          alt: alt || undefined
        });
      }
    });

    // 2. 查找可能需要图片的段落和章节
    const contentSections = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div.content', 'article', 'section',
      '.hero', '.banner', '.feature', '.card'
    ].join(', ');

    $(contentSections).each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      if (text.length > 20) { // 只分析有足够内容的元素
        const needsImage = this.analyzesTextForImageNeed(text);
        
        if (needsImage.score > 0.6) { // 阈值可调
          const context = text.substring(0, 200) + (text.length > 200 ? '...' : '');
          imagePlaceholders.push({
            id: `section-${index}`,
            context,
            suggestedPrompt: needsImage.suggestedPrompt,
            position: {
              selector: this.generateCSSSelector($, $element),
              section: $element.prop('tagName')?.toLowerCase()
            }
          });
        }
      }
    });

    // 3. 生成建议
    suggestions.push(
      `分析了网页内容，发现 ${imagePlaceholders.length} 个可能需要图片的位置`,
      '建议为主要内容区域添加插图来提升用户体验',
      '可以为产品介绍、功能特性等部分添加相关配图'
    );

    return {
      type: 'webpage',
      imagePlaceholders,
      suggestions
    };
  }

  /**
   * 分析文章或文档内容
   */
  analyzeArticle(textContent: string): ContentAnalysis {
    const imagePlaceholders: ImagePlaceholder[] = [];
    const suggestions: string[] = [];

    const lines = textContent.split('\n');
    let currentSection = '';
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // 检测标题
      if (this.isHeading(trimmedLine)) {
        currentSection = trimmedLine.replace(/^#+\s*/, '');
      }
      
      // 分析是否需要图片
      if (trimmedLine.length > 50) {
        const needsImage = this.analyzesTextForImageNeed(trimmedLine);
        
        if (needsImage.score > 0.7) {
          imagePlaceholders.push({
            id: `line-${index}`,
            context: currentSection ? `${currentSection}: ${trimmedLine}` : trimmedLine,
            suggestedPrompt: needsImage.suggestedPrompt,
            position: {
              line: index + 1,
              section: currentSection
            }
          });
        }
      }
    });

    suggestions.push(
      `在文章的 ${imagePlaceholders.length} 个位置建议添加配图`,
      '为重要概念和步骤添加示意图可以提升阅读体验',
      '建议在每个主要章节开头添加题图'
    );

    return {
      type: 'article',
      imagePlaceholders,
      suggestions
    };
  }

  /**
   * 分析文本是否需要图片
   */
  private analyzesTextForImageNeed(text: string): { score: number; suggestedPrompt: string } {
    let score = 0;
    let suggestedPrompt = '';

    // 检测关键词
    const imageKeywords = [
      // 产品和功能
      { keywords: ['产品', '功能', '特性', '优势', '服务'], weight: 0.8, prompt: 'modern product showcase, clean design' },
      { keywords: ['界面', 'UI', '设计', '页面', '布局'], weight: 0.9, prompt: 'clean user interface design, modern web layout' },
      { keywords: ['流程', '步骤', '方法', '过程'], weight: 0.7, prompt: 'step-by-step process illustration, infographic style' },
      
      // 技术和概念
      { keywords: ['技术', '算法', '架构', '系统'], weight: 0.6, prompt: 'technical diagram, system architecture visualization' },
      { keywords: ['数据', '统计', '图表', '分析'], weight: 0.8, prompt: 'data visualization, clean charts and graphs' },
      { keywords: ['概念', '原理', '理论'], weight: 0.5, prompt: 'conceptual illustration, educational diagram' },
      
      // 业务和场景
      { keywords: ['团队', '合作', '协作', '沟通'], weight: 0.7, prompt: 'professional team collaboration, modern office' },
      { keywords: ['成功', '增长', '提升', '优化'], weight: 0.6, prompt: 'success and growth visualization, upward trend' },
      { keywords: ['解决方案', '解决', '问题'], weight: 0.7, prompt: 'problem solving illustration, solution concept' },
      
      // 行业和领域
      { keywords: ['金融', '投资', '财务'], weight: 0.6, prompt: 'financial growth, modern banking concept' },
      { keywords: ['教育', '学习', '培训'], weight: 0.7, prompt: 'education and learning environment, modern classroom' },
      { keywords: ['医疗', '健康', '治疗'], weight: 0.6, prompt: 'healthcare and medical concept, modern hospital' },
      { keywords: ['科技', '创新', '未来'], weight: 0.8, prompt: 'technology innovation, futuristic design' }
    ];

    for (const category of imageKeywords) {
      const matchCount = category.keywords.filter(keyword => 
        text.includes(keyword)
      ).length;
      
      if (matchCount > 0) {
        score = Math.max(score, category.weight * (matchCount / category.keywords.length));
        suggestedPrompt = category.prompt;
      }
    }

    // 如果没有匹配到特定类别，使用通用prompt
    if (!suggestedPrompt) {
      suggestedPrompt = 'professional illustration, clean modern design';
    }

    return { score, suggestedPrompt };
  }

  /**
   * 获取元素的上下文内容
   */
  private getElementContext($: cheerio.CheerioAPI, $element: cheerio.Cheerio<any>): string {
    // 尝试获取周围的文本内容
    const parentText = $element.parent().text().trim();
    const siblingText = $element.siblings().text().trim();
    const altText = $element.attr('alt') || '';
    
    return [parentText, siblingText, altText]
      .filter(text => text.length > 0)
      .join(' ')
      .substring(0, 200);
  }

  /**
   * 生成CSS选择器
   */
  private generateCSSSelector($: cheerio.CheerioAPI, $element: cheerio.Cheerio<any>): string {
    const tagName = $element.prop('tagName')?.toLowerCase();
    const id = $element.attr('id');
    const className = $element.attr('class');
    
    if (id) {
      return `#${id}`;
    }
    
    if (className) {
      const firstClass = className.split(' ')[0];
      return `${tagName}.${firstClass}`;
    }
    
    // 尝试通过父元素和位置确定选择器
    const parent = $element.parent();
    const parentSelector = parent.prop('tagName')?.toLowerCase();
    const index = parent.children(tagName).index($element);
    
    return `${parentSelector} ${tagName}:nth-child(${index + 1})`;
  }

  /**
   * 检测是否为标题
   */
  private isHeading(text: string): boolean {
    return /^#+\s/.test(text) || // Markdown标题
           /^第.+章|^第.+节|^.+：$/.test(text) || // 中文章节
           /^Chapter|^Section|^\d+\./.test(text); // 英文章节
  }

  /**
   * 根据上下文生成英文prompt
   */
  private generatePromptFromContext(context: string, alt?: string): string {
    // 如果有alt文本，优先使用
    if (alt && alt.length > 0) {
      return `${alt}, professional illustration, high quality`;
    }

    // 基于上下文分析生成prompt
    const analysis = this.analyzesTextForImageNeed(context);
    return analysis.suggestedPrompt;
  }
} 