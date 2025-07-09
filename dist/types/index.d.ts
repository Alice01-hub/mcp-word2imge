export interface APIConfig {
    apiKey: string;
    modelId?: string;
    baseUrl?: string;
}
export interface ImageGenerationRequest {
    prompt: string;
    model?: string;
}
export interface ImageGenerationResponse {
    images: Array<{
        url: string;
        revised_prompt?: string;
    }>;
}
export interface ContentAnalysis {
    type: 'webpage' | 'article' | 'document';
    imagePlaceholders: ImagePlaceholder[];
    suggestions: string[];
}
export interface ImagePlaceholder {
    id: string;
    context: string;
    suggestedPrompt: string;
    position: PlaceholderPosition;
    size?: ImageSize;
    alt?: string;
}
export interface PlaceholderPosition {
    selector?: string;
    line?: number;
    section?: string;
}
export interface ImageSize {
    width?: number;
    height?: number;
    aspectRatio?: string;
}
export interface PromptGenerationConfig {
    style?: 'realistic' | 'illustration' | 'cartoon' | 'artistic';
    quality?: 'standard' | 'high' | 'ultra';
    includeStyle?: boolean;
    language?: 'auto' | 'chinese' | 'english';
}
export interface WebpageFillResult {
    originalContent: string;
    modifiedContent: string;
    generatedImages: Array<{
        placeholder: ImagePlaceholder;
        imageUrl: string;
        prompt: string;
    }>;
}
export interface ErrorResponse {
    error: string;
    details?: string;
    code?: string;
}
//# sourceMappingURL=index.d.ts.map