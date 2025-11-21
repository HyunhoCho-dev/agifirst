"""
AGIfirst Local Client - Jupyter Notebook style execution
This runs on the user's local machine and opens a browser automatically.
"""
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import sys
import logging
import webbrowser
import threading
import time
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from browser_agent import BrowserAgent
from groq_service import GroqAIService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the directory where the executable is located
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    APP_DIR = Path(sys._MEIPASS)
    DATA_DIR = Path(os.path.expanduser('~/.agifirst'))
    DATA_DIR.mkdir(exist_ok=True)
else:
    # Running as script
    APP_DIR = Path(__file__).parent
    DATA_DIR = APP_DIR

# Flask app setup
app = Flask(__name__, static_folder='public')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'local-dev-secret-key')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Active sessions
sessions = {}

# Configuration
CONFIG_FILE = DATA_DIR / 'config.json'
DEFAULT_PORT = 8080

def load_config():
    """Load configuration from file"""
    import json
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f'Failed to load config: {e}')
    return {}

def save_config(config):
    """Save configuration to file"""
    import json
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        logger.error(f'Failed to save config: {e}')

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory('public', path)
    except Exception as e:
        logger.warning(f'Failed to serve static file {path}: {e}')
        return {'error': 'File not found'}, 404

@app.route('/health')
def health():
    return {'status': 'ok', 'mode': 'local'}

@app.route('/api/config', methods=['GET', 'POST'])
def config_endpoint():
    """Get or set configuration"""
    if request.method == 'GET':
        config = load_config()
        # Don't send the actual API key to frontend
        return {
            'hasApiKey': bool(config.get('apiKey')),
            'port': config.get('port', DEFAULT_PORT)
        }
    else:
        data = request.json
        config = load_config()
        if 'apiKey' in data:
            config['apiKey'] = data['apiKey']
        save_config(config)
        return {'status': 'ok'}

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors gracefully"""
    logger.warning(f'404 error: {request.path}')
    if request.path == '/favicon.ico':
        return '', 204
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f'500 error: {error}')
    return {'error': 'Internal server error'}, 500

@socketio.on('connect')
def handle_connect():
    logger.info(f'Client connected: {request.sid}')

    # Auto-initialize with saved API key if available
    config = load_config()
    if config.get('apiKey'):
        emit('message', {
            'type': 'config_loaded',
            'message': 'API key loaded from config'
        })

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f'Client disconnected: {request.sid}')
    session_id = request.sid

    if session_id in sessions:
        session = sessions[session_id]
        if 'browser_agent' in session:
            try:
                session['browser_agent'].close()
            except Exception as e:
                logger.error(f'Error closing browser: {e}')
        del sessions[session_id]

@socketio.on('message')
def handle_message(data):
    """Handle incoming WebSocket messages"""
    session_id = request.sid
    msg_type = data.get('type')

    logger.info(f'Received message type: {msg_type}')

    try:
        if msg_type == 'init':
            handle_init(session_id, data)
        elif msg_type == 'execute':
            handle_execute(session_id, data)
        elif msg_type == 'stop':
            handle_stop(session_id)
        else:
            emit('message', {'type': 'error', 'message': 'Unknown command'})
    except Exception as e:
        logger.error(f'Error handling message: {e}')
        emit('message', {'type': 'error', 'message': str(e)})

def handle_init(session_id, data):
    """Initialize a new session with Groq API"""
    api_key = data.get('apiKey')

    # If no API key provided, try to load from config
    if not api_key:
        config = load_config()
        api_key = config.get('apiKey')

    if not api_key:
        emit('message', {'type': 'error', 'message': 'Groq API key is required'})
        return

    try:
        groq_service = GroqAIService(api_key)
        browser_agent = BrowserAgent(groq_service, socketio, session_id)

        sessions[session_id] = {
            'groq_service': groq_service,
            'browser_agent': browser_agent
        }

        # Save API key for future use
        config = load_config()
        config['apiKey'] = api_key
        save_config(config)

        emit('message', {'type': 'init_success', 'sessionId': session_id})
        logger.info(f'Session initialized: {session_id}')
    except Exception as e:
        logger.error(f'Initialization failed: {e}')
        emit('message', {'type': 'error', 'message': f'Failed to initialize: {str(e)}'})

def handle_execute(session_id, data):
    """Execute a browser automation task"""
    if session_id not in sessions:
        emit('message', {'type': 'error', 'message': 'Session not initialized'})
        return

    task = data.get('task')
    if not task:
        emit('message', {'type': 'error', 'message': 'Task is required'})
        return

    logger.info(f'Executing task: {task}')

    session = sessions[session_id]
    browser_agent = session['browser_agent']

    # Execute task in background thread
    socketio.start_background_task(browser_agent.execute_task, task)

def handle_stop(session_id):
    """Stop the current task execution"""
    if session_id in sessions:
        session = sessions[session_id]
        if 'browser_agent' in session:
            session['browser_agent'].stop()
            emit('message', {'type': 'stopped', 'message': 'Task execution stopped'})

def open_browser(port):
    """Open browser after a short delay"""
    time.sleep(2)  # Wait for server to start
    url = f'http://localhost:{port}'
    logger.info(f'Opening browser at {url}')
    try:
        webbrowser.open(url)
    except Exception as e:
        logger.error(f'Failed to open browser: {e}')
        print(f'\n\n🌐 Please open your browser and go to: {url}\n')

def main():
    """Main entry point"""
    config = load_config()
    port = config.get('port', DEFAULT_PORT)

    print('=' * 60)
    print('🤖 AGIfirst - AI Browser Control (Local Edition)')
    print('=' * 60)
    print(f'\n✅ Starting local server on port {port}...')
    print(f'🌐 Server URL: http://localhost:{port}')
    print('\n💡 The browser will open automatically in a few seconds...')
    print('   If it doesn\'t, please manually open the URL above.')
    print('\n⚠️  Press Ctrl+C to stop the server\n')
    print('=' * 60)

    # Open browser in a separate thread
    browser_thread = threading.Thread(target=open_browser, args=(port,), daemon=True)
    browser_thread.start()

    # Start Flask server
    try:
        socketio.run(
            app,
            host='127.0.0.1',  # localhost only for security
            port=port,
            debug=False,
            use_reloader=False
        )
    except KeyboardInterrupt:
        print('\n\n👋 Shutting down AGIfirst...')
        print('   Thank you for using AGIfirst!\n')
        sys.exit(0)
    except Exception as e:
        logger.error(f'Server error: {e}')
        print(f'\n❌ Error: {e}\n')
        sys.exit(1)

if __name__ == '__main__':
    main()
