import * as THREE from 'three';
import { createCity } from './city.js';
import { Character } from './character.js';
import { Minimap } from './minimap.js';
import { portfolioData } from './portfolio-data.js';

// ─── DOM Elements ───
const canvas = document.getElementById('game-canvas');
const loadingScreen = document.getElementById('loading-screen');
const instructionsOverlay = document.getElementById('instructions-overlay');
const startBtn = document.getElementById('start-btn');
const hud = document.getElementById('hud');
const staminaBar = document.getElementById('stamina-bar');
const locationName = document.getElementById('location-name');
const interactionPrompt = document.getElementById('interaction-prompt');
const portfolioPanel = document.getElementById('portfolio-panel');
const panelContent = document.getElementById('panel-content');
const closePanel = document.getElementById('close-panel');
const crosshair = document.getElementById('crosshair');

// Hide crosshair for top-down view
crosshair.classList.add('hidden');

// ─── Renderer ───
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// ─── Scene ───
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.004);
scene.background = new THREE.Color(0x0a0a1a);

// ─── Camera (Orthographic top-down) ───
let zoomLevel = 40; // world units visible vertically / 2
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -zoomLevel * aspect, zoomLevel * aspect,
  zoomLevel, -zoomLevel,
  0.1, 500
);
// Slight angle tilt for that classic top-down-with-depth feel
camera.position.set(0, 120, 40);
camera.lookAt(0, 0, 0);

// ─── Lighting ───
// Ambient
const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
scene.add(ambientLight);

// Moon / Directional
const dirLight = new THREE.DirectionalLight(0x8888cc, 0.8);
dirLight.position.set(50, 80, 30);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 200;
dirLight.shadow.camera.left = -80;
dirLight.shadow.camera.right = 80;
dirLight.shadow.camera.top = 80;
dirLight.shadow.camera.bottom = -80;
scene.add(dirLight);

// Hemisphere light for sky-ground color blend
const hemiLight = new THREE.HemisphereLight(0x4466aa, 0x223322, 0.3);
scene.add(hemiLight);

