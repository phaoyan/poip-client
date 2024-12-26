# 使用官方 Node.js 镜像作为基础镜像
FROM node:latest AS builder

# 设置工作目录
WORKDIR /app

# 将 package.json 和 yarn.lock 复制到工作目录
COPY package.json yarn.lock ./

# 安装项目依赖
RUN yarn install --frozen-lockfile --non-interactive

# 复制项目源代码到工作目录
COPY . .

# 构建 Next.js 应用
RUN yarn build

# 创建一个用于生产环境的精简镜像
FROM node:latest

# 设置工作目录
WORKDIR /app

# 从 builder 阶段复制构建好的应用
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 安装生产环境所需的依赖 (只安装 dependencies)
RUN yarn install --production --frozen-lockfile --non-interactive

# 暴露 Next.js 应用端口
EXPOSE 3000

# 定义启动命令
CMD ["yarn", "start"]