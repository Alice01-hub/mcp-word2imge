// API配置接口
export interface APIConfig {
  apiKey: string;
  modelId?: string;
  baseUrl?: string;
}

// 图片生成请求接口
export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
}

// 图片生成响应接口
export interface ImageGenerationResponse {
  images: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

// 内容分析接口
export interface ContentAnalysis {
  type: 'webpage' | 'article' | 'document';
  imagePlaceholders: ImagePlaceholder[];
  suggestions: string[];
}

// 图片占位符接口
export interface ImagePlaceholder {
  id: string;
  context: string;
  suggestedPrompt: string;
  position: PlaceholderPosition;
  size?: ImageSize;
  alt?: string;
}

// 占位符位置接口
export interface PlaceholderPosition {
  selector?: string; // CSS选择器，用于网页
  line?: number;     // 行号，用于文档
  section?: string;  // 段落或章节名称
}

// 图片尺寸接口
export interface ImageSize {
  width?: number;
  height?: number;
  aspectRatio?: string;
}

// 智能提示词生成配置
export interface PromptGenerationConfig {
  style?: 'realistic' | 'illustration' | 'cartoon' | 'artistic';
  quality?: 'standard' | 'high' | 'ultra';
  includeStyle?: boolean;
  language?: 'auto' | 'chinese' | 'english';
}

// 网页填充结果接口
export interface WebpageFillResult {
  originalContent: string;
  modifiedContent: string;
  generatedImages: Array<{
    placeholder: ImagePlaceholder;
    imageUrl: string;
    prompt: string;
  }>;
}

// 错误响应接口
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
} 