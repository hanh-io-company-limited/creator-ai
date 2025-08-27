# Creator AI - Multi-stage Docker Build
# Stage 1: Build dependencies and prepare environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Stage 2: Runtime environment for Electron app
FROM node:18-alpine AS runtime

# Install runtime dependencies for Electron (minimal set)
RUN apk add --no-cache \
    xvfb \
    chromium \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1000 app && adduser -u 1000 -G app -s /bin/sh -D app

# Set working directory
WORKDIR /app

# Copy application from builder stage
COPY --from=builder --chown=app:app /app ./

# Set display environment variable for X11
ENV DISPLAY=:99
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROMIUM_FLAGS="--no-sandbox --headless --disable-gpu --disable-dev-shm-usage"

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start Xvfb (virtual display)\n\
Xvfb :99 -screen 0 1024x768x24 -ac &\n\
XVFB_PID=$!\n\
\n\
# Wait for X server to start\n\
sleep 2\n\
\n\
# Function to cleanup processes on exit\n\
cleanup() {\n\
    echo "Cleaning up..."\n\
    kill $XVFB_PID 2>/dev/null || true\n\
    exit 0\n\
}\n\
\n\
# Setup signal handlers\n\
trap cleanup SIGTERM SIGINT\n\
\n\
# Start the Electron application\n\
echo "Starting Creator AI..."\n\
export HEADLESS=true\n\
npm start &\n\
APP_PID=$!\n\
\n\
# Wait for application to finish\n\
wait $APP_PID\n\
cleanup' > /app/start.sh

RUN chmod +x /app/start.sh && chown app:app /app/start.sh

# Switch to non-root user
USER app

# Expose port for web interface
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["/app/start.sh"]