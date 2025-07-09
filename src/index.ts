#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { ImageGenerationService } from './services/imageGeneration.js';
import { ContentAnalysisService } from './services/contentAnalysis.js';
import { PromptGenerationService } from './services/promptGeneration.js';
import { 
  APIConfig, 
  ContentAnalysis, 
  ImagePlaceholder, 
  PromptGenerationConfig,
  WebpageFillResult 
} from './types/index.js';

/**
 * AIPIC MCP Server
 * AI图片生成服务器 - 智能为网页和文章生成合适的占位图片
 */
class AIPICServer {
  private server: McpServer;
  private imageService?: ImageGenerationService;
  private contentService: ContentAnalysisService;
  private promptService: PromptGenerationService;

  constructor() {
    this.server = new McpServer({
      name: 'aipic-server',
      version: '1.0.0',
    });

    // 初始化服务
    this.contentService = new ContentAnalysisService();
    this.promptService = new PromptGenerationService();

    this.setupTools();
    this.setupResources();
  }

  /**
   * 设置MCP工具
   */
  private setupTools() {
    
    // 1. 配置API密钥工具
    this.server.registerTool(
      'configure-api',
      {
        title: '配置API密钥',
        description: '配置ModelScope API密钥以启用图片生成功能',
        inputSchema: {
          apiKey: z.string().describe('ModelScope API密钥'),
          modelId: z.string().optional().describe('可选的模型ID，默认使用FLUX模型'),
          baseUrl: z.string().optional().describe('可选的API基础URL')
        }
      },
      async ({ apiKey, modelId, baseUrl }) => {
        try {
          const config: APIConfig = {
            apiKey,
            modelId: modelId || 'MusePublic/489_ckpt_FLUX_1',
            baseUrl: baseUrl || 'https://api-inference.modelscope.cn/v1/images/generations'
          };

          this.imageService = new ImageGenerationService(config);
          
          // 验证配置
          const isValid = await this.imageService.validateConfig();
          
          if (isValid) {
            return {
              content: [{
                type: 'text',
                text: '✅ API配置成功！可以开始使用图片生成功能了。'
              }]
            };
          } else {
            return {
              content: [{
                type: 'text',
                text: '❌ API配置验证失败，请检查密钥是否正确。'
              }],
              isError: true
            };
          }
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `配置失败: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    // 2. 分析网页内容工具
    this.server.registerTool(
      'analyze-webpage',
      {
        title: '分析网页内容',
        description: '分析HTML网页内容，识别需要图片的位置',
        inputSchema: {
          htmlContent: z.string().describe('网页的HTML内容')
        }
      },
      async ({ htmlContent }) => {
        try {
          const analysis = this.contentService.analyzeWebpage(htmlContent);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                summary: `发现 ${analysis.imagePlaceholders.length} 个需要图片的位置`,
                placeholders: analysis.imagePlaceholders,
                suggestions: analysis.suggestions
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `分析失败: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    // 3. 分析文章内容工具
    this.server.registerTool(
      'analyze-article',
      {
        title: '分析文章内容',
        description: '分析文章或文档内容，识别需要图片的位置',
        inputSchema: {
          textContent: z.string().describe('文章或文档的文本内容')
        }
      },
      async ({ textContent }) => {
        try {
          const analysis = this.contentService.analyzeArticle(textContent);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                summary: `在文章中发现 ${analysis.imagePlaceholders.length} 个适合添加图片的位置`,
                placeholders: analysis.imagePlaceholders,
                suggestions: analysis.suggestions
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `分析失败: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    // 4. 生成英文提示词工具
    this.server.registerTool(
      'generate-prompts',
      {
        title: '生成英文提示词',
        description: '为图片占位符生成合适的英文AI绘图提示词',
        inputSchema: {
          placeholders: z.array(z.object({
            id: z.string(),
            context: z.string(),
            suggestedPrompt: z.string(),
            position: z.object({
              selector: z.string().optional(),
              line: z.number().optional(),
              section: z.string().optional()
            }),
            size: z.object({
              width: z.number().optional(),
              height: z.number().optional(),
              aspectRatio: z.string().optional()
            }).optional(),
            alt: z.string().optional()
          })).describe('图片占位符数组'),
          config: z.object({
            style: z.enum(['realistic', 'illustration', 'cartoon', 'artistic']).optional(),
            quality: z.enum(['standard', 'high', 'ultra']).optional(),
            includeStyle: z.boolean().optional(),
            language: z.enum(['auto', 'chinese', 'english']).optional()
          }).optional().describe('生成配置')
        }
      },
      async ({ placeholders, config = {} }) => {
        try {
          const results = this.promptService.generatePrompts(placeholders, config);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                count: results.length,
                prompts: results.map(r => ({
                  id: r.placeholder.id,
                  context: r.placeholder.context.substring(0, 100) + '...',
                  prompt: r.prompt
                }))
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `提示词生成失败: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    // 5. 生成图片工具
    this.server.registerTool(
      'generate-images',
      {
        title: '生成图片',
        description: '使用AI模型生成图片',
        inputSchema: {
          prompts: z.array(z.string()).describe('英文提示词数组'),
          batchSize: z.number().optional().describe('批处理大小，默认为5')
        }
      },
      async ({ prompts, batchSize = 5 }) => {
        if (!this.imageService) {
          return {
            content: [{
              type: 'text',
              text: '❌ 请先使用 configure-api 工具配置API密钥'
            }],
            isError: true
          };
        }

        try {
          console.log(`开始生成 ${prompts.length} 张图片...`);
          
          const requests = prompts.map(prompt => ({ prompt }));
          const results = await this.imageService.generateImages(requests);
          
          const successCount = results.filter(r => !r.error).length;
          const failureCount = results.filter(r => r.error).length;
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                summary: `成功生成 ${successCount} 张图片，失败 ${failureCount} 张`,
                results: results.map(r => ({
                  prompt: r.prompt.substring(0, 50) + '...',
                  imageUrl: r.imageUrl,
                  error: r.error
                }))
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `图片生成失败: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    // 6. 一键处理网页工具
    this.server.registerTool(
      'process-webpage-complete',
      {
        title: '一键处理网页',
        description: '完整处理网页：分析内容、生成提示词、生成图片并返回修改后的HTML',
        inputSchema: {
          htmlContent: z.string().describe('原始HTML内容'),
          apiKey: z.string().describe('ModelScope API密钥'),
          config: z.object({
            style: z.enum(['realistic', 'illustration', 'cartoon', 'artistic']).optional(),
            quality: z.enum(['standard', 'high', 'ultra']).optional(),
            maxImages: z.number().optional().describe('最大生成图片数量，默认10')
          }).optional()
        }
      },
      async ({ htmlContent, apiKey, config = {} }) => {
        try {
          // 1. 配置API
          if (!this.imageService || this.imageService.getConfigStatus().hasApiKey !== true) {
            this.imageService = new ImageGenerationService({ apiKey });
          }

          // 2. 分析内容
          const analysis = this.contentService.analyzeWebpage(htmlContent);
          
          // 3. 限制图片数量
          const maxImages = config.maxImages || 10;
          const placeholders = analysis.imagePlaceholders.slice(0, maxImages);
          
          if (placeholders.length === 0) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  message: '未在网页中发现需要图片的位置',
                  originalContent: htmlContent,
                  modifiedContent: htmlContent,
                  generatedImages: []
                }, null, 2)
              }]
            };
          }

          // 4. 生成提示词
          const promptResults = this.promptService.generatePrompts(placeholders, config);
          
          // 5. 生成图片
          const imageRequests = promptResults.map(r => ({ prompt: r.prompt }));
          const imageResults = await this.imageService.generateImages(imageRequests);
          
          // 6. 填充图片到HTML
          const result = this.fillImagesIntoHtml(htmlContent, placeholders, imageResults);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };

        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `处理失败: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );
  }

  /**
   * 设置MCP资源
   */
  private setupResources() {
    // 服务状态资源
    this.server.registerResource(
      'status',
      'aipic://status',
      {
        title: 'AIPIC服务状态',
        description: '查看AIPIC服务的当前状态',
        mimeType: 'application/json'
      },
      async () => {
        const status = {
          server: 'AIPIC Server v1.0.0',
          apiConfigured: !!this.imageService,
          services: {
            contentAnalysis: '✅ 可用',
            promptGeneration: '✅ 可用',
            imageGeneration: this.imageService ? '✅ 已配置' : '❌ 需要配置API密钥'
          },
          supportedFeatures: [
            '网页内容分析',
            '文章内容分析',
            '智能英文提示词生成',
            'AI图片生成',
            '一键网页处理'
          ]
        };

        return {
          contents: [{
            uri: 'aipic://status',
            text: JSON.stringify(status, null, 2)
          }]
        };
      }
    );

    // 示例提示词资源
    this.server.registerResource(
      'sample-prompts',
      'aipic://sample-prompts',
      {
        title: '示例提示词',
        description: '查看AI绘图的示例提示词',
        mimeType: 'application/json'
      },
      async () => {
        const samples = this.promptService.generateSamplePrompts();
        
        return {
          contents: [{
            uri: 'aipic://sample-prompts',
            text: JSON.stringify({
              description: '这些是AIPIC生成的示例英文提示词',
              samples
            }, null, 2)
          }]
        };
      }
    );
  }

  /**
   * 将生成的图片填充到HTML中
   */
  private fillImagesIntoHtml(
    htmlContent: string,
    placeholders: ImagePlaceholder[],
    imageResults: Array<{ prompt: string; imageUrl: string; error?: string; }>
  ): WebpageFillResult {
    let modifiedContent = htmlContent;
    const generatedImages: Array<{
      placeholder: ImagePlaceholder;
      imageUrl: string;
      prompt: string;
    }> = [];

    placeholders.forEach((placeholder, index) => {
      const imageResult = imageResults[index];
      
      if (imageResult && imageResult.imageUrl && !imageResult.error) {
        // 根据占位符类型决定如何插入图片
        if (placeholder.position.selector) {
          // 网页模式：根据选择器插入
          const imgTag = `<img src="${imageResult.imageUrl}" alt="${placeholder.alt || 'AI生成图片'}" style="max-width: 100%; height: auto;" />`;
          
          // 简单的替换策略（实际应用中可能需要更复杂的DOM操作）
          if (placeholder.position.selector.includes('img')) {
            // 替换现有img标签
            const imgRegex = /<img[^>]*>/gi;
            const matches = htmlContent.match(imgRegex);
            if (matches && matches[index]) {
              modifiedContent = modifiedContent.replace(matches[index], imgTag);
            }
          } else {
            // 在指定位置插入图片
            const insertPosition = modifiedContent.indexOf(`</${placeholder.position.section}>`);
            if (insertPosition > -1) {
              modifiedContent = modifiedContent.slice(0, insertPosition) + 
                              imgTag + 
                              modifiedContent.slice(insertPosition);
            }
          }
        }

        generatedImages.push({
          placeholder,
          imageUrl: imageResult.imageUrl,
          prompt: imageResult.prompt
        });
      }
    });

    return {
      originalContent: htmlContent,
      modifiedContent,
      generatedImages
    };
  }

  /**
   * 启动服务器
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('🎨 AIPIC MCP Server 已启动');
    console.error('📝 使用 configure-api 工具配置API密钥开始使用');
  }
}

// 启动服务器
async function main() {
  try {
    const server = new AIPICServer();
    await server.start();
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 