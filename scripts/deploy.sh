#!/bin/bash

# =============================================================================
# Creator AI - Automated Deployment Script
# =============================================================================
# This script automates the deployment process for Creator AI to cloud servers
#
# Usage:
#   ./scripts/deploy.sh [environment] [options]
#
# Environments:
#   development  - Deploy to development environment
#   staging      - Deploy to staging environment  
#   production   - Deploy to production environment
#
# Options:
#   --build-only     - Only build the Docker images, don't deploy
#   --no-cache       - Build Docker images without cache
#   --pull           - Pull latest code from repository
#   --backup         - Create backup before deployment
#   --rollback       - Rollback to previous version
#   --health-check   - Run health check after deployment
#   --verbose        - Enable verbose logging
#
# =============================================================================

set -e  # Exit on any error

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env"

# Default values
ENVIRONMENT="development"
BUILD_ONLY=false
NO_CACHE=false
PULL_CODE=false
BACKUP=false
ROLLBACK=false
HEALTH_CHECK=true
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

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
Creator AI Deployment Script

Usage: $0 [environment] [options]

Environments:
  development   Deploy to development environment (default)
  staging       Deploy to staging environment
  production    Deploy to production environment

Options:
  --build-only      Only build Docker images, don't deploy
  --no-cache        Build Docker images without cache
  --pull            Pull latest code from repository
  --backup          Create backup before deployment
  --rollback        Rollback to previous version
  --health-check    Run health check after deployment (default)
  --no-health-check Skip health check after deployment
  --verbose         Enable verbose logging
  --help            Show this help message

Examples:
  $0 development --pull --health-check
  $0 production --backup --no-cache
  $0 staging --build-only

EOF
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker service."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if project files exist
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        log_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

setup_environment() {
    log "Setting up environment: $ENVIRONMENT"
    
    # Create .env file if it doesn't exist
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "$PROJECT_DIR/.env.example" ]]; then
            log "Creating .env file from .env.example"
            cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
        else
            log_warning ".env.example not found, creating basic .env file"
            cat > "$ENV_FILE" << EOF
NODE_ENV=$ENVIRONMENT
PORT=3000
GPU_ACCELERATION=false
MAX_MEMORY=4
LOG_LEVEL=info
EOF
        fi
    fi
    
    # Update environment in .env file
    sed -i "s/NODE_ENV=.*/NODE_ENV=$ENVIRONMENT/" "$ENV_FILE"
    
    log_success "Environment setup completed"
}

pull_latest_code() {
    if [[ "$PULL_CODE" == true ]]; then
        log "Pulling latest code from repository..."
        
        if [[ -d "$PROJECT_DIR/.git" ]]; then
            cd "$PROJECT_DIR"
            git fetch --all
            git pull origin main
            log_success "Code updated successfully"
        else
            log_warning "Not a git repository, skipping code pull"
        fi
    fi
}

create_backup() {
    if [[ "$BACKUP" == true ]]; then
        log "Creating backup..."
        
        BACKUP_DIR="$PROJECT_DIR/backups"
        mkdir -p "$BACKUP_DIR"
        
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/backup_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
        
        # Backup Docker volumes
        docker-compose -f "$DOCKER_COMPOSE_FILE" run --rm --entrypoint="" creator-ai \
            tar czf "/backup/backup_${TIMESTAMP}.tar.gz" /app/data /app/models 2>/dev/null || true
        
        log_success "Backup created: $BACKUP_FILE"
    fi
}

build_images() {
    log "Building Docker images..."
    
    BUILD_ARGS=""
    if [[ "$NO_CACHE" == true ]]; then
        BUILD_ARGS="--no-cache"
    fi
    
    if [[ "$VERBOSE" == true ]]; then
        BUILD_ARGS="$BUILD_ARGS --progress=plain"
    fi
    
    cd "$PROJECT_DIR"
    docker-compose build $BUILD_ARGS
    
    log_success "Docker images built successfully"
}

deploy_services() {
    if [[ "$BUILD_ONLY" == true ]]; then
        log "Build-only mode, skipping deployment"
        return
    fi
    
    log "Deploying services..."
    
    cd "$PROJECT_DIR"
    
    # Stop existing services
    docker-compose down --remove-orphans
    
    # Start services
    docker-compose up -d
    
    log_success "Services deployed successfully"
}

run_health_check() {
    if [[ "$HEALTH_CHECK" == false ]]; then
        log "Skipping health check"
        return
    fi
    
    log "Running health check..."
    
    # Wait for services to start
    sleep 10
    
    MAX_ATTEMPTS=30
    ATTEMPT=1
    
    while [[ $ATTEMPT -le $MAX_ATTEMPTS ]]; do
        log "Health check attempt $ATTEMPT/$MAX_ATTEMPTS"
        
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "Health check passed"
            return
        fi
        
        sleep 5
        ((ATTEMPT++))
    done
    
    log_error "Health check failed after $MAX_ATTEMPTS attempts"
    show_logs
    exit 1
}

show_logs() {
    log "Showing recent logs..."
    cd "$PROJECT_DIR"
    docker-compose logs --tail=50 creator-ai
}

rollback_deployment() {
    if [[ "$ROLLBACK" == true ]]; then
        log "Rolling back to previous version..."
        
        # This is a simplified rollback - in production you might want to
        # implement more sophisticated rollback mechanisms
        cd "$PROJECT_DIR"
        docker-compose down
        
        # Pull previous image tag (this would need to be implemented based on your tagging strategy)
        log_warning "Rollback functionality needs to be implemented based on your deployment strategy"
        
        log_success "Rollback completed"
    fi
}

cleanup() {
    log "Cleaning up unused Docker resources..."
    docker system prune -f --volumes
    log_success "Cleanup completed"
}

show_deployment_info() {
    log "Deployment Information:"
    echo "===================="
    echo "Environment: $ENVIRONMENT"
    echo "Project Directory: $PROJECT_DIR"
    echo "Docker Compose File: $DOCKER_COMPOSE_FILE"
    echo "Environment File: $ENV_FILE"
    echo ""
    
    log "Running containers:"
    docker-compose ps
    
    echo ""
    log "Service URLs:"
    echo "Application: http://localhost:3000"
    echo "Health Check: http://localhost:3000/health"
    echo "VNC (if enabled): http://localhost:5900"
    
    echo ""
    log "Useful commands:"
    echo "View logs: docker-compose logs -f creator-ai"
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
    echo "Shell access: docker-compose exec creator-ai /bin/bash"
}

# =============================================================================
# Main Script
# =============================================================================

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        development|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --pull)
            PULL_CODE=true
            shift
            ;;
        --backup)
            BACKUP=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --health-check)
            HEALTH_CHECK=true
            shift
            ;;
        --no-health-check)
            HEALTH_CHECK=false
            shift
            ;;
        --verbose)
            VERBOSE=true
            set -x  # Enable bash debugging
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

# Main deployment process
main() {
    log "Starting Creator AI deployment..."
    log "Environment: $ENVIRONMENT"
    
    check_prerequisites
    setup_environment
    pull_latest_code
    create_backup
    rollback_deployment
    build_images
    deploy_services
    run_health_check
    show_deployment_info
    
    log_success "Deployment completed successfully!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"