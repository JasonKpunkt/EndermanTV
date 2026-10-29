const fs = require('fs');

let content = fs.readFileSync('main.js', 'utf8');

// Update updateToolbarUI to include the early return check
content = content.replace(
    /function updateToolbarUI\(\) \{[\s\S]*?previousSelectedBlockType = selectedBlockType;\n\}/,
    `function updateToolbarUI() {
    if (uiSlots.length === 0 || selectedBlockType === previousSelectedBlockType) return;
    uiSlots[previousSelectedBlockType - 1].classList.remove('active');
    uiSlots[selectedBlockType - 1].classList.add('active');
    previousSelectedBlockType = selectedBlockType;
}`
);

fs.writeFileSync('main.js', content, 'utf8');
