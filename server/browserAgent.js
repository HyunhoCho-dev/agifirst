import { chromium } from 'playwright';

export class BrowserAgent {
  constructor(groqService, ws) {
    this.groqService = groqService;
    this.ws = ws;
    this.browser = null;
    this.page = null;
    this.isExecuting = false;
    this.shouldStop = false;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true, // Production mode
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      this.page = await this.browser.newPage();

      // Set viewport
      await this.page.setViewportSize({ width: 1280, height: 720 });
    }
  }

  sendStatus(status, message, data = {}) {
    this.ws.send(JSON.stringify({
      type: status,
      message,
      ...data
    }));
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

      const systemPrompt = `You are an AI browser automation assistant. Your job is to control a web browser using Playwright commands to complete user tasks.

Available actions you can take:
1. navigate(url) - Navigate to a URL
2. click(selector) - Click an element
3. type(selector, text) - Type text into an input
4. scroll(direction) - Scroll up or down
5. screenshot() - Take a screenshot
6. extract(selector) - Extract text from elements
7. wait(seconds) - Wait for specified seconds
8. press(key) - Press a keyboard key

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
              await this.page.waitForTimeout(1000); // Wait between actions
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
        await this.page.goto(params.url, { waitUntil: 'networkidle' });
        break;

      case 'click':
        await this.page.click(params.selector);
        break;

      case 'type':
        await this.page.fill(params.selector, params.text);
        break;

      case 'scroll':
        const direction = params.direction || 'down';
        await this.page.evaluate((dir) => {
          window.scrollBy(0, dir === 'down' ? 500 : -500);
        }, direction);
        break;

      case 'screenshot':
        const screenshot = await this.page.screenshot({ encoding: 'base64' });
        this.sendStatus('screenshot', 'Screenshot taken', { screenshot });
        break;

      case 'extract':
        const elements = await this.page.$$(params.selector);
        const texts = await Promise.all(
          elements.map(el => el.textContent())
        );
        this.sendStatus('extracted', 'Text extracted', { texts });
        break;

      case 'wait':
        await this.page.waitForTimeout((params.seconds || 1) * 1000);
        break;

      case 'press':
        await this.page.keyboard.press(params.key);
        break;

      default:
        this.sendStatus('warning', `Unknown action: ${action}`);
    }
  }

  async getPageInfo() {
    return {
      url: this.page.url(),
      title: await this.page.title(),
      html: await this.page.content()
    };
  }

  async stop() {
    this.shouldStop = true;
    this.isExecuting = false;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}
