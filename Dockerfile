# Creator AI - Multi-stage Docker Build
# Stage 1: Build dependencies and prepare environment
FROM node:18-bullseye-slim AS builder

# Install system dependencies needed for Electron
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Stage 2: Runtime environment for Electron app
FROM node:18-bullseye-slim AS runtime

# Install runtime dependencies for Electron
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    fluxbox \
    wget \
    wmctrl \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r app && useradd -r -g app app

# Set working directory
WORKDIR /app

# Copy application from builder stage
COPY --from=builder --chown=app:app /app ./

# Set display environment variable for X11
ENV DISPLAY=:99

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start Xvfb (virtual display)\n\
Xvfb :99 -screen 0 1024x768x24 -ac +extension GLX +render -noreset &\n\
XVFB_PID=$!\n\
\n\
# Start window manager\n\
fluxbox -display :99 &\n\
FLUXBOX_PID=$!\n\
\n\
# Wait for X server to start\n\
sleep 2\n\
\n\
# Function to cleanup processes on exit\n\
cleanup() {\n\
    echo "Cleaning up..."\n\
    kill $XVFB_PID $FLUXBOX_PID 2>/dev/null || true\n\
    exit 0\n\
}\n\
\n\
# Setup signal handlers\n\
trap cleanup SIGTERM SIGINT\n\
\n\
# Start the Electron application\n\
echo "Starting Creator AI..."\n\
npm start &\n\
APP_PID=$!\n\
\n\
# Wait for application to finish\n\
wait $APP_PID\n\
cleanup' > /app/start.sh

RUN chmod +x /app/start.sh && chown app:app /app/start.sh

# Switch to non-root user
USER app

# Expose port for potential web interface
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["/app/start.sh"]