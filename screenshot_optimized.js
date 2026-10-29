const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    await page.waitForTimeout(2000);

    // Check initial state
    let activeSlot1 = await page.evaluate(() => document.getElementById('slot-1').className);
    let activeSlot2 = await page.evaluate(() => document.getElementById('slot-2').className);

    if (activeSlot1 !== 'slot active' || activeSlot2 !== 'slot') {
        console.error('Initial state is wrong!');
    }

    // Press '2'
    await page.keyboard.press('Digit2');
    await page.waitForTimeout(500); // Give UI time to update

    // Check state after press
    activeSlot1 = await page.evaluate(() => document.getElementById('slot-1').className);
    activeSlot2 = await page.evaluate(() => document.getElementById('slot-2').className);

    if (activeSlot1 !== 'slot' || activeSlot2 !== 'slot active') {
        console.error('State after pressing 2 is wrong!');
        console.log(`Slot 1: ${activeSlot1}, Slot 2: ${activeSlot2}`);
    } else {
        console.log('UI state correctly updated.');
    }

    // Press '5'
    await page.keyboard.press('Digit5');
    await page.waitForTimeout(500); // Give UI time to update
    let activeSlot5 = await page.evaluate(() => document.getElementById('slot-5').className);
    if (activeSlot5 !== 'slot active') {
        console.error('State after pressing 5 is wrong!');
    } else {
        console.log('UI state correctly updated again.');
    }

    await browser.close();
})();
