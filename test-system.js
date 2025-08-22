#!/usr/bin/env node

/**
 * Test script for Creator AI Backup System
 * This script tests basic functionality without requiring OneDrive authentication
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

class SystemTester {
    constructor() {
        this.server = null;
        this.testsPassed = 0;
        this.testsTotal = 0;
    }

    async runTests() {
        console.log('🧪 Creator AI Backup System - Test Suite');
        console.log('=========================================\n');

        try {
            await this.startTestServer();
            await this.wait(2000); // Wait for server to start
            
            await this.testServerStartup();
            await this.testAPIEndpoints();
            await this.testFileOperations();
            await this.testWebInterface();
            
            this.showResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        } finally {
            this.stopTestServer();
        }
    }

    async startTestServer() {
        console.log('🚀 Starting test server...');
        
        // Set test environment
        process.env.PORT = TEST_PORT;
        process.env.CLIENT_ID = 'test-client-id';
        process.env.CLIENT_SECRET = 'test-client-secret';
        
        this.server = spawn('node', ['server.js'], {
            cwd: process.cwd(),
            stdio: 'pipe',
            env: { ...process.env }
        });
        
        this.server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('running on port')) {
                console.log('✅ Test server started on port', TEST_PORT);
            }
        });
        
        this.server.stderr.on('data', (data) => {
            // Suppress expected MSAL warnings in test
            const output = data.toString();
            if (!output.includes('MSAL initialization failed')) {
                console.log('Server error:', output);
            }
        });
    }

    stopTestServer() {
        if (this.server) {
            this.server.kill();
            console.log('🛑 Test server stopped\n');
        }
    }

    async testServerStartup() {
        console.log('📡 Testing server startup...');
        this.testsTotal++;
        
        try {
            const response = await axios.get(BASE_URL, { timeout: 5000 });
            if (response.status === 200) {
                console.log('✅ Server responds to HTTP requests');
                this.testsPassed++;
            }
        } catch (error) {
            console.log('❌ Server startup test failed:', error.message);
        }
    }

    async testAPIEndpoints() {
        console.log('🔌 Testing API endpoints...');
        
        const endpoints = [
            { path: '/api/status', name: 'Status API' },
            { path: '/api/files', name: 'Files API' }
        ];
        
        for (const endpoint of endpoints) {
            this.testsTotal++;
            try {
                const response = await axios.get(BASE_URL + endpoint.path);
                if (response.status === 200) {
                    console.log(`✅ ${endpoint.name} working`);
                    this.testsPassed++;
                } else {
                    console.log(`❌ ${endpoint.name} returned status ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint.name} failed:`, error.message);
            }
        }
    }

    async testFileOperations() {
        console.log('📁 Testing file operations...');
        
        // Test file upload simulation
        this.testsTotal++;
        try {
            // Create test directories
            await fs.ensureDir('./backup-data');
            await fs.ensureDir('./uploads');
            
            // Create a test file
            const testFilePath = path.join('./backup-data', 'test-file.txt');
            await fs.writeFile(testFilePath, 'This is a test file for Creator AI Backup System');
            
            // Check if file was created
            if (await fs.pathExists(testFilePath)) {
                console.log('✅ File operations working');
                this.testsPassed++;
                
                // Clean up
                await fs.remove(testFilePath);
            }
        } catch (error) {
            console.log('❌ File operations failed:', error.message);
        }
    }

    async testWebInterface() {
        console.log('🌐 Testing web interface...');
        this.testsTotal++;
        
        try {
            const response = await axios.get(BASE_URL);
            const html = response.data;
            
            // Check for key UI elements
            const hasTitle = html.includes('Creator AI');
            const hasUploadArea = html.includes('upload-area');
            const hasAuthSection = html.includes('auth-section');
            const hasCSS = html.includes('style.css');
            const hasJS = html.includes('app.js');
            
            if (hasTitle && hasUploadArea && hasAuthSection && hasCSS && hasJS) {
                console.log('✅ Web interface components loaded');
                this.testsPassed++;
            } else {
                console.log('❌ Web interface missing components');
            }
        } catch (error) {
            console.log('❌ Web interface test failed:', error.message);
        }
    }

    showResults() {
        console.log('\n📊 Test Results');
        console.log('================');
        console.log(`✅ Tests passed: ${this.testsPassed}/${this.testsTotal}`);
        console.log(`❌ Tests failed: ${this.testsTotal - this.testsPassed}/${this.testsTotal}`);
        
        const percentage = Math.round((this.testsPassed / this.testsTotal) * 100);
        console.log(`📈 Success rate: ${percentage}%`);
        
        if (this.testsPassed === this.testsTotal) {
            console.log('\n🎉 All tests passed! The system is ready to use.');
            console.log('💡 Next steps:');
            console.log('   1. Configure your Microsoft Azure app credentials in .env');
            console.log('   2. Run: npm start');
            console.log('   3. Open: http://localhost:3000');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the setup.');
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new SystemTester();
    tester.runTests().catch(console.error);
}

module.exports = SystemTester;