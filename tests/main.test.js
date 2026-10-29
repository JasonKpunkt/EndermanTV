const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

const code = fs.readFileSync('./main.js', 'utf8');

// Strip out imports and setup exports, avoiding the execution of main logic
const modifiedCode = code
    .replace(/import .* from .*/g, '') // Remove imports
    .replace(/init\(\);/g, '') // Remove init call
    .replace(/animate\(\);/g, '') // Remove animate call
    + `
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkCollision,
        blockMap,
        getBlockAt
    };
}
`;

fs.writeFileSync('./main_test_temp.js', modifiedCode);

// Mock browser globals
global.window = { innerWidth: 800, innerHeight: 600, addEventListener: () => {} };
global.document = {
    getElementById: () => ({ addEventListener: () => {}, requestPointerLock: () => {}, style: {} }),
    addEventListener: () => {},
    body: { appendChild: () => {} }
};
global.requestAnimationFrame = () => {};
global.performance = { now: () => 0 };

global.THREE = {
    Scene: class {},
    PerspectiveCamera: class { position = {set: () => {}} },
    WebGLRenderer: class { setSize() {} setPixelRatio() {} setClearColor() {} render() {} domElement = {} },
    TextureLoader: class { load() { return {}; } },
    MeshLambertMaterial: class {},
    BoxGeometry: class {},
    InstancedMesh: class { setMatrixAt() {} instanceMatrix = { setUsage: () => {} } },
    Vector3: class { constructor(x, y, z) { this.x=x; this.y=y; this.z=z; } },
    Object3D: class { updateMatrix() {} },
    Clock: class {},
    Color: class {},
    DirectionalLight: class { position = new global.THREE.Vector3() },
    AmbientLight: class {},
    Fog: class {}
};

global.PointerLockControls = class {
    constructor() { this.isLocked = false; }
    getObject() { return { position: new global.THREE.Vector3(), translateX: () => {}, translateZ: () => {} }; }
};

global.noise = { seed: () => {}, perlin3: () => 0 };

const { checkCollision, blockMap, getBlockAt } = require('../main_test_temp.js');

test('checkCollision', (t) => {
    // Clear the map
    blockMap.clear();

    // No collision
    assert.strictEqual(checkCollision({ x: 0, y: 10, z: 0 }, 0.5, 1.8), false);

    // Add a block at player's foot
    blockMap.set('0,9,0', true);
    assert.strictEqual(checkCollision({ x: 0, y: 10, z: 0 }, 0.5, 1.8), true);

    blockMap.clear();

    // Collision on edge
    blockMap.set('1,10,0', true); // x=1
    assert.strictEqual(checkCollision({ x: 0.6, y: 10, z: 0 }, 0.5, 1.8), true);

    // No collision just outside edge
    assert.strictEqual(checkCollision({ x: 0.4, y: 10, z: 0 }, 0.5, 1.8), false);
});
