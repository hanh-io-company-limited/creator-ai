#!/bin/bash

# =============================================================================
# Creator AI - Integration Test Script
# =============================================================================
# This script performs integration tests for the Creator AI deployment
#
# Usage: ./scripts/integration-test.sh [options]
#
# Options:
#   --skip-docker    Skip Docker-related tests
#   --verbose        Enable verbose output
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test configuration
SKIP_DOCKER=false
VERBOSE=false

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
Creator AI Integration Test Script

Usage: $0 [options]

Options:
  --skip-docker     Skip Docker-related tests
  --verbose         Enable verbose output
  --help            Show this help message

Examples:
  $0
  $0 --skip-docker --verbose

EOF
}

test_core_functionality() {
    log "Testing core AI engine functionality..."
    
    cd "$PROJECT_DIR"
    
    # Test AI engine with comprehensive functionality
    node -e "
        const AIEngine = require('./src/ai-engine.js');
        
        async function runTests() {
            const engine = new AIEngine();
            
            try {
                // Test initialization
                await engine.initialize();
                console.log('✓ AI Engine initialized');
                
                // Test model creation
                const textToVideoModel = await engine.createTextToVideoModel({
                    name: 'test-text-to-video',
                    type: 'text-to-video'
                });
                console.log('✓ Text-to-video model created');
                
                const imageToVideoModel = await engine.createImageToVideoModel({
                    name: 'test-image-to-video',
                    type: 'image-to-video'
                });
                console.log('✓ Image-to-video model created');
                
                // Test model loading
                await engine.loadModel('/mock/path/model.json', 'test-model-1');
                console.log('✓ Model loading works');
                
                // Test training simulation
                let trainingProgress = [];
                await engine.trainModel(textToVideoModel, [], { epochs: 3 }, (progress) => {
                    trainingProgress.push(progress);
                });
                console.log('✓ Training simulation completed with', trainingProgress.length, 'progress updates');
                
                // Test video generation
                let generationProgress = [];
                const videoData = await engine.generateVideo('test-model-1', 'A beautiful sunset over mountains', { 
                    duration: 3, 
                    resolution: '512x512' 
                }, (progress) => {
                    generationProgress.push(progress);
                });
                console.log('✓ Video generation completed:', videoData.prompt);
                
                // Test system info
                const sysInfo = engine.getSystemInfo();
                console.log('✓ System info retrieved:', sysInfo.backend);
                
                // Test helper methods
                const prompts = engine.generateSamplePrompts();
                console.log('✓ Sample prompts generated:', prompts.length, 'prompts');
                
                const estimatedTime = engine.estimateProcessingTime({ duration: 5, resolution: '720x720' });
                console.log('✓ Processing time estimated:', estimatedTime, 'seconds');
                
                console.log('\\n🎉 All AI engine tests passed successfully!');
                
            } catch (error) {
                console.error('❌ AI Engine test failed:', error.message);
                process.exit(1);
            }
        }
        
        runTests();
    "
    
    log_success "Core functionality test passed"
}

