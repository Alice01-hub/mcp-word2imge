#!/bin/bash

# AIPIC MCP Server 一键启动脚本
# 功能：强制关闭占用端口、安装依赖、重启服务

set -e  # 遇到错误立即退出

echo "🎨 AIPIC MCP Server 启动脚本"
echo "==============================="

# 配置
PROJECT_NAME="aipic"
SERVER_PORT=3000
STDIO_MODE=true  # MCP通常使用stdio模式

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

log_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "命令 '$1' 未找到，请先安装"
        exit 1
    fi
}

# 1. 检查必要工具
log_info "检查必要工具..."
check_command "node"
check_command "npm"

# 显示版本信息
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_info "Node.js版本: $NODE_VERSION"
log_info "NPM版本: $NPM_VERSION"

# 2. 强制关闭占用端口的进程
log_info "检查并关闭占用端口的进程..."

# 查找占用指定端口的进程
if [ "$STDIO_MODE" = false ]; then
    PIDS=$(lsof -ti:$SERVER_PORT 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        log_warning "发现占用端口 $SERVER_PORT 的进程: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        log_success "已强制关闭占用端口 $SERVER_PORT 的进程"
        sleep 2
    else
        log_info "端口 $SERVER_PORT 未被占用"
    fi
fi

# 查找并关闭可能的NodeJS进程
NODE_PIDS=$(pgrep -f "node.*aipic\|node.*dist/index.js" 2>/dev/null || true)
if [ -n "$NODE_PIDS" ]; then
    log_warning "发现AIPIC相关的Node.js进程: $NODE_PIDS"
    echo "$NODE_PIDS" | xargs kill -9 2>/dev/null || true
    log_success "已关闭AIPIC相关进程"
    sleep 2
else
    log_info "未发现AIPIC相关进程"
fi

# 3. 检查和安装依赖
log_info "检查项目依赖..."

if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    log_warning "依赖未安装或不完整，开始安装..."
    npm install
    log_success "依赖安装完成"
else
    log_info "检查依赖是否需要更新..."
    # 检查package.json是否比node_modules新
    if [ "package.json" -nt "node_modules" ]; then
        log_warning "package.json已更新，重新安装依赖..."
        npm install
        log_success "依赖更新完成"
    else
        log_info "依赖已是最新版本，跳过安装"
    fi
fi

# 4. 编译TypeScript代码
log_info "编译TypeScript代码..."
if [ -d "dist" ]; then
    rm -rf dist
    log_info "已清理旧的编译文件"
fi

npm run build
log_success "TypeScript编译完成"

# 5. 验证编译结果
if [ ! -f "dist/index.js" ]; then
    log_error "编译失败，未找到 dist/index.js"
    exit 1
fi

# 6. 创建日志目录
mkdir -p logs
log_info "已创建日志目录"

# 7. 启动服务
log_info "启动AIPIC MCP Server..."
echo "==============================="

if [ "$STDIO_MODE" = true ]; then
    log_info "以stdio模式启动（MCP标准模式）"
    log_info "服务器将通过标准输入输出与MCP客户端通信"
    log_warning "启动后请勿在终端输入内容，除非你知道MCP协议格式"
    echo ""
    log_success "AIPIC MCP Server 已启动，等待客户端连接..."
    echo "使用方式："
    echo "1. 在MCP客户端中配置此服务器路径"
    echo "2. 首先调用 'configure-api' 工具配置ModelScope API密钥"
    echo "3. 然后可以使用其他工具进行图片生成"
    echo ""
    echo "可用工具："
    echo "- configure-api: 配置API密钥"
    echo "- analyze-webpage: 分析网页内容"
    echo "- analyze-article: 分析文章内容"
    echo "- generate-prompts: 生成英文提示词"
    echo "- generate-images: 生成AI图片"
    echo "- process-webpage-complete: 一键处理网页"
    echo ""
    echo "可用资源："
    echo "- aipic://status: 查看服务状态"
    echo "- aipic://sample-prompts: 查看示例提示词"
    echo ""
    
    # 以stdio模式启动
    exec node dist/index.js
else
    # HTTP模式（如果将来需要）
    log_info "以HTTP模式启动在端口 $SERVER_PORT"
    node dist/index.js > logs/server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > logs/server.pid
    
    # 等待服务器启动
    sleep 3
    
    # 检查服务器是否成功启动
    if kill -0 $SERVER_PID 2>/dev/null; then
        log_success "AIPIC MCP Server 已启动"
        log_info "进程ID: $SERVER_PID"
        log_info "端口: $SERVER_PORT"
        log_info "日志文件: logs/server.log"
        log_info "进程文件: logs/server.pid"
        
        echo ""
        echo "服务器管理命令："
        echo "查看日志: tail -f logs/server.log"
        echo "停止服务: kill $SERVER_PID 或 kill \$(cat logs/server.pid)"
        echo "重启服务: ./startup.sh"
    else
        log_error "服务器启动失败，检查日志: logs/server.log"
        exit 1
    fi
fi 