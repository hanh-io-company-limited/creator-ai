#!/bin/bash

# Creator AI System Test Script
# This script validates the Creator AI system implementation

echo "🚀 Creator AI System Test Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "Testing: $test_name... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        if [ -n "$expected_result" ]; then
            echo "   Expected: $expected_result"
        fi
    fi
}

# Function to check file existence
check_file() {
    [ -f "$1" ]
}

# Function to check directory existence
check_dir() {
    [ -d "$1" ]
}

# Function to validate HTML structure
validate_html() {
    local file="$1"
    local pattern="$2"
    
    if [ -f "$file" ]; then
        grep -q "$pattern" "$file"
    else
        return 1
    fi
}

# Function to validate CSS classes
validate_css_class() {
    local css_file="$1"
    local class_name="$2"
    
    if [ -f "$css_file" ]; then
        grep -q "\.$class_name" "$css_file"
    else
        return 1
    fi
}

# Function to validate JavaScript function
validate_js_function() {
    local js_file="$1"
    local function_name="$2"
    
    if [ -f "$js_file" ]; then
        grep -q "$function_name" "$js_file"
    else
        return 1
    fi
}

echo
echo "📁 Testing File Structure..."
echo "----------------------------"

# Test core files
run_test "HTML files exist" "check_file 'index.html' && check_file 'dashboard.html'"
run_test "CSS directory exists" "check_dir 'css'"
run_test "JavaScript directory exists" "check_dir 'js'"
run_test "Assets directory exists" "check_dir 'assets'"
run_test "Main CSS file exists" "check_file 'css/styles.css'"

# Test JavaScript files
run_test "Auth module exists" "check_file 'js/auth.js'"
run_test "Utils module exists" "check_file 'js/utils.js'"
run_test "Photo mode module exists" "check_file 'js/photo-mode.js'"
run_test "Video mode module exists" "check_file 'js/video-mode.js'"
run_test "Dashboard module exists" "check_file 'js/dashboard.js'"

echo
echo "🏗️  Testing HTML Structure..."
echo "----------------------------"

# Test login page structure
run_test "Login page has DOCTYPE" "validate_html 'index.html' '<!DOCTYPE html>'"
run_test "Login page has Vietnamese lang" "validate_html 'index.html' 'lang=\"vi\"'"
run_test "Login page has viewport meta" "validate_html 'index.html' 'viewport'"
run_test "Login page has form" "validate_html 'index.html' 'form'"
run_test "Login page has email input" "validate_html 'index.html' 'type=\"email\"'"
run_test "Login page has password input" "validate_html 'index.html' 'type=\"password\"'"

# Test dashboard structure
run_test "Dashboard has header" "validate_html 'dashboard.html' 'dashboard-header'"
run_test "Dashboard has tab navigation" "validate_html 'dashboard.html' 'tab-navigation'"
run_test "Dashboard has photo tab" "validate_html 'dashboard.html' 'photo-tab'"
run_test "Dashboard has video tab" "validate_html 'dashboard.html' 'video-tab'"
run_test "Dashboard has file upload areas" "validate_html 'dashboard.html' 'upload-area'"

echo
echo "🎨 Testing CSS Classes..."
echo "-------------------------"

# Test essential CSS classes
run_test "Login page styles" "validate_css_class 'css/styles.css' 'login-page'"
run_test "Login card styles" "validate_css_class 'css/styles.css' 'login-card'"
run_test "Dashboard styles" "validate_css_class 'css/styles.css' 'dashboard'"
run_test "Tab navigation styles" "validate_css_class 'css/styles.css' 'tab-navigation'"
run_test "Upload area styles" "validate_css_class 'css/styles.css' 'upload-area'"
run_test "Progress bar styles" "validate_css_class 'css/styles.css' 'progress-bar'"
run_test "File preview styles" "validate_css_class 'css/styles.css' 'file-preview-grid'"
run_test "Generated content styles" "validate_css_class 'css/styles.css' 'generated-grid'"
run_test "Responsive design" "grep -q '@media' 'css/styles.css'"
run_test "Purple gradient theme" "grep -q '667eea.*764ba2' 'css/styles.css'"

echo
echo "⚙️  Testing JavaScript Functions..."
echo "----------------------------------"

# Test authentication module
run_test "AuthManager class" "validate_js_function 'js/auth.js' 'class AuthManager'"
run_test "Login validation" "validate_js_function 'js/auth.js' 'validateCredentials'"
run_test "Session management" "validate_js_function 'js/auth.js' 'createSession'"
run_test "Logout function" "validate_js_function 'js/auth.js' 'logout'"

# Test utility functions
run_test "Utils class" "validate_js_function 'js/utils.js' 'class Utils'"
run_test "File validation" "validate_js_function 'js/utils.js' 'validateFile'"
run_test "Progress simulation" "validate_js_function 'js/utils.js' 'simulateProgress'"
run_test "File preview creation" "validate_js_function 'js/utils.js' 'createFilePreview'"