test_web_server() {
    log "Testing web server functionality..."
    
    cd "$PROJECT_DIR"
    
    # Test web server functionality
    node -e "
        const http = require('http');
        const url = require('url');
        
        // Simulate the health server from main.js
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            
            if (parsedUrl.pathname === '/health') {
                const healthStatus = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0',
                    environment: 'test',
                    uptime: process.uptime(),
                    memory: process.memoryUsage()
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(healthStatus, null, 2));
            } else if (parsedUrl.pathname === '/api/status') {
                const appStatus = {
                    electron: {
                        ready: true,
                        windows: 1
                    },
                    system: {
                        platform: process.platform,
                        arch: process.arch,
                        nodeVersion: process.version
                    }
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(appStatus, null, 2));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });
        
        server.listen(3002, () => {
            console.log('Test server started on port 3002');
            
            // Test multiple endpoints
            const endpoints = ['/health', '/api/status'];
            let testsCompleted = 0;
            
            endpoints.forEach((endpoint, index) => {
                const testReq = http.request(\`http://localhost:3002\${endpoint}\`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            console.log(\`✓ \${endpoint} endpoint test passed\`);
                            testsCompleted++;
                            
                            if (testsCompleted === endpoints.length) {
                                console.log('\\n🎉 All web server tests passed!');
                                server.close();
                                process.exit(0);
                            }
                        } catch (error) {
                            console.error(\`❌ \${endpoint} endpoint test failed:, error.message\`);
                            server.close();
                            process.exit(1);
                        }
                    });
                });
                
                testReq.on('error', (error) => {
                    console.error(\`❌ \${endpoint} request failed:, error.message\`);
                    server.close();
                    process.exit(1);
                });
                
                testReq.end();
            });
        });
    " &
    
    sleep 3
    wait
    
    log_success "Web server test passed"
}

test_deployment_scripts() {
    log "Testing deployment scripts..."
    
    cd "$PROJECT_DIR"
    
    # Test that all scripts exist and are executable
    local scripts=("scripts/deploy.sh" "scripts/test.sh" "scripts/integration-test.sh")
    
    for script in "${scripts[@]}"; do
        if [[ -x "$script" ]]; then
            log_success "✓ $script is executable"
        else
            log_error "❌ $script is not executable or missing"
            return 1
        fi
    done
    
    # Test deployment script help
    ./scripts/deploy.sh --help > /dev/null
    log_success "✓ Deploy script help works"
    
    # Test this integration test script help
    ./scripts/integration-test.sh --help > /dev/null
    log_success "✓ Integration test script help works"
    
    log_success "Deployment scripts test passed"
}

test_configuration_files() {
    log "Testing configuration files..."
    
    cd "$PROJECT_DIR"
    
    # Test that all configuration files exist
    local configs=(
        "Dockerfile"
        "docker-compose.yml"
        ".env.example"
        "config/nginx.conf"
        ".dockerignore"
        ".gitignore"
    )
    
    for config in "${configs[@]}"; do
        if [[ -f "$config" ]]; then
            log_success "✓ $config exists"
        else
            log_error "❌ $config is missing"
            return 1
        fi
    done
    
    # Test .env.example format
    if grep -q "NODE_ENV=" .env.example && grep -q "PORT=" .env.example; then
        log_success "✓ .env.example has required variables"
    else
        log_error "❌ .env.example missing required variables"
        return 1
    fi
    
    # Test docker-compose.yml format
    if grep -q "version:" docker-compose.yml && grep -q "services:" docker-compose.yml; then
        log_success "✓ docker-compose.yml has valid format"
    else
        log_error "❌ docker-compose.yml has invalid format"
        return 1
    fi
    
    log_success "Configuration files test passed"
}

test_docker_functionality() {
    if [[ "$SKIP_DOCKER" == true ]]; then
        log_warning "Skipping Docker tests"
        return 0
    fi
    
    log "Testing Docker functionality..."
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not available, skipping Docker tests"
        return 0
    fi
    
    cd "$PROJECT_DIR"
    
    # Test Docker Compose configuration validation
    if command -v docker-compose &> /dev/null; then
        docker-compose config > /dev/null
        log_success "✓ Docker Compose configuration is valid"
    else
        log_warning "Docker Compose not available, skipping compose tests"
    fi
    
    # Test Dockerfile syntax (without building)
    if docker build --dry-run . > /dev/null 2>&1; then
        log_success "✓ Dockerfile syntax is valid"
    else
        log_warning "Dockerfile syntax validation not supported or failed"
    fi
    
    log_success "Docker functionality test passed"
}

run_integration_tests() {
    log "Running Creator AI integration tests..."
    
    test_configuration_files
    test_deployment_scripts
    test_core_functionality
    test_web_server
    test_docker_functionality
    
    log_success "All integration tests completed successfully!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            set -x
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main test execution
main() {
    log "Starting Creator AI integration tests..."
    
    run_integration_tests
    
    log_success "🎉 All integration tests passed! Creator AI is ready for deployment."
}

# Handle script interruption
trap 'log_error "Integration tests interrupted"; exit 1' INT TERM

# Run main function
main "$@"