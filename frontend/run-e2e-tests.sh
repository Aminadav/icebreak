#!/bin/bash

# E2E Test Setup and Execution Script
# This script ensures both backend and frontend are running before executing tests

set -e  # Exit on any error

echo "🚀 Setting up E2E Test Environment for Icebreak App"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if backend is running
check_backend() {
    print_status "Checking if backend is running..."
    if curl -s http://localhost:4001/health >/dev/null 2>&1; then
        print_success "Backend is running on port 4001"
        return 0
    else
        return 1
    fi
}

# Start backend if not running
start_backend() {
    print_status "Starting backend server..."
    cd ../backend
    
    # Check if database is running
    if ! docker-compose ps | grep -q "postgres.*Up"; then
        print_status "Starting database..."
        pnpm run db:start
        sleep 5
    fi
    
    # Start backend in background
    print_status "Starting backend server in background..."
    pnpm run dev > ../frontend/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../frontend/backend.pid
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    for i in {1..30}; do
        if check_backend; then
            print_success "Backend is ready!"
            cd ../frontend
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    print_error "Backend failed to start within 60 seconds"
    cd ../frontend
    return 1
}

# Check if frontend is running
check_frontend() {
    print_status "Checking if frontend is running..."
    if curl -s http://localhost:4000 >/dev/null 2>&1; then
        print_success "Frontend is running on port 4000"
        return 0
    else
        return 1
    fi
}

# Start frontend if not running
start_frontend() {
    print_status "Starting frontend server..."
    
    # Start frontend in background
    print_status "Starting frontend server in background..."
    pnpm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    
    # Wait for frontend to be ready
    print_status "Waiting for frontend to be ready..."
    for i in {1..30}; do
        if check_frontend; then
            print_success "Frontend is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    print_error "Frontend failed to start within 60 seconds"
    return 1
}

# Function to cleanup background processes
cleanup() {
    print_status "Cleaning up background processes..."
    
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            print_status "Stopping backend (PID: $BACKEND_PID)..."
            kill $BACKEND_PID
        fi
        rm -f backend.pid
    fi
    
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            print_status "Stopping frontend (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID
        fi
        rm -f frontend.pid
    fi
    
    # Also kill any remaining vite or nodemon processes
    pkill -f "vite" || true
    pkill -f "nodemon.*server.js" || true
    
    print_success "Cleanup completed"
}

# Setup trap to cleanup on script exit
trap cleanup EXIT

# Main execution flow
main() {
    print_status "Starting E2E test environment setup..."
    
    # Check and start backend
    if ! check_backend; then
        if ! start_backend; then
            print_error "Failed to start backend"
            exit 1
        fi
    fi
    
    # Check and start frontend
    if ! check_frontend; then
        if ! start_frontend; then
            print_error "Failed to start frontend"
            exit 1
        fi
    fi
    
    print_success "Both backend and frontend are running!"
    print_status "Backend: http://localhost:4001"
    print_status "Frontend: http://localhost:4000"
    
    # Wait a moment for everything to stabilize
    sleep 3
    
    # Generate current 2FA code for reference
    print_status "Generating current 2FA code for test phone number..."
    cd ../backend
    echo ""
    echo "📱 Current 2FA Code Information:"
    node test-2fa.js
    echo ""
    cd ../frontend
    
    # Run tests based on command line arguments
    if [ "$1" = "--headed" ]; then
        print_status "Running E2E tests in headed mode..."
        pnpm run test:e2e:headed
    elif [ "$1" = "--ui" ]; then
        print_status "Running E2E tests in UI mode..."
        pnpm run test:ui
    elif [ "$1" = "--debug" ]; then
        print_status "Running E2E tests in debug mode..."
        pnpm run test:debug
    else
        print_status "Running E2E tests in headless mode..."
        pnpm run test:e2e
    fi
    
    TEST_RESULT=$?
    
    if [ $TEST_RESULT -eq 0 ]; then
        print_success "🎉 All E2E tests passed!"
    else
        print_error "❌ Some E2E tests failed"
        print_status "Check the test report with: pnpm run test:report"
    fi
    
    return $TEST_RESULT
}

# Show usage if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --headed    Run tests in headed mode (visible browser)"
    echo "  --ui        Run tests in UI mode (interactive)"
    echo "  --debug     Run tests in debug mode"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                 # Run tests in headless mode"
    echo "  $0 --headed        # Run tests with visible browser"
    echo "  $0 --ui           # Run tests in interactive UI mode"
    exit 0
fi

# Run main function
main "$@"
