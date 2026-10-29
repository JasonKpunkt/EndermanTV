const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    // Wait for the UI to render
    await page.waitForTimeout(2000);

    // Trigger keyboard 2
    await page.keyboard.press('Digit2');

    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png' });

    await browser.close();
})();
