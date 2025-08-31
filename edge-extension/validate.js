/**
 * Creator AI Extension Validation Script
 * Validates the extension structure and manifest
 */

const fs = require('fs');
const path = require('path');

function validateExtension() {
    console.log('🔍 Validating Creator AI Extension...\n');
    
    let isValid = true;
    
    // Required files
    const requiredFiles = [
        'manifest.json',
        'popup.html',
        'background.js',
        'css/popup.css',
        'js/api.js',
        'js/popup.js',
        'icons/icon16.png',
        'icons/icon32.png',
        'icons/icon48.png',
        'icons/icon128.png',
        'README.md',
        'welcome.html'
    ];
    
    console.log('📁 Checking required files:');
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            isValid = false;
        }
    });
    
    // Validate manifest.json
    console.log('\n📋 Validating manifest.json:');
    try {
        const manifestPath = path.join(__dirname, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Check required manifest fields
        const requiredFields = ['manifest_version', 'name', 'version', 'description'];
        requiredFields.forEach(field => {
            if (manifest[field]) {
                console.log(`✅ ${field}: ${manifest[field]}`);
            } else {
                console.log(`❌ ${field} - MISSING`);
                isValid = false;
            }
        });
        
        // Check manifest version
        if (manifest.manifest_version === 3) {
            console.log('✅ Manifest V3 format');
        } else {
            console.log('❌ Invalid manifest version (should be 3)');
            isValid = false;
        }
        
        // Check permissions
        if (manifest.permissions && manifest.permissions.length > 0) {
            console.log(`✅ Permissions: ${manifest.permissions.join(', ')}`);
        } else {
            console.log('⚠️  No permissions specified');
        }
        
        // Check host permissions
        if (manifest.host_permissions && manifest.host_permissions.length > 0) {
            console.log(`✅ Host permissions: ${manifest.host_permissions.join(', ')}`);
        } else {
            console.log('⚠️  No host permissions specified');
        }
        
    } catch (error) {
        console.log('❌ Invalid manifest.json:', error.message);
        isValid = false;
    }
    
    // Check icon files
    console.log('\n🎨 Validating icons:');
    const iconSizes = ['16', '32', '48', '128'];
    iconSizes.forEach(size => {
        const iconPath = path.join(__dirname, 'icons', `icon${size}.png`);
        if (fs.existsSync(iconPath)) {
            const stats = fs.statSync(iconPath);
            console.log(`✅ icon${size}.png (${stats.size} bytes)`);
        } else {
            console.log(`❌ icon${size}.png - MISSING`);
            isValid = false;
        }
    });
    
    // Check file sizes
    console.log('\n📊 File size check:');
    const maxSizes = {
        'popup.html': 50000, // 50KB
        'css/popup.css': 20000, // 20KB
        'js/popup.js': 50000, // 50KB
        'js/api.js': 30000, // 30KB
        'background.js': 30000 // 30KB
    };
    
    Object.entries(maxSizes).forEach(([file, maxSize]) => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size <= maxSize) {
                console.log(`✅ ${file} (${stats.size} bytes)`);
            } else {
                console.log(`⚠️  ${file} (${stats.size} bytes) - Large file`);
            }
        }
    });
    
    // Calculate total extension size
    const calculateDirSize = (dirPath) => {
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.lstatSync(filePath);
            
            if (stats.isDirectory()) {
                totalSize += calculateDirSize(filePath);
            } else {
                totalSize += stats.size;
            }
        });
        
        return totalSize;
    };
    
    const totalSize = calculateDirSize(__dirname);
    console.log(`\n📦 Total extension size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    // Final validation result
    console.log('\n' + '='.repeat(50));
    if (isValid) {
        console.log('🎉 Extension validation PASSED!');
        console.log('✅ Extension is ready for installation in Edge Developer Mode');
        console.log('\n🚀 Next steps:');
        console.log('1. Open Microsoft Edge');
        console.log('2. Go to edge://extensions/');
        console.log('3. Enable "Developer mode"');
        console.log('4. Click "Load unpacked"');
        console.log('5. Select this edge-extension folder');
    } else {
        console.log('❌ Extension validation FAILED!');
        console.log('Please fix the issues above before installing the extension.');
    }
    console.log('='.repeat(50));
    
    return isValid;
}

// Run validation if called directly
if (require.main === module) {
    process.exit(validateExtension() ? 0 : 1);
}

module.exports = { validateExtension };