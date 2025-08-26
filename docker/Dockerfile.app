# Creator AI App Container (Electron App Server)

FROM node:20-alpine

# Install system dependencies for Electron
RUN apk add --no-cache \
    xvfb \
    chromium \
    gtk+3.0-dev \
    libxss1 \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY src/ ./src/
COPY assets/ ./assets/
COPY build/ ./build/

# Set environment variables
ENV NODE_ENV=production
ENV DISPLAY=:99
ENV API_URL=http://creator-ai-api:3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S creator-ai -u 1001

# Change ownership of app directory
RUN chown -R creator-ai:nodejs /app

# Switch to non-root user
USER creator-ai

# Expose port for web interface
EXPOSE 8080

# Start Xvfb and the application
CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 & npm start"]