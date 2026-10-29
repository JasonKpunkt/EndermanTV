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
function updateToolbarUI() {
    slots[previousSelectedBlockType - 1].classList.remove('active');
    slots[selectedBlockType - 1].classList.add('active');
    previousSelectedBlockType = selectedBlockType;
}

// Warmup
for (let i = 0; i < 1000; i++) {
    selectedBlockType = (i % 5) + 1;
    updateToolbarUI();
}

const start = performance.now();
for (let i = 0; i < 100000; i++) {
    selectedBlockType = (i % 5) + 1;
    updateToolbarUI();
}
const end = performance.now();

console.log(`Optimized time 3: ${end - start} ms`);
