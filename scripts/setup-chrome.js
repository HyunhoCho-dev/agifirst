#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Checking Chrome installation...');

try {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('⏭️  Skipping (development mode)');
    process.exit(0);
  }

  // Check if Chrome already exists
  try {
    execSync('google-chrome --version', { stdio: 'pipe' });
    console.log('✅ Chrome already installed');
    process.exit(0);
  } catch (e) {
    console.log('📦 Chrome not found, installing...');
  }

  const CHROME_VERSION = '131.0.6778.108';

  console.log(`⬇️  Downloading Chrome ${CHROME_VERSION}...`);
  execSync(`wget -q https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chrome-linux64.zip -O /tmp/chrome.zip`, { stdio: 'inherit' });

  console.log(`⬇️  Downloading ChromeDriver ${CHROME_VERSION}...`);
  execSync(`wget -q https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip -O /tmp/chromedriver.zip`, { stdio: 'inherit' });

  console.log('📦 Extracting...');
  execSync('mkdir -p /tmp/chrome /tmp/chromedriver', { stdio: 'inherit' });
  execSync('unzip -q /tmp/chrome.zip -d /tmp/chrome', { stdio: 'inherit' });
  execSync('unzip -q /tmp/chromedriver.zip -d /tmp/chromedriver', { stdio: 'inherit' });

  console.log('📁 Moving to /opt...');
  execSync('mkdir -p /opt', { stdio: 'inherit' });
  execSync('cp -r /tmp/chrome/chrome-linux64 /opt/', { stdio: 'inherit' });
  execSync('cp -r /tmp/chromedriver/chromedriver-linux64 /opt/', { stdio: 'inherit' });

  console.log('🔗 Creating symlinks...');
  execSync('ln -sf /opt/chrome-linux64/chrome /usr/local/bin/google-chrome', { stdio: 'inherit' });
  execSync('ln -sf /opt/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver', { stdio: 'inherit' });
  execSync('chmod +x /usr/local/bin/google-chrome /usr/local/bin/chromedriver', { stdio: 'inherit' });

  console.log('🧹 Cleaning up...');
  execSync('rm -rf /tmp/chrome.zip /tmp/chromedriver.zip /tmp/chrome /tmp/chromedriver', { stdio: 'inherit' });

  console.log('✅ Verifying...');
  execSync('google-chrome --version', { stdio: 'inherit' });
  execSync('chromedriver --version', { stdio: 'inherit' });

  console.log('🎉 Installation complete!');
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('⚠️  Continuing anyway...');
  process.exit(0); // Don't fail the build
}
