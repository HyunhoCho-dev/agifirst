from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import logging
from browser_agent import BrowserAgent
from groq_service import GroqAIService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='public')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

# Active sessions
sessions = {}

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

@app.route('/health')
def health():
    return {'status': 'ok'}

@socketio.on('connect')
def handle_connect():
    logger.info(f'Client connected: {request.sid}')
    emit('message', {'type': 'connected', 'session_id': request.sid})

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
