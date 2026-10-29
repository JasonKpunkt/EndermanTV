const { JSDOM } = require("jsdom");

const html = `
<div id="ui">
    <div id="toolbar">
        <div class="slot active" id="slot-1"></div>
        <div class="slot" id="slot-2"></div>
        <div class="slot" id="slot-3"></div>
        <div class="slot" id="slot-4"></div>
        <div class="slot" id="slot-5"></div>
    </div>
</div>
`;
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window;

let selectedBlockType = 1;
let slots = [];
function initUI() {
    for (let i = 1; i <= 5; i++) {
        slots.push(document.getElementById(`slot-${i}`));
    }
}
initUI();

let previousSelectedBlockType = 1;

// The "better" version
function updateToolbarUIBetter() {
    if (selectedBlockType === previousSelectedBlockType) return;
    slots[previousSelectedBlockType - 1].classList.remove('active');
    slots[selectedBlockType - 1].classList.add('active');
    previousSelectedBlockType = selectedBlockType;
}

// Current "optimized" version
function updateToolbarUICurrent() {
    slots[previousSelectedBlockType - 1].classList.remove('active');
    slots[selectedBlockType - 1].classList.add('active');
    previousSelectedBlockType = selectedBlockType;
}


function runBenchmark(name, fn) {
    // Warmup
    for (let i = 0; i < 1000; i++) {
        // Simulate pressing 1, 2, 2, 2, 2, 3, etc. (mostly repeating)
        selectedBlockType = Math.floor(i / 5) % 5 + 1;
        fn();
    }

    const start = performance.now();
    for (let i = 0; i < 1000000; i++) {
        selectedBlockType = Math.floor(i / 5) % 5 + 1;
        fn();
    }
    const end = performance.now();
    console.log(`${name}: ${end - start} ms`);
}

runBenchmark('Current Optimized', updateToolbarUICurrent);
runBenchmark('Better Optimized (with early return)', updateToolbarUIBetter);
