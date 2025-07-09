# AIPIC MCP Server

🎨 **AI图片生成MCP服务器** - 智能为网页和文章生成合适的占位图片

## 项目简介

AIPIC (AI Picture Generation) MCP Server 是一个基于 Model Context Protocol (MCP) 的智能图片生成服务器。它能够：

- 🔍 **智能分析**：自动理解和规划用户所需要的图片信息
- 🎯 **智能提示词**：生成合适的英文文生图prompt提示词（支持ModelScope API）
- 🖼️ **自动生成**：调用AI模型生成对应网页所需的全部占位图片
- 🔄 **自动填充**：将返回的图片链接填充到对应的网页区域
- 📝 **多场景支持**：支持网页开发和图文类文章等多种需要图片的场景

## 核心功能

### 1. 网页内容分析
- 自动检测HTML中的占位符图片
- 识别需要配图的内容区域
- 分析上下文生成合适的图片建议

### 2. 文章内容分析
- 智能分析文章结构和内容
- 识别适合添加配图的位置
- 为重要概念和步骤推荐图片

### 3. 智能提示词生成
- 中英文关键词智能映射
- 根据内容上下文生成英文prompt
- 支持多种风格和质量配置

### 4. AI图片生成
- 集成ModelScope FLUX模型
- 支持批量图片生成
- 自动处理API调用和错误处理

### 5. 自动图片填充
- 智能替换HTML中的占位符图片
- 保持原有布局和样式
- 生成完整的修改后网页

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm
- ModelScope API密钥

### 安装和启动

1. **一键启动（推荐）**：
```bash
cd AIPIC
./startup.sh
```

2. **手动启动**：
```bash
cd AIPIC
npm install
npm run build
npm start
```

### 基本使用

#### 1. 配置API密钥

首先需要配置ModelScope API密钥：

```bash
# 在MCP客户端中调用
configure-api --apiKey "f9d44627-d6f6-4cc6-96fc-79558a5a0739"
```

#### 2. 分析网页内容

```bash
# 分析HTML网页
analyze-webpage --htmlContent "<html>...</html>"

# 分析文章内容
analyze-article --textContent "这是一篇关于AI技术的文章..."
```

#### 3. 生成提示词

```bash
generate-prompts --placeholders [...] --config { "style": "illustration", "quality": "high" }
```

#### 4. 生成图片

```bash
generate-images --prompts ["modern web interface", "user dashboard design"]
```

#### 5. 一键处理网页

```bash
process-webpage-complete --htmlContent "<html>...</html>" --apiKey "your-api-key"
```

## MCP工具详解

### configure-api
**配置ModelScope API密钥**

参数：
- `apiKey` (string): ModelScope API密钥
- `modelId` (string, 可选): 模型ID，默认使用FLUX模型
- `baseUrl` (string, 可选): API基础URL

### analyze-webpage
**分析HTML网页内容**

参数：
- `htmlContent` (string): 网页的HTML内容

返回：发现的图片占位符和建议

### analyze-article
**分析文章或文档内容**

参数：
- `textContent` (string): 文章或文档的文本内容

返回：适合添加图片的位置和建议

### generate-prompts
**生成英文AI绘图提示词**

参数：
- `placeholders` (array): 图片占位符数组
- `config` (object, 可选): 生成配置
  - `style`: 'realistic' | 'illustration' | 'cartoon' | 'artistic'
  - `quality`: 'standard' | 'high' | 'ultra'
  - `includeStyle`: boolean
  - `language`: 'auto' | 'chinese' | 'english'

### generate-images
**使用AI模型生成图片**

参数：
- `prompts` (array): 英文提示词数组
- `batchSize` (number, 可选): 批处理大小

### process-webpage-complete
**一键处理网页**

参数：
- `htmlContent` (string): 原始HTML内容
- `apiKey` (string): ModelScope API密钥
- `config` (object, 可选): 处理配置
  - `style`: 图片风格
  - `quality`: 图片质量
  - `maxImages`: 最大生成图片数量

## MCP资源

### aipic://status
查看服务器状态和配置信息

### aipic://sample-prompts
查看示例英文提示词

## 配置文件

### package.json
项目配置和依赖管理

### tsconfig.json
TypeScript编译配置

### startup.sh
一键启动脚本，包含：
- 端口占用检查和清理
- 依赖自动安装
- TypeScript编译
- 服务启动

## 项目结构

```
AIPIC/
├── src/
│   ├── types/           # TypeScript类型定义
│   ├── services/        # 核心服务
│   │   ├── imageGeneration.ts     # 图片生成服务
│   │   ├── contentAnalysis.ts     # 内容分析服务
│   │   └── promptGeneration.ts    # 提示词生成服务
│   └── index.ts         # MCP服务器主文件
├── dist/                # 编译输出目录
├── logs/                # 日志目录
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript配置
├── startup.sh           # 一键启动脚本
└── README.md           # 项目文档
```

## API集成

本项目集成了ModelScope的FLUX图片生成模型：

```javascript
// API调用示例
const response = await fetch('https://api-inference.modelscope.cn/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'MusePublic/489_ckpt_FLUX_1',
    prompt: 'modern web interface design'
  })
});
```

## 使用场景

### 1. 网页开发
- 自动为网页生成占位符图片
- 提升网页视觉效果
- 加速原型开发流程

### 2. 内容创作
- 为文章自动生成配图
- 提升阅读体验
- 减少寻找合适图片的时间

### 3. 设计工作流
- 快速生成设计灵感图
- 辅助界面设计
- 提供视觉参考

## 注意事项

1. **API密钥安全**：API密钥由MCP客户端传入，不要在代码中硬编码
2. **网络连接**：需要稳定的网络连接访问ModelScope API
3. **图片质量**：生成的图片质量依赖于提示词的质量
4. **使用限制**：请遵守ModelScope API的使用限制和配额

## 故障排除

### 1. 依赖安装失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 2. 编译失败
```bash
# 清理编译缓存
npm run clean
npm run build
```

### 3. API调用失败
- 检查API密钥是否正确
- 检查网络连接
- 查看错误日志

### 4. 服务无法启动
```bash
# 检查端口占用
./startup.sh
```

## 开发和贡献

### 开发环境设置
```bash
git clone <repository>
cd AIPIC
npm install
npm run dev
```

### 代码结构
- 使用TypeScript开发
- 遵循MCP协议规范
- 模块化设计，易于扩展

### 测试
```bash
npm test
```

## 许可证

MIT License

## 支持

如有问题或建议，请提交Issue或联系开发团队。

---

**AIPIC MCP Server** - 让AI为你的创作增添视觉魅力！ 🎨✨ 