from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time
import json
import logging
import os

logger = logging.getLogger(__name__)

class BrowserAgent:
    def __init__(self, groq_service, socketio, session_id):
        self.groq_service = groq_service
        self.socketio = socketio
        self.session_id = session_id
        self.driver = None
        self.is_executing = False
        self.should_stop = False

    def initialize(self):
        """Initialize Selenium WebDriver with Chrome"""
        if not self.driver:
            try:
                options = Options()

                # Try to set Chrome binary path if it exists
                if os.path.exists('/opt/chrome-linux64/chrome'):
                    options.binary_location = '/opt/chrome-linux64/chrome'
                    logger.info('Using Chrome at /opt/chrome-linux64/chrome')

                # Headless and security options
                options.add_argument('--headless=new')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument('--disable-gpu')
                options.add_argument('--disable-software-rasterizer')
                options.add_argument('--disable-extensions')
                options.add_argument('--disable-setuid-sandbox')
                options.add_argument('--window-size=1280,720')
                options.add_argument('--start-maximized')
                options.add_argument('--disable-blink-features=AutomationControlled')
                options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

                logger.info('Initializing Selenium WebDriver with Chrome...')

                self.driver = webdriver.Chrome(options=options)
                self.driver.set_window_size(1280, 720)

                self.send_status('browser_ready', 'Browser initialized successfully')
                logger.info('✅ Browser initialized successfully')
            except Exception as e:
                logger.error(f'❌ Browser initialization failed: {e}')
                self.send_status('error', f'Failed to initialize browser: {str(e)}')
                raise

    def send_status(self, status, message, **kwargs):
        """Send status update to client via WebSocket"""
        try:
            data = {
                'type': status,
                'message': message,
                **kwargs
            }
            self.socketio.emit('message', data, to=self.session_id)
        except Exception as e:
            logger.error(f'Error sending status: {e}')

    def execute_task(self, task):
        """Execute a browser automation task"""
        if self.is_executing:
            self.send_status('error', 'Another task is already running')
            return

        self.is_executing = True
        self.should_stop = False

        try:
            self.initialize()
            self.send_status('started', 'Starting task execution...')

            system_prompt = """You are an AI browser automation assistant. Your job is to control a web browser using Selenium commands to complete user tasks.

Available actions you can take:
1. navigate(url) - Navigate to a URL
2. click(selector) - Click an element (use CSS selectors)
3. type(selector, text) - Type text into an input
4. scroll(direction) - Scroll up or down
5. screenshot() - Take a screenshot
6. extract(selector) - Extract text from elements
7. wait(seconds) - Wait for specified seconds
8. press(key) - Press a keyboard key (e.g., "Enter", "Tab")

You must respond with a JSON array of actions to take, followed by your reasoning. Format:
{
  "actions": [
    {"action": "navigate", "params": {"url": "https://example.com"}},
    {"action": "type", "params": {"selector": "#search", "text": "search term"}},
    {"action": "click", "params": {"selector": "button[type='submit']"}}
  ],
  "reasoning": "Explanation of what you're doing and why",
  "isComplete": false
}

Set "isComplete" to true only when the task is fully accomplished.

IMPORTANT: Always provide concrete, working CSS selectors. If you're unsure, use screenshot() first to see the page."""

            is_complete = False
            iteration_count = 0
            max_iterations = 50

            while not is_complete and not self.should_stop and iteration_count < max_iterations:
                iteration_count += 1

                # Get current page state
                page_info = self.get_page_info()
                user_prompt = f"""Task: {task}

Current page state:
URL: {page_info['url']}
Title: {page_info['title']}

Iteration: {iteration_count}/{max_iterations}

What should I do next?"""

                self.send_status('thinking', 'AI is analyzing the page...',
                               iteration=iteration_count, url=page_info['url'])

                # Get AI decision
                ai_response = self.groq_service.chat(user_prompt, system_prompt)
                self.send_status('ai_response', ai_response)

                # Parse AI response
                try:
                    # Extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', ai_response)
                    if json_match:
                        parsed_response = json.loads(json_match.group(0))
                    else:
                        raise ValueError('No JSON found in response')
                except Exception as e:
                    self.send_status('warning', 'Failed to parse AI response, retrying...',
                                   error=str(e), response=ai_response)
                    continue

                # Execute actions
                if 'actions' in parsed_response and isinstance(parsed_response['actions'], list):
                    for action_item in parsed_response['actions']:
                        if self.should_stop:
                            break

                        try:
                            self.execute_action(action_item)
                            time.sleep(1)  # Wait between actions
                        except Exception as e:
                            self.send_status('action_error', f'Action failed: {str(e)}',
                                           action=action_item)

                # Check if task is complete
                if parsed_response.get('isComplete'):
                    is_complete = True
                    self.send_status('completed', 'Task completed successfully!',
                                   reasoning=parsed_response.get('reasoning', ''))

            if iteration_count >= max_iterations:
                self.send_status('max_iterations', 'Reached maximum iterations. Task may not be complete.')

        except Exception as e:
            logger.error(f'Task execution failed: {e}')
            self.send_status('error', f'Task execution failed: {str(e)}')
        finally:
            self.is_executing = False

    def execute_action(self, action_item):
        """Execute a single browser action"""
        action = action_item.get('action')
        params = action_item.get('params', {})

        self.send_status('action', f'Executing: {action}', params=params)

        if action == 'navigate':
            self.driver.get(params['url'])

        elif action == 'click':
            element = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, params['selector']))
            )
            element.click()

        elif action == 'type':
            element = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, params['selector']))
            )
            element.clear()
            element.send_keys(params['text'])

        elif action == 'scroll':
            direction = params.get('direction', 'down')
            scroll_amount = 500 if direction == 'down' else -500
            self.driver.execute_script(f'window.scrollBy(0, {scroll_amount});')

        elif action == 'screenshot':
            screenshot = self.driver.get_screenshot_as_base64()
            self.send_status('screenshot', 'Screenshot taken', screenshot=screenshot)

        elif action == 'extract':
            elements = self.driver.find_elements(By.CSS_SELECTOR, params['selector'])
            texts = [el.text for el in elements]
            self.send_status('extracted', 'Text extracted', texts=texts)

        elif action == 'wait':
            time.sleep(params.get('seconds', 1))

        elif action == 'press':
            key = params['key']
            key_map = {
                'Enter': Keys.ENTER,
                'Return': Keys.RETURN,
                'Tab': Keys.TAB,
                'Escape': Keys.ESCAPE,
                'Backspace': Keys.BACKSPACE,
                'Delete': Keys.DELETE,
                'ArrowUp': Keys.ARROW_UP,
                'ArrowDown': Keys.ARROW_DOWN,
                'ArrowLeft': Keys.ARROW_LEFT,
                'ArrowRight': Keys.ARROW_RIGHT,
            }
            key_to_press = key_map.get(key, key)
            body = self.driver.find_element(By.CSS_SELECTOR, 'body')
            body.send_keys(key_to_press)

        else:
            self.send_status('warning', f'Unknown action: {action}')

    def get_page_info(self):
        """Get current page information"""
        return {
            'url': self.driver.current_url,
            'title': self.driver.title,
            'html': ''  # Omit HTML for performance
        }

    def stop(self):
        """Stop task execution"""
        self.should_stop = True
        self.is_executing = False

    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            self.driver = None
