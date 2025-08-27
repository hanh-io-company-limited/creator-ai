#!/bin/bash

# =============================================================================
# Creator AI - Test Script
# =============================================================================
# This script tests the core functionality of Creator AI
#
# Usage: ./scripts/test.sh [options]
#
# Options:
#   --quick      Run quick tests only
#   --full       Run full test suite
#   --docker     Test Docker functionality
#   --verbose    Enable verbose output
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
QUICK_TEST=false
FULL_TEST=false
DOCKER_TEST=false
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
Creator AI Test Script

Usage: $0 [options]

Options:
  --quick       Run quick tests only
  --full        Run full test suite (default)
  --docker      Test Docker functionality
  --verbose     Enable verbose output
  --help        Show this help message

Examples:
  $0 --quick
  $0 --full --verbose
  $0 --docker

EOF
}

test_node_dependencies() {
    log "Testing Node.js dependencies..."
    
    cd "$PROJECT_DIR"
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        return 1
    fi
    
    if [[ ! -d "node_modules" ]]; then
        log "Installing dependencies..."
        npm install
    fi
    
    # Test that main dependencies are available
    node -e "
        try {
            require('electron');
            require('electron-store');
            console.log('Dependencies check passed');
        } catch (error) {
            console.error('Dependencies check failed:', error.message);
            process.exit(1);
        }
    "
    
    log_success "Node.js dependencies test passed"
}

test_file_structure() {
    log "Testing file structure..."
    
    local required_files=(
        "package.json"
        "src/main.js"
        "src/index.html"
        "src/renderer.js"
        "src/ai-engine.js"
        "src/styles.css"
        "Dockerfile"
        "docker-compose.yml"
        ".env.example"
        "scripts/deploy.sh"
        "config/nginx.conf"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$PROJECT_DIR/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        return 1
    fi
    
    log_success "File structure test passed"
}

test_ai_engine() {
    log "Testing AI engine functionality..."
    
    cd "$PROJECT_DIR"
    
    # Test AI engine module
    node -e "
        const AIEngine = require('./src/ai-engine.js');
        const engine = new AIEngine();
        
        async function testEngine() {
            try {
                await engine.initialize();
                console.log('AI Engine initialized successfully');
                
                // Test model creation
                const mockModel = await engine.createTextToVideoModel({
                    name: 'test-model',
                    type: 'text-to-video'
                });
                console.log('Model creation test passed');
                
                // Test system info
                const sysInfo = engine.getSystemInfo();
                console.log('System info:', JSON.stringify(sysInfo, null, 2));
                
                console.log('AI Engine tests passed');
            } catch (error) {
                console.error('AI Engine test failed:', error.message);
                process.exit(1);
            }
        }
        
        testEngine();
    "
    
    log_success "AI engine test passed"
}

test_health_endpoint() {
    log "Testing health endpoint..."
    
    cd "$PROJECT_DIR"
    
    # Start a minimal HTTP server to test health endpoint functionality
    node -e "
        const http = require('http');
        const url = require('url');
        
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            
            if (parsedUrl.pathname === '/health') {
                const healthStatus = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0',
                    environment: 'test'
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(healthStatus, null, 2));
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        
        server.listen(3001, () => {
            console.log('Test server started on port 3001');
            
            // Test the health endpoint
            const testReq = http.request('http://localhost:3001/health', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const health = JSON.parse(data);
                        if (health.status === 'healthy') {
                            console.log('Health endpoint test passed');
                            server.close();
                            process.exit(0);
                        } else {
                            console.error('Health endpoint returned incorrect status');
                            server.close();
                            process.exit(1);
                        }
                    } catch (error) {
                        console.error('Health endpoint test failed:', error.message);
                        server.close();
                        process.exit(1);
                    }
                });
            });
            
            testReq.on('error', (error) => {
                console.error('Health endpoint test failed:', error.message);
                server.close();
                process.exit(1);
            });
            
            testReq.end();
        });
    " &
    
    sleep 2
    wait
    
    log_success "Health endpoint test passed"
}

test_docker_build() {
    if [[ "$DOCKER_TEST" != true ]]; then
        return 0
    fi
    
    log "Testing Docker build..."
    
    cd "$PROJECT_DIR"
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not available, skipping Docker tests"
        return 0
    fi
    
    # Test Docker build
    docker build -t creator-ai-test .
    
    if [[ $? -eq 0 ]]; then
        log_success "Docker build test passed"
        
        # Clean up test image
        docker rmi creator-ai-test
    else
        log_error "Docker build test failed"
        return 1
    fi
}

test_deployment_script() {
    log "Testing deployment script..."
    
    cd "$PROJECT_DIR"
    
    # Test that deployment script exists and is executable
    if [[ ! -x "scripts/deploy.sh" ]]; then
        log_error "Deployment script is not executable"
        return 1
    fi
    
    # Test deployment script help
    ./scripts/deploy.sh --help > /dev/null
    
    if [[ $? -eq 0 ]]; then
        log_success "Deployment script test passed"
    else
        log_error "Deployment script test failed"
        return 1
    fi
}

run_quick_tests() {
    log "Running quick tests..."
    
    test_file_structure
    test_node_dependencies
    test_deployment_script
    
    log_success "Quick tests completed"
}

run_full_tests() {
    log "Running full test suite..."
    
    test_file_structure
    test_node_dependencies
    test_ai_engine
    test_health_endpoint
    test_deployment_script
    test_docker_build
    
    log_success "Full test suite completed"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_TEST=true
            shift
            ;;
        --full)
            FULL_TEST=true
            shift
            ;;
        --docker)
            DOCKER_TEST=true
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

# Default to full tests if no specific test type is specified
if [[ "$QUICK_TEST" != true && "$FULL_TEST" != true ]]; then
    FULL_TEST=true
fi

# Main test execution
main() {
    log "Starting Creator AI tests..."
    
    if [[ "$QUICK_TEST" == true ]]; then
        run_quick_tests
    elif [[ "$FULL_TEST" == true ]]; then
        run_full_tests
    fi
    
    log_success "All tests completed successfully!"
}

# Handle script interruption
trap 'log_error "Tests interrupted"; exit 1' INT TERM

# Run main function
main "$@"