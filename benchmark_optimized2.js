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
let activeSlot = null;

function initUI() {
    activeSlot = document.getElementById(`slot-1`);
}
initUI();

function updateToolbarUI() {
    if (activeSlot) {
        activeSlot.classList.remove('active');
    }
    activeSlot = document.getElementById(`slot-${selectedBlockType}`);
    if (activeSlot) {
        activeSlot.classList.add('active');
    }
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

console.log(`Optimized time 2: ${end - start} ms`);
