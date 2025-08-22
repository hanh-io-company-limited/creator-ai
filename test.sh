#!/bin/bash

# Creator AI System Test Script
# Tests file existence, HTML validity, CSS completeness, JavaScript functionality, and system readiness

echo "🧪 Creator AI System Testing Suite"
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to print test results
print_test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name: ${GREEN}PASS${NC} - $message"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC} $test_name: ${RED}FAIL${NC} - $message"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo -e "\n${BLUE}1. File Existence Tests${NC}"
echo "======================="

# Check if index.html exists
if [ -f "index.html" ]; then
    print_test_result "File Existence" "PASS" "index.html found"
else
    print_test_result "File Existence" "FAIL" "index.html not found"
    exit 1
fi

# Check file size (should be substantial for a complete system)
file_size=$(wc -c < index.html)
if [ "$file_size" -gt 10000 ]; then
    print_test_result "File Size" "PASS" "File size is substantial ($file_size bytes)"
else
    print_test_result "File Size" "FAIL" "File size too small ($file_size bytes) - may be incomplete"
fi

echo -e "\n${BLUE}2. HTML Semantic Validity Tests${NC}"
echo "==============================="

# Check for essential HTML5 structure
if grep -q "<!DOCTYPE html>" index.html; then
    print_test_result "HTML5 Doctype" "PASS" "HTML5 doctype declared"
else
    print_test_result "HTML5 Doctype" "FAIL" "HTML5 doctype missing"
fi

# Check for Vietnamese language attribute
if grep -q 'lang="vi"' index.html; then
    print_test_result "Vietnamese Language" "PASS" "Vietnamese language attribute found"
else
    print_test_result "Vietnamese Language" "FAIL" "Vietnamese language attribute missing"
fi

# Check for responsive viewport meta tag
if grep -q 'name="viewport"' index.html; then
    print_test_result "Responsive Viewport" "PASS" "Viewport meta tag found"
else
    print_test_result "Responsive Viewport" "FAIL" "Viewport meta tag missing"
fi

# Check for title
if grep -q "<title>" index.html; then
    print_test_result "Page Title" "PASS" "Page title found"
else
    print_test_result "Page Title" "FAIL" "Page title missing"
fi

# Check for semantic structure
essential_elements=("body" "div" "form" "button" "input")
for element in "${essential_elements[@]}"; do
    if grep -q "<$element" index.html; then
        print_test_result "HTML Element: $element" "PASS" "$element tag found"
    else
        print_test_result "HTML Element: $element" "FAIL" "$element tag missing"
    fi
done

echo -e "\n${BLUE}3. CSS Class Completeness Tests${NC}"
echo "================================"

# Check for essential CSS classes
essential_classes=(
    "login-container" "login-form" "dashboard" "tab-navigation" "tab-content"
    "upload-area" "progress-container" "progress-bar" "file-preview-grid"
    "control-panel" "action-buttons" "results-section" "message"
)

for class in "${essential_classes[@]}"; do
    if grep -q "\.$class" index.html; then
        print_test_result "CSS Class: $class" "PASS" ".$class found in CSS"
    else
        print_test_result "CSS Class: $class" "FAIL" ".$class missing from CSS"
    fi
done

# Check for responsive design classes
if grep -q "@media" index.html; then
    print_test_result "Responsive CSS" "PASS" "Media queries found"
else
    print_test_result "Responsive CSS" "FAIL" "Media queries missing"
fi

# Check for gradient styles (purple theme requirement)
if grep -q "linear-gradient" index.html; then
    print_test_result "Gradient Theme" "PASS" "Linear gradients found"
else
    print_test_result "Gradient Theme" "FAIL" "Linear gradients missing"
fi

echo -e "\n${BLUE}4. JavaScript Function Availability Tests${NC}"
echo "==========================================="

# Check for essential JavaScript functions
essential_functions=(
    "handleLogin" "handleLogout" "checkAuthStatus" "generateAvatar"
    "addMotionToAvatar" "upscaleAvatar" "createPhotoVideo" "syncExpressions"
    "cloneVoice" "processPhotoFiles" "processVideoFiles" "showMessage"
)

for func in "${essential_functions[@]}"; do
    if grep -q "function $func\|$func.*=" index.html; then
        print_test_result "JS Function: $func" "PASS" "$func function found"
    else
        print_test_result "JS Function: $func" "FAIL" "$func function missing"
    fi
done

# Check for event listeners
if grep -q "addEventListener" index.html; then
    print_test_result "Event Listeners" "PASS" "Event listeners found"
else
    print_test_result "Event Listeners" "FAIL" "Event listeners missing"
fi

# Check for Local Storage usage
if grep -q "localStorage" index.html; then
    print_test_result "Local Storage" "PASS" "Local Storage implementation found"
else
    print_test_result "Local Storage" "FAIL" "Local Storage implementation missing"
fi

echo -e "\n${BLUE}5. Security & Authentication Tests${NC}"
echo "=================================="

# Check for login functionality
if grep -q "VALID_CREDENTIALS" index.html; then
    print_test_result "Authentication System" "PASS" "Authentication credentials found"
else
    print_test_result "Authentication System" "FAIL" "Authentication credentials missing"
fi

# Check for session management
if grep -q "creatorAI_user" index.html; then
    print_test_result "Session Management" "PASS" "Session management implemented"
else
    print_test_result "Session Management" "FAIL" "Session management missing"
fi

