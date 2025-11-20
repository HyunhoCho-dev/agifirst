class AGIFirstClient {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.apiKey = null;
    this.isConnected = false;
    this.isExecuting = false;
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Modal elements
    this.apiKeyModal = document.getElementById('apiKeyModal');
    this.apiKeyInput = document.getElementById('apiKeyInput');
    this.connectBtn = document.getElementById('connectBtn');

    // App elements
    this.app = document.getElementById('app');
    this.messages = document.getElementById('messages');
    this.taskInput = document.getElementById('taskInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.newChatBtn = document.getElementById('newChatBtn');
    this.disconnectBtn = document.getElementById('disconnectBtn');
    this.statusIndicator = document.getElementById('statusIndicator');
    this.statusText = document.getElementById('statusText');
  }

  attachEventListeners() {
    this.connectBtn.addEventListener('click', () => this.connect());
    this.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.connect();
    });

    this.sendBtn.addEventListener('click', () => this.sendTask());
    this.stopBtn.addEventListener('click', () => this.stopTask());
    this.newChatBtn.addEventListener('click', () => this.newChat());
    this.disconnectBtn.addEventListener('click', () => this.disconnect());

    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendTask();
      }
    });

    this.taskInput.addEventListener('input', () => {
      this.taskInput.style.height = 'auto';
      this.taskInput.style.height = this.taskInput.scrollHeight + 'px';
    });
  }

  async connect() {
    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      alert('Please enter your Groq API key');
      return;
    }

    this.apiKey = apiKey;
    this.connectBtn.disabled = true;
    this.connectBtn.textContent = 'Connecting...';

    try {
      // Connect using Socket.IO
      this.socket = io({
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.socket.emit('message', {
          type: 'init',
          apiKey: this.apiKey
        });
      });

      this.socket.on('message', (data) => {
        this.handleMessage(data);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO error:', error);
        this.showError('Connection error. Please try again.');
        this.resetConnection();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.resetConnection();
      });

    } catch (error) {
      console.error('Connection error:', error);
      this.showError('Failed to connect. Please try again.');
      this.resetConnection();
    }
  }

  handleMessage(data) {
    console.log('Received message:', data);

    switch (data.type) {
      case 'init_success':
        this.sessionId = data.sessionId;
        this.isConnected = true;
        this.apiKeyModal.classList.add('hidden');
        this.app.classList.remove('hidden');
        this.updateStatus('Connected', true);
        break;

      case 'started':
        this.isExecuting = true;
        this.updateExecutingState();
        this.addStatusMessage('Task started...', 'info');
        break;

      case 'thinking':
        this.addStatusMessage(`🤔 ${data.message}`, 'info');
        break;

      case 'ai_response':
        this.addAssistantMessage(data.message);
        break;

      case 'action':
        this.addStatusMessage(`⚡ ${data.message}`, 'info');
        break;

      case 'action_error':
        this.addStatusMessage(`⚠️ ${data.message}`, 'warning');
        break;

      case 'screenshot':
        this.addScreenshot(data.screenshot);
        break;

      case 'extracted':
        this.addStatusMessage(`📄 Extracted: ${data.texts.join(', ')}`, 'info');
        break;

      case 'completed':
        this.isExecuting = false;
        this.updateExecutingState();
        this.addStatusMessage('✅ ' + data.message, 'success');
        break;

      case 'stopped':
        this.isExecuting = false;
        this.updateExecutingState();
        this.addStatusMessage('⏹️ ' + data.message, 'info');
        break;

      case 'max_iterations':
        this.isExecuting = false;
        this.updateExecutingState();
        this.addStatusMessage('⏱️ ' + data.message, 'warning');
        break;

      case 'error':
        this.isExecuting = false;
        this.updateExecutingState();
        this.addStatusMessage('❌ ' + data.message, 'error');
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }

  sendTask() {
    const task = this.taskInput.value.trim();

    if (!task || !this.isConnected || this.isExecuting) {
      return;
    }

    this.addUserMessage(task);
    this.taskInput.value = '';
    this.taskInput.style.height = 'auto';

    this.socket.emit('message', {
      type: 'execute',
      task: task
    });
  }

  stopTask() {
    if (this.isExecuting && this.socket) {
      this.socket.emit('message', {
        type: 'stop'
      });
    }
  }

  newChat() {
    const welcomeMsg = this.messages.querySelector('.welcome-message');
    if (!welcomeMsg) {
      this.messages.innerHTML = `
        <div class="welcome-message">
          <h1>AGIfirst</h1>
          <p>I can control your browser to help you with:</p>
          <div class="capabilities">
            <div class="capability-card">
              <div class="capability-icon">🎮</div>
              <div class="capability-text">Playing web games</div>
            </div>
            <div class="capability-card">
              <div class="capability-icon">🔍</div>
              <div class="capability-text">Web searching</div>
            </div>
            <div class="capability-card">
              <div class="capability-icon">🛒</div>
              <div class="capability-text">Online shopping</div>
            </div>
            <div class="capability-card">
              <div class="capability-icon">💼</div>
              <div class="capability-text">Work tasks</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.resetConnection();
    this.apiKeyModal.classList.remove('hidden');
    this.app.classList.add('hidden');
    this.apiKeyInput.value = '';
    this.messages.innerHTML = '';
    this.newChat();
  }

  resetConnection() {
    this.isConnected = false;
    this.isExecuting = false;
    this.sessionId = null;
    this.connectBtn.disabled = false;
    this.connectBtn.textContent = 'Connect';
    this.updateStatus('Disconnected', false);
  }

  updateStatus(text, connected) {
    this.statusText.textContent = text;
    if (connected) {
      this.statusIndicator.classList.add('connected');
    } else {
      this.statusIndicator.classList.remove('connected');
    }
  }

  updateExecutingState() {
    if (this.isExecuting) {
      this.sendBtn.classList.add('hidden');
      this.stopBtn.classList.remove('hidden');
      this.taskInput.disabled = true;
    } else {
      this.sendBtn.classList.remove('hidden');
      this.stopBtn.classList.add('hidden');
      this.taskInput.disabled = false;
    }
  }

  addUserMessage(text) {
    const welcomeMsg = this.messages.querySelector('.welcome-message');
    if (welcomeMsg) {
      welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-content">${this.escapeHtml(text)}</div>
    `;
    this.messages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addAssistantMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">${this.escapeHtml(text)}</div>
    `;
    this.messages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addStatusMessage(text, type = 'info') {
    let lastMessage = this.messages.lastElementChild;

    if (lastMessage && lastMessage.classList.contains('message')) {
      const statusDiv = document.createElement('div');
      statusDiv.className = `status-message ${type}`;
      statusDiv.textContent = text;
      lastMessage.querySelector('.message-content').appendChild(statusDiv);
    } else {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message assistant';
      messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="status-message ${type}">${this.escapeHtml(text)}</div>
        </div>
      `;
      this.messages.appendChild(messageDiv);
    }

    this.scrollToBottom();
  }

  addScreenshot(base64) {
    let lastMessage = this.messages.lastElementChild;

    if (lastMessage && lastMessage.classList.contains('message')) {
      const img = document.createElement('img');
      img.src = `data:image/png;base64,${base64}`;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.marginTop = '8px';
      lastMessage.querySelector('.message-content').appendChild(img);
    }

    this.scrollToBottom();
  }

  showError(message) {
    alert(message);
  }

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app
const app = new AGIFirstClient();
