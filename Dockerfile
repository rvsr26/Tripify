# Production Dockerfile for Tripify Enterprise Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "src/index.js"]
