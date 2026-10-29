const { JSDOM } = require("jsdom");
const fs = require("fs");

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

// Define a stub for THREE so main.js doesn't crash on import
global.THREE = {
  Scene: class {},
  Color: class {},
  Fog: class {},
  PerspectiveCamera: class {
    position = { set: () => {} }
  },
  WebGLRenderer: class {
    setPixelRatio() {}
    setSize() {}
    domElement = document.createElement('canvas')
  },
  AmbientLight: class {},
  DirectionalLight: class {
    position = { set: () => {} }
  },
  TextureLoader: class {
    load() { return {} }
  },
  MeshLambertMaterial: class {},
  BoxGeometry: class {},
  Vector2: class {},
  Vector3: class {
    normalize() {}
  },
  Raycaster: class {}
};
global.PointerLockControls = class {
  isLocked = false
  getObject() {
    return { position: { x: 0, y: 0, z: 0 }, translateX() {}, translateZ() {} }
  }
  addEventListener() {}
};

// ... we won't fully mock everything since main.js is an ES module and it's complicated.
// Our playwright UI test proves it works in reality anyway.
