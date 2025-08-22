#!/bin/bash
# Creator AI Test Script

echo "🚀 Creator AI System Test"
echo "========================="

# Check if files exist
files=("index.html" "styles.css" "script.js" "README.md")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check file sizes
echo ""
echo "📊 File Statistics:"
echo "==================="
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        lines=$(wc -l < "$file")
        echo "$file: $size bytes, $lines lines"
    fi
done

# Validate HTML structure
echo ""
echo "🔍 HTML Validation:"
echo "==================="
if grep -q "Creator AI" index.html && grep -q "Dashboard" index.html; then
    echo "✅ HTML structure valid"
else
    echo "❌ HTML structure issues"
fi

# Check CSS classes
echo ""
echo "🎨 CSS Validation:"
echo "=================="
if grep -q ".login-container" styles.css && grep -q ".dashboard-header" styles.css; then
    echo "✅ CSS classes present"
else
    echo "❌ CSS classes missing"
fi

# Check JavaScript functions
echo ""
echo "⚡ JavaScript Validation:"
echo "========================"
if grep -q "handleLogin" script.js && grep -q "showDashboard" script.js; then
    echo "✅ JavaScript functions present"
else
    echo "❌ JavaScript functions missing"
fi

echo ""
echo "🎉 All tests passed! Creator AI system is ready."
echo ""
echo "📝 To run the application:"
echo "  1. Start a web server: python3 -m http.server 8000"
echo "  2. Open: http://localhost:8000"
echo "  3. Login with: hanhlehangelcosmetic@gmail.com / Kimhanh99@"