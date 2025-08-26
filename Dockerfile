# Creator AI Dockerfile
FROM node:18-alpine

# Install basic dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application source
COPY src/ ./src/
COPY assets/ ./assets/
COPY docs/ ./docs/
COPY *.md ./
COPY LICENSE ./

# Create necessary directories
RUN mkdir -p models uploads output

# Set environment variables
ENV NODE_ENV=production
ENV API_PORT=3000
ENV WS_PORT=8080

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the API server
CMD ["node", "src/api-server.js"]