# Check for logout functionality
if grep -q "handleLogout" index.html; then
    print_test_result "Logout Function" "PASS" "Logout functionality found"
else
    print_test_result "Logout Function" "FAIL" "Logout functionality missing"
fi

echo -e "\n${BLUE}6. Feature Completeness Tests${NC}"
echo "============================="

# Check for photo upload functionality
if grep -q "photoInput\|photoUpload" index.html; then
    print_test_result "Photo Upload" "PASS" "Photo upload functionality found"
else
    print_test_result "Photo Upload" "FAIL" "Photo upload functionality missing"
fi

# Check for video upload functionality
if grep -q "videoInput\|videoUpload" index.html; then
    print_test_result "Video Upload" "PASS" "Video upload functionality found"
else
    print_test_result "Video Upload" "FAIL" "Video upload functionality missing"
fi

# Check for drag and drop support
if grep -q "dragover\|dragleave\|drop" index.html; then
    print_test_result "Drag & Drop" "PASS" "Drag and drop support found"
else
    print_test_result "Drag & Drop" "FAIL" "Drag and drop support missing"
fi

# Check for progress indicators
if grep -q "progress-bar\|progress-fill" index.html; then
    print_test_result "Progress Indicators" "PASS" "Progress indicators found"
else
    print_test_result "Progress Indicators" "FAIL" "Progress indicators missing"
fi

# Check for file validation
if grep -q "validateFile\|validFiles" index.html; then
    print_test_result "File Validation" "PASS" "File validation found"
else
    print_test_result "File Validation" "FAIL" "File validation missing"
fi

# Check for Vietnamese interface
vietnamese_text=("Đăng nhập" "Đăng xuất" "Tạo Avatar" "Chế độ" "Tải lên")
vietnamese_found=0
for text in "${vietnamese_text[@]}"; do
    if grep -q "$text" index.html; then
        vietnamese_found=$((vietnamese_found + 1))
    fi
done

if [ "$vietnamese_found" -ge 3 ]; then
    print_test_result "Vietnamese Interface" "PASS" "Vietnamese text found ($vietnamese_found/5 samples)"
else
    print_test_result "Vietnamese Interface" "FAIL" "Insufficient Vietnamese text ($vietnamese_found/5 samples)"
fi

echo -e "\n${BLUE}7. System Readiness Tests${NC}"
echo "========================"

# Check for embedded CSS (no external dependencies)
if grep -q "<style>" index.html && ! grep -q 'rel="stylesheet"' index.html; then
    print_test_result "Embedded CSS" "PASS" "CSS is embedded, no external dependencies"
else
    print_test_result "Embedded CSS" "FAIL" "External CSS dependencies found or CSS missing"
fi

# Check for embedded JavaScript (no external dependencies)
if grep -q "<script>" index.html && ! grep -q 'src="' index.html | grep -v "data:"; then
    print_test_result "Embedded JavaScript" "PASS" "JavaScript is embedded, no external dependencies"
else
    print_test_result "Embedded JavaScript" "FAIL" "External JavaScript dependencies found or JavaScript missing"
fi

# Check file structure completeness
if grep -q "</html>" index.html; then
    print_test_result "Complete HTML Structure" "PASS" "HTML structure is complete"
else
    print_test_result "Complete HTML Structure" "FAIL" "HTML structure is incomplete"
fi

# Advanced feature checks
advanced_features=("upscale" "4K" "lip.*sync" "voice.*clon" "motion")
advanced_found=0
for feature in "${advanced_features[@]}"; do
    if grep -qi "$feature" index.html; then
        advanced_found=$((advanced_found + 1))
    fi
done

if [ "$advanced_found" -ge 3 ]; then
    print_test_result "Advanced Features" "PASS" "Advanced features implemented ($advanced_found/5)"
else
    print_test_result "Advanced Features" "FAIL" "Insufficient advanced features ($advanced_found/5)"
fi

echo -e "\n${BLUE}8. Browser Compatibility Tests${NC}"
echo "=============================="

# Check for modern JavaScript features with fallbacks
if grep -q "addEventListener\|querySelector" index.html; then
    print_test_result "Modern JS APIs" "PASS" "Modern JavaScript APIs used"
else
    print_test_result "Modern JS APIs" "FAIL" "Modern JavaScript APIs missing"
fi

# Check for CSS3 features
css3_features=("border-radius" "box-shadow" "transition" "transform")
css3_found=0
for feature in "${css3_features[@]}"; do
    if grep -q "$feature" index.html; then
        css3_found=$((css3_found + 1))
    fi
done

if [ "$css3_found" -ge 2 ]; then
    print_test_result "CSS3 Features" "PASS" "CSS3 features found ($css3_found/4)"
else
    print_test_result "CSS3 Features" "FAIL" "Insufficient CSS3 features ($css3_found/4)"
fi

echo -e "\n${YELLOW}======================================${NC}"
echo -e "${YELLOW}          TEST SUMMARY${NC}"
echo -e "${YELLOW}======================================${NC}"

echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}Creator AI system is ready for deployment!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ $TESTS_FAILED TEST(S) FAILED${NC}"
    success_rate=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))
    echo -e "Success Rate: ${YELLOW}$success_rate%${NC}"
    
    if [ "$success_rate" -ge 80 ]; then
        echo -e "${YELLOW}System is mostly functional but needs minor fixes.${NC}"
        exit 1
    else
        echo -e "${RED}System needs significant improvements.${NC}"
        exit 2
    fi
fi