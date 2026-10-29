const fs = require('fs');

let content = fs.readFileSync('main.js', 'utf8');

// 1. Add globals
content = content.replace(
    'let selectedBlockType = 1;',
    'let selectedBlockType = 1;\nlet uiSlots = [];\nlet previousSelectedBlockType = 1;'
);

// 2. Modify updateToolbarUI
content = content.replace(
    /function updateToolbarUI\(\) \{\s+for \(let i = 1; i <= 5; i\+\+\) \{\s+document\.getElementById\(`slot-\$\{i\}`\)\.classList\.remove\('active'\);\s+\}\s+document\.getElementById\(`slot-\$\{selectedBlockType\}`\)\.classList\.add\('active'\);\s+\}/,
    `function updateToolbarUI() {
    if (uiSlots.length === 0) return; // safeguard
    uiSlots[previousSelectedBlockType - 1].classList.remove('active');
    uiSlots[selectedBlockType - 1].classList.add('active');
    previousSelectedBlockType = selectedBlockType;
}`
);

// 3. Update init() to fetch DOM elements once
content = content.replace(
    'function init() {',
    `function init() {
    for (let i = 1; i <= 5; i++) {
        uiSlots.push(document.getElementById(\`slot-\${i}\`));
    }`
);

fs.writeFileSync('main.js', content, 'utf8');