// ─── Skybox (procedural gradient) ───
const skyGeo = new THREE.SphereGeometry(250, 32, 32);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    topColor: { value: new THREE.Color(0x0a0a2e) },
    bottomColor: { value: new THREE.Color(0x1a1a3e) },
    offset: { value: 20 },
    exponent: { value: 0.4 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
    }
  `,
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// Stars
const starsGeo = new THREE.BufferGeometry();
const starPositions = [];
for (let i = 0; i < 2000; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  const r = 240;
  starPositions.push(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}
starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true });
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

// ─── City & Character ───
const { colliders, interactiveBuildings } = createCity(scene);
const character = new Character(scene);

// ─── Minimap ───
const minimapContainer = document.getElementById('minimap');
const minimap = new Minimap(minimapContainer);

// ─── Input State ───
const keys = {};
let panelOpen = false;
let nearBuilding = null;
let gameStarted = false;

// ─── Input Handlers ───
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyE' && nearBuilding && !panelOpen) {
    openPanel(nearBuilding.key);
  }
  if (e.code === 'Escape' && panelOpen) {
    closePortfolioPanel();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Scroll to zoom in/out
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomLevel += e.deltaY * 0.03;
  zoomLevel = Math.max(15, Math.min(80, zoomLevel));
  updateCameraFrustum();
}, { passive: false });

function updateCameraFrustum() {
  const a = window.innerWidth / window.innerHeight;
  camera.left = -zoomLevel * a;
  camera.right = zoomLevel * a;
  camera.top = zoomLevel;
  camera.bottom = -zoomLevel;
  camera.updateProjectionMatrix();
}

closePanel.addEventListener('click', closePortfolioPanel);

// ─── Portfolio Panel ───
function openPanel(key) {
  const data = portfolioData[key];
  if (!data) return;
  panelContent.innerHTML = data.content;
  portfolioPanel.classList.remove('hidden');
  panelOpen = true;
}

function closePortfolioPanel() {
  portfolioPanel.classList.add('hidden');
  panelOpen = false;
}

// ─── Movement & Collision ───
const moveDir = new THREE.Vector3();
const playerBox = new THREE.Box3();

function getPlayerBox(pos) {
  playerBox.min.set(pos.x - 0.4, pos.y, pos.z - 0.4);
  playerBox.max.set(pos.x + 0.4, pos.y + 1.8, pos.z + 0.4);
  return playerBox;
}

function checkCollision(pos) {
  const box = getPlayerBox(pos);
  for (const collider of colliders) {
    if (box.intersectsBox(collider)) return true;
  }
  return false;
}

function updateMovement(delta) {
  if (panelOpen) return;

  const sprint = (keys['ShiftLeft'] || keys['ShiftRight']) && character.stamina > 0;
  const speed = sprint ? 14 : 7;

  moveDir.set(0, 0, 0);
  // Top-down: W=up(-Z), S=down(+Z), A=left(-X), D=right(+X)
  if (keys['KeyW'] || keys['ArrowUp']) moveDir.z -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) moveDir.z += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) moveDir.x -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveDir.x += 1;

  const isMoving = moveDir.lengthSq() > 0;
  if (isMoving) {
    moveDir.normalize();

    const pos = character.getPosition();
    const newX = pos.x + moveDir.x * speed * delta;
    const newZ = pos.z + moveDir.z * speed * delta;

    // Try full move
    const testPos = new THREE.Vector3(newX, pos.y, newZ);
    if (!checkCollision(testPos)) {
      pos.x = newX;
      pos.z = newZ;
    } else {
      // Try sliding along X
      const testX = new THREE.Vector3(newX, pos.y, pos.z);
      if (!checkCollision(testX)) {
        pos.x = newX;
      }
      // Try sliding along Z
      const testZ = new THREE.Vector3(pos.x, pos.y, newZ);
      if (!checkCollision(testZ)) {
        pos.z = newZ;
      }
    }

    // Face movement direction
    character.setRotation(Math.atan2(moveDir.x, moveDir.z));
  }

  if (keys['Space']) {
    character.jump();
  }

  character.update(delta, isMoving, sprint);

  // Update stamina bar
  staminaBar.style.width = character.stamina + '%';
}

// ─── Camera Follow (Top-Down) ───
const cameraOffset = new THREE.Vector3(0, 120, 40); // slight Z offset for angled view
const cameraTarget = new THREE.Vector3();

function updateCamera() {
  const pos = character.getPosition();
  cameraTarget.set(pos.x + cameraOffset.x, cameraOffset.y, pos.z + cameraOffset.z);
  camera.position.lerp(cameraTarget, 0.08);
  camera.lookAt(pos.x, 0, pos.z);
}

// ─── Proximity Check ───
function checkProximity() {
  if (panelOpen) return;

  const pos = character.getPosition();
  nearBuilding = null;

  for (const b of interactiveBuildings) {
    const dist = pos.distanceTo(b.position);
    if (dist < b.radius) {
      nearBuilding = b;
      break;
    }
  }

  if (nearBuilding) {
    interactionPrompt.classList.remove('hidden');
    const areaNames = { about: 'About District', projects: 'Projects Avenue', skills: 'Skills Boulevard', contact: 'Contact Plaza' };
    locationName.textContent = areaNames[nearBuilding.key] || 'Downtown';
  } else {
    interactionPrompt.classList.add('hidden');
    locationName.textContent = 'Downtown';
  }
}

// ─── Animate Interactive Buildings ───
function animateBuildings(time) {
  interactiveBuildings.forEach((b) => {
    const pulse = Math.sin(time * 2 + interactiveBuildings.indexOf(b)) * 0.5 + 0.5;
    b.ring.material.opacity = 0.2 + pulse * 0.3;
    b.light.intensity = 1.5 + pulse;
  });
}

// ─── Particle Effects ───
const particlesGeo = new THREE.BufferGeometry();
const particleCount = 100;
const particlePositions = new Float32Array(particleCount * 3);
const particleSpeeds = [];
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 60;
  particlePositions[i * 3 + 1] = Math.random() * 30;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  particleSpeeds.push(0.2 + Math.random() * 0.5);
}
particlesGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
const particlesMat = new THREE.PointsMaterial({
  color: 0x00ff88,
  size: 0.15,
  transparent: true,
  opacity: 0.4,
  sizeAttenuation: true,
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

function updateParticles(delta) {
  const positions = particles.geometry.attributes.position.array;
  const playerPos = character.getPosition();
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += particleSpeeds[i] * delta;
    if (positions[i * 3 + 1] > 30) {
      positions[i * 3] = playerPos.x + (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 60;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;
}

// ─── Resize Handler ───
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraFrustum();
});

// ─── Game Loop ───
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  updateMovement(delta);
  updateCamera();
  checkProximity();
  animateBuildings(elapsed);
  updateParticles(delta);

  // Slowly rotate stars
  stars.rotation.y += delta * 0.005;

  // Update minimap
  minimap.update(character.getPosition(), interactiveBuildings);

  renderer.render(scene, camera);
}

// ─── Start ───
function init() {
  // Simulate loading
  setTimeout(() => {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 800);
  }, 1500);

  startBtn.addEventListener('click', () => {
    instructionsOverlay.classList.add('hidden');
    gameStarted = true;
  });

  animate();
}

init();