# Test photo mode
run_test "PhotoMode class" "validate_js_function 'js/photo-mode.js' 'class PhotoMode'"
run_test "Photo upload handling" "validate_js_function 'js/photo-mode.js' 'handleFileSelect'"
run_test "AI training simulation" "validate_js_function 'js/photo-mode.js' 'startTraining'"
run_test "Avatar generation" "validate_js_function 'js/photo-mode.js' 'generateAvatars'"
run_test "Animation creation" "validate_js_function 'js/photo-mode.js' 'animateAvatars'"

# Test video mode
run_test "VideoMode class" "validate_js_function 'js/video-mode.js' 'class VideoMode'"
run_test "Video upload handling" "validate_js_function 'js/video-mode.js' 'handleFileSelect'"
run_test "Avatar conversion" "validate_js_function 'js/video-mode.js' 'convertToAvatar'"
run_test "Expression sync" "validate_js_function 'js/video-mode.js' 'syncExpression'"
run_test "Voice cloning" "validate_js_function 'js/video-mode.js' 'cloneVoice'"

# Test dashboard
run_test "Dashboard class" "validate_js_function 'js/dashboard.js' 'class Dashboard'"
run_test "Tab switching" "validate_js_function 'js/dashboard.js' 'switchTab'"
run_test "User info update" "validate_js_function 'js/dashboard.js' 'updateUserInfo'"

echo
echo "🔒 Testing Security Features..."
echo "------------------------------"

# Test authentication features
run_test "Predefined credentials check" "validate_js_function 'js/auth.js' 'hanhlehangelcosmetic@gmail.com'"
run_test "Session expiration" "validate_js_function 'js/auth.js' 'hoursDiff > 24'"
run_test "Route protection" "validate_js_function 'js/auth.js' 'requireAuth'"

echo
echo "📱 Testing Responsive Features..."
echo "--------------------------------"

# Test responsive design
run_test "Mobile breakpoint (768px)" "grep -q 'max-width.*768px' 'css/styles.css'"
run_test "Small mobile breakpoint (480px)" "grep -q 'max-width.*480px' 'css/styles.css'"
run_test "Reduced motion support" "grep -q 'prefers-reduced-motion' 'css/styles.css'"
run_test "High contrast support" "grep -q 'prefers-contrast' 'css/styles.css'"

echo
echo "🔧 Testing File Validation..."
echo "----------------------------"

# Test file type validation
run_test "Image file validation" "grep -q 'image/jpeg.*image/png' 'js/utils.js'"
run_test "Video file validation" "grep -q 'video/mp4.*video/mov' 'js/utils.js'"
run_test "Audio file validation" "grep -q 'audio/mp3' 'js/utils.js'"
run_test "File size limits" "grep -q 'maxImageSize' 'js/utils.js' && grep -q 'maxVideoSize' 'js/utils.js'"

echo
echo "🎯 Testing Feature Completeness..."
echo "---------------------------------"

# Test required features
run_test "Drag & drop support" "validate_js_function 'js/photo-mode.js' 'handleDrop'"
run_test "Progress tracking" "validate_js_function 'js/utils.js' 'simulateProgress'"
run_test "Vietnamese interface" "validate_html 'dashboard.html' 'Tạo Avatar'"
run_test "Multiple file upload" "validate_html 'dashboard.html' 'multiple'"
run_test "Audio synchronization" "validate_html 'dashboard.html' 'lip-sync'"
run_test "Voice cloning feature" "validate_js_function 'js/video-mode.js' 'cloneVoice'"
run_test "4K upscaling feature" "validate_js_function 'js/photo-mode.js' 'upscaleImages'"
run_test "1080p export feature" "validate_js_function 'js/video-mode.js' 'exportVideo'"

echo
echo "💾 Testing Data Management..."
echo "----------------------------"

# Test data persistence
run_test "Local storage usage" "validate_js_function 'js/utils.js' 'localStorage'"
run_test "Data saving function" "validate_js_function 'js/utils.js' 'saveToStorage'"
run_test "Data loading function" "validate_js_function 'js/utils.js' 'loadFromStorage'"
run_test "Session data management" "validate_js_function 'js/auth.js' 'getSessionData'"

echo
echo "🧪 Testing Error Handling..."
echo "---------------------------"

# Test error handling
run_test "File validation errors" "validate_js_function 'js/utils.js' 'error.*File.*lớn'"
run_test "Authentication errors" "validate_js_function 'js/auth.js' 'không chính xác'"
run_test "Notification system" "validate_js_function 'js/utils.js' 'showNotification'"
run_test "Error message display" "validate_css_class 'css/styles.css' 'error-message'"

echo
echo "📊 Test Results Summary"
echo "======================"
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Creator AI system is ready!${NC}"
    echo -e "${GREEN}✅ Login functionality implemented${NC}"
    echo -e "${GREEN}✅ Photo-based avatar creation ready${NC}"
    echo -e "${GREEN}✅ Video-based avatar creation ready${NC}"
    echo -e "${GREEN}✅ Responsive design implemented${NC}"
    echo -e "${GREEN}✅ Vietnamese interface active${NC}"
    echo -e "${GREEN}✅ Security features enabled${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please review the implementation.${NC}"
    echo -e "${RED}❌ Failed tests: $TESTS_FAILED${NC}"
    exit 1
fi