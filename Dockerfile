FROM node:20-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome and ChromeDriver using Chrome for Testing (specific stable version)
RUN CHROME_VERSION="131.0.6778.108" && \
    echo "Installing Chrome version: $CHROME_VERSION" && \
    wget -q "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chrome-linux64.zip" -O /tmp/chrome-linux64.zip && \
    wget -q "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip" -O /tmp/chromedriver-linux64.zip && \
    unzip /tmp/chrome-linux64.zip -d /opt/ && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    ln -s /opt/chrome-linux64/chrome /usr/local/bin/google-chrome && \
    ln -s /opt/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/google-chrome && \
    chmod +x /usr/local/bin/chromedriver && \
    rm /tmp/chrome-linux64.zip /tmp/chromedriver-linux64.zip && \
    echo "Chrome installation completed" && \
    ls -la /opt/chrome-linux64/ && \
    google-chrome --version && \
    chromedriver --version

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
