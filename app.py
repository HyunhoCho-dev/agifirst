from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
from browser_agent import BrowserAgent
from groq_service import GroqAIService

app = Flask(__name__, static_folder='public')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Active sessions
sessions = {}

@app.route('/health')
def health():
    return {'status': 'ok'}

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('public', path)

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    print(f'Client disconnected: {session_id}')

    if session_id in sessions:
        session = sessions[session_id]
        if 'browser_agent' in session:
            try:
                session['browser_agent'].close()
            except Exception as e:
                print(f'Error closing browser: {e}')
        del sessions[session_id]

@socketio.on('message')
def handle_message(data):
    session_id = request.sid
    message_type = data.get('type')

    print(f'Received message type: {message_type}')

    try:
        if message_type == 'init':
            handle_init(session_id, data)
        elif message_type == 'execute':
            handle_execute(session_id, data)
        elif message_type == 'stop':
            handle_stop(session_id)
        else:
            emit('message', {'type': 'error', 'message': 'Unknown command'})
    except Exception as e:
        print(f'Error handling message: {e}')
        emit('message', {'type': 'error', 'message': str(e)})

def handle_init(session_id, data):
    api_key = data.get('apiKey')

    if not api_key:
        emit('message', {'type': 'error', 'message': 'Groq API key is required'})
        return

    try:
        groq_service = GroqAIService(api_key)
        browser_agent = BrowserAgent(groq_service, session_id, socketio)

        sessions[session_id] = {
            'groq_service': groq_service,
            'browser_agent': browser_agent
        }

        emit('message', {
            'type': 'init_success',
            'sessionId': session_id
        })
    except Exception as e:
        emit('message', {
            'type': 'error',
            'message': f'Failed to initialize: {str(e)}'
        })

def handle_execute(session_id, data):
    if session_id not in sessions:
        emit('message', {
            'type': 'error',
            'message': 'Session not initialized'
        })
        return

    task = data.get('task')
    print(f'Executing task: {task}')

    try:
        session = sessions[session_id]
        browser_agent = session['browser_agent']

        # Run task in background thread
        socketio.start_background_task(
            target=browser_agent.execute_task,
            task=task
        )
    except Exception as e:
        print(f'Error starting task: {e}')
        emit('message', {
            'type': 'error',
            'message': f'Failed to start task: {str(e)}'
        })

def handle_stop(session_id):
    if session_id in sessions:
        session = sessions[session_id]
        if 'browser_agent' in session:
            session['browser_agent'].stop()
            emit('message', {
                'type': 'stopped',
                'message': 'Task execution stopped'
            })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
