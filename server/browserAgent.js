import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

export class BrowserAgent {
  constructor(groqService, ws) {
    this.groqService = groqService;
    this.ws = ws;
    this.driver = null;
    this.isExecuting = false;
    this.shouldStop = false;
  }

  async initialize() {
    if (!this.driver) {
      try {
        const options = new chrome.Options();

        // Chrome binary path - try to auto-detect or use common paths
        // Don't set it explicitly, let Selenium find it automatically
        // options.setChromeBinaryPath('/usr/bin/google-chrome-stable');

        // Headless and security options
        options.addArguments('--headless=new');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--disable-software-rasterizer');
        options.addArguments('--disable-extensions');
        options.addArguments('--disable-setuid-sandbox');
        options.addArguments('--window-size=1280,720');
        options.addArguments('--start-maximized');
        options.addArguments('--disable-blink-features=AutomationControlled');
        options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        this.driver = await new Builder()
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build();

        await this.driver.manage().window().setRect({ width: 1280, height: 720 });

        this.sendStatus('browser_ready', 'Browser initialized successfully');
      } catch (error) {
        this.sendStatus('error', 'Failed to initialize browser: ' + error.message);
        throw error;
      }
    }
  }

  sendStatus(status, message, data = {}) {
    try {
      if (this.ws && this.ws.readyState === 1) { // 1 = OPEN
        this.ws.send(JSON.stringify({
          type: status,
          message,
          ...data
        }));
      } else {
        console.log(`Cannot send message (WebSocket closed): ${status} - ${message}`);
      }
    } catch (error) {
      console.error('Error sending status:', error);
    }
  }

  async executeTask(task) {
    if (this.isExecuting) {
      this.sendStatus('error', 'Another task is already running');
      return;
    }

    this.isExecuting = true;
    this.shouldStop = false;

    try {
      await this.initialize();
      this.sendStatus('started', 'Starting task execution...');

      const systemPrompt = `You are an AI browser automation assistant. Your job is to control a web browser using Selenium commands to complete user tasks.

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

IMPORTANT: Always provide concrete, working CSS selectors. If you're unsure, use screenshot() first to see the page.`;

      let isComplete = false;
      let iterationCount = 0;
      const maxIterations = 50;

      while (!isComplete && !this.shouldStop && iterationCount < maxIterations) {
        iterationCount++;

        // Get current page state
        const pageInfo = await this.getPageInfo();
        const userPrompt = `Task: ${task}\n\nCurrent page state:\nURL: ${pageInfo.url}\nTitle: ${pageInfo.title}\n\nIteration: ${iterationCount}/${maxIterations}\n\nWhat should I do next?`;

        this.sendStatus('thinking', 'AI is analyzing the page...', {
          iteration: iterationCount,
          url: pageInfo.url
        });

        // Get AI decision
        const aiResponse = await this.groqService.chat(userPrompt, systemPrompt);

        this.sendStatus('ai_response', aiResponse);

        // Parse AI response
        let parsedResponse;
        try {
          // Extract JSON from response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (error) {
          this.sendStatus('warning', 'Failed to parse AI response, retrying...', {
            error: error.message,
            response: aiResponse
          });
          continue;
        }

        // Execute actions
        if (parsedResponse.actions && Array.isArray(parsedResponse.actions)) {
          for (const actionItem of parsedResponse.actions) {
            if (this.shouldStop) break;

            try {
              await this.executeAction(actionItem);
              await this.driver.sleep(1000); // Wait between actions
            } catch (error) {
              this.sendStatus('action_error', `Action failed: ${error.message}`, {
                action: actionItem
              });
            }
          }
        }

        // Check if task is complete
        if (parsedResponse.isComplete) {
          isComplete = true;
          this.sendStatus('completed', 'Task completed successfully!', {
            reasoning: parsedResponse.reasoning
          });
        }
      }

      if (iterationCount >= maxIterations) {
        this.sendStatus('max_iterations', 'Reached maximum iterations. Task may not be complete.');
      }

    } catch (error) {
      this.sendStatus('error', 'Task execution failed: ' + error.message);
    } finally {
      this.isExecuting = false;
    }
  }

  async executeAction(actionItem) {
    const { action, params } = actionItem;

    this.sendStatus('action', `Executing: ${action}`, { params });

    switch (action) {
      case 'navigate':
        await this.driver.get(params.url);
        break;

      case 'click':
        const clickElement = await this.driver.wait(
          until.elementLocated(By.css(params.selector)),
          10000
        );
        await clickElement.click();
        break;

      case 'type':
        const typeElement = await this.driver.wait(
          until.elementLocated(By.css(params.selector)),
          10000
        );
        await typeElement.clear();
        await typeElement.sendKeys(params.text);
        break;

      case 'scroll':
        const direction = params.direction || 'down';
        await this.driver.executeScript(`window.scrollBy(0, ${direction === 'down' ? 500 : -500});`);
        break;

      case 'screenshot':
        const screenshot = await this.driver.takeScreenshot();
        this.sendStatus('screenshot', 'Screenshot taken', { screenshot });
        break;

      case 'extract':
        const elements = await this.driver.findElements(By.css(params.selector));
        const texts = await Promise.all(
          elements.map(el => el.getText())
        );
        this.sendStatus('extracted', 'Text extracted', { texts });
        break;

      case 'wait':
        await this.driver.sleep((params.seconds || 1) * 1000);
        break;

      case 'press':
        const body = await this.driver.findElement(By.css('body'));
        let keyToPress = params.key;

        // Map common key names to Selenium Key enum
        const keyMap = {
          'Enter': Key.ENTER,
          'Return': Key.RETURN,
          'Tab': Key.TAB,
          'Escape': Key.ESCAPE,
          'Backspace': Key.BACK_SPACE,
          'Delete': Key.DELETE,
          'ArrowUp': Key.ARROW_UP,
          'ArrowDown': Key.ARROW_DOWN,
          'ArrowLeft': Key.ARROW_LEFT,
          'ArrowRight': Key.ARROW_RIGHT,
        };

        keyToPress = keyMap[params.key] || params.key;
        await body.sendKeys(keyToPress);
        break;

      default:
        this.sendStatus('warning', `Unknown action: ${action}`);
    }
  }

  async getPageInfo() {
    const url = await this.driver.getCurrentUrl();
    const title = await this.driver.getTitle();

    return {
      url,
      title,
      html: '' // We can omit HTML for performance
    };
  }

  async stop() {
    this.shouldStop = true;
    this.isExecuting = false;
  }

  async close() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }
}
