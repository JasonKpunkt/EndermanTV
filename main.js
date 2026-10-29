import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- Global Variables ---
let camera, scene, renderer, controls;
let objects = [];
const blockMap = new Map(); // Store blocks by coordinate "x,y,z"

// Physics & Movement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const playerSpeed = 10.0; // Movement speed
const jumpForce = 12.0;
const gravity = 30.0;

// Player dimensions for AABB collision
const playerRadius = 0.3;
const playerHeight = 1.6;

// Terrain parameters
const worldSize = 64; // Increased world size for better exploration
const blockSize = 1;

// Block Placement/Breaking & Textures
let raycaster;
let dirtMaterial, grassMaterial, stoneMaterial, woodMaterial, sandMaterial, glassMaterial;

// 1: Dirt, 2: Stone, 3: Wood, 4: Sand, 5: Glass
let selectedBlockType = 1;

if (typeof process === "undefined" || process.env.NODE_ENV !== "test") { init(); animate(); }


function loadTextures() {
    const textureLoader = new THREE.TextureLoader();

    const dirtTexture = textureLoader.load('textures/dirt.png');
    dirtTexture.magFilter = THREE.NearestFilter; // For pixelated look

    const grassTopTexture = textureLoader.load('textures/grass.png');
    grassTopTexture.magFilter = THREE.NearestFilter;

    dirtMaterial = new THREE.MeshLambertMaterial({ map: dirtTexture });

    // Procedural colors for new blocks since we don't have textures
    stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
    woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B5A2B }); // Brown
    sandMaterial = new THREE.MeshLambertMaterial({ color: 0xEEDC82 }); // Yellowish
    glassMaterial = new THREE.MeshLambertMaterial({
        color: 0xADD8E6,
        transparent: true,
        opacity: 0.5
    }); // Light blue transparent

    // Grass block has different textures on top vs sides
    grassMaterial = [
        dirtMaterial, // right
        dirtMaterial, // left
        new THREE.MeshLambertMaterial({ map: grassTopTexture }), // top
        dirtMaterial, // bottom
        dirtMaterial, // front
        dirtMaterial  // back
    ];
}

function updateToolbarUI() {
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`slot-${i}`).classList.remove('active');
    }
    document.getElementById(`slot-${selectedBlockType}`).classList.add('active');
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xeeeeee, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(100, 200, 50);
    scene.add(directionalLight);

    loadTextures();
    generateTerrain();
    setupControls();

    // Setup Raycaster for Block Interaction
    raycaster = new THREE.Raycaster();
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    window.addEventListener('resize', onWindowResize);
}

function onDocumentMouseDown(event) {
    if (!controls.isLocked) return;

    // Raycast from center of screen
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (intersect.distance > 5) return;

        if (event.button === 0) {
            // Left Click: Break Block
            if (intersect.object !== scene) {
                const pos = intersect.object.position;
                const key = `${pos.x},${pos.y},${pos.z}`;
                blockMap.delete(key);

                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
            }
        } else if (event.button === 2) {
            // Right Click: Place Block
            let materialToPlace;
            switch(selectedBlockType) {
                case 1: materialToPlace = dirtMaterial; break;
                case 2: materialToPlace = stoneMaterial; break;
                case 3: materialToPlace = woodMaterial; break;
                case 4: materialToPlace = sandMaterial; break;
                case 5: materialToPlace = glassMaterial; break;
                default: materialToPlace = dirtMaterial;
            }

            const voxelGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
            const voxel = new THREE.Mesh(voxelGeometry, materialToPlace);

            voxel.position.copy(intersect.point).add(intersect.face.normal.clone().multiplyScalar(0.5));
            voxel.position.round();

            const key = `${voxel.position.x},${voxel.position.y},${voxel.position.z}`;
            if (!blockMap.has(key)) {
                blockMap.set(key, voxel);
                scene.add(voxel);
                objects.push(voxel);
            }
        }
    }
}

function setupControls() {
    controls = new PointerLockControls(camera, document.body);

    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        instructions.style.display = 'flex';
    });

    scene.add(controls.getObject());

    const onKeyDown = function (event) {
        switch (event.code) {
            case 'Digit1': selectedBlockType = 1; updateToolbarUI(); break;
            case 'Digit2': selectedBlockType = 2; updateToolbarUI(); break;
            case 'Digit3': selectedBlockType = 3; updateToolbarUI(); break;
            case 'Digit4': selectedBlockType = 4; updateToolbarUI(); break;
            case 'Digit5': selectedBlockType = 5; updateToolbarUI(); break;
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
            case 'Space':
                if (canJump === true) velocity.y += jumpForce;
                canJump = false;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function generateTerrain() {
    const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

    // Initialize Perlin noise
    noise.seed(Math.random());

    for (let x = -worldSize / 2; x < worldSize / 2; x++) {
        for (let z = -worldSize / 2; z < worldSize / 2; z++) {
            // Generate height using Perlin noise
            // Multiply by scalar to increase hills/valleys
            let heightValue = noise.perlin2(x / 20, z / 20);
            let height = Math.floor(heightValue * 10);

            // Create terrain column down to y = -5
            for (let y = -5; y <= height; y++) {
                // Top block is grass, underneath is dirt
                const material = (y === height) ? grassMaterial : dirtMaterial;
                const block = new THREE.Mesh(geometry, material);
                block.position.set(x, y, z);

                const key = `${x},${y},${z}`;
                blockMap.set(key, block);

                scene.add(block);
                objects.push(block);
            }
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Helper function to check if a block exists at world coordinates
function getBlockAt(x, y, z) {
    return blockMap.has(`${Math.round(x)},${Math.round(y)},${Math.round(z)}`);
}

// AABB Collision detection against terrain
function checkCollision(pos, radius, height) {
    // Check points around the player's bounding box
    const minX = Math.floor(pos.x - radius);
    const maxX = Math.floor(pos.x + radius);
    const minZ = Math.floor(pos.z - radius);
    const maxZ = Math.floor(pos.z + radius);
    const minY = Math.floor(pos.y - height); // Camera is at top of player
    const maxY = Math.floor(pos.y);

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                if (getBlockAt(x, y, z)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function updatePhysics() {
    const time = performance.now();

    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;
        const player = controls.getObject();
        const pos = player.position;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= gravity * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * playerSpeed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * playerSpeed * delta;

        // Apply Horizontal Movement & Check Collision
        const originalX = pos.x;
        const originalZ = pos.z;

        // Move X
        player.translateX(velocity.x * delta);
        if (checkCollision(pos, playerRadius, playerHeight)) {
            pos.x = originalX;
            velocity.x = 0;
        }

        // Move Z (forward/backward)
        // Re-apply velocity to move relative to camera direction
        player.translateZ(velocity.z * delta);
        if (checkCollision(pos, playerRadius, playerHeight)) {
            pos.z = originalZ;
            velocity.z = 0;
        }

        // Apply Vertical Movement & Check Collision
        const originalY = pos.y;
        pos.y += velocity.y * delta;

        if (checkCollision(pos, playerRadius, playerHeight)) {
            pos.y = originalY;
            if (velocity.y < 0) {
                // Landed on ground
                canJump = true;

                // Snap exactly to top of block below (blocks are centered at integer coordinates, so top is +0.5)
                pos.y = Math.floor(pos.y - playerHeight) + 0.5 + playerHeight;
            }
            velocity.y = 0;
        }

        if (pos.y < -20) {
            velocity.y = 0;
            pos.y = 20;
            pos.x = 0;
            pos.z = 0;
        }
    }

    prevTime = time;
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    renderer.render(scene, camera);
}
export { getBlockAt, blockMap };
