import * as THREE from 'three';

// Seeded random for reproducible city layout
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function createCity(scene) {
  const rand = seededRandom(42);
  const colliders = [];
  const interactiveBuildings = [];

  // --- Ground ---
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Roads ---
  createRoads(scene);

  // --- City Blocks (Regular buildings) ---
  const buildingColors = [0x2a2a4a, 0x3a3a5a, 0x252545, 0x1e1e3e, 0x333355];
  const blockSize = 40;
  const streetWidth = 16;
  const gridSpan = 3;

  for (let bx = -gridSpan; bx <= gridSpan; bx++) {
    for (let bz = -gridSpan; bz <= gridSpan; bz++) {
      // skip center block for the spawn plaza
      if (bx === 0 && bz === 0) continue;

      const blockCenterX = bx * (blockSize + streetWidth);
      const blockCenterZ = bz * (blockSize + streetWidth);

      const numBuildings = 3 + Math.floor(rand() * 4);
      for (let i = 0; i < numBuildings; i++) {
        const w = 4 + rand() * 12;
        const d = 4 + rand() * 12;
        const h = 8 + rand() * 50;
        const x = blockCenterX + (rand() - 0.5) * (blockSize - w);
        const z = blockCenterZ + (rand() - 0.5) * (blockSize - d);

        const color = buildingColors[Math.floor(rand() * buildingColors.length)];
        const building = createBuilding(x, z, w, h, d, color);
        scene.add(building);
        colliders.push(new THREE.Box3().setFromObject(building));

        // Windows
        addWindows(building, w, h, d, rand);
      }
    }
  }

  // --- Interactive Portfolio Buildings (around the center plaza) ---
  const portfolioBuildings = [
    { key: 'about', label: 'ABOUT ME', color: 0x00ff88, x: 0, z: -30, glow: 0x00ff88 },
    { key: 'projects', label: 'PROJECTS', color: 0xff8800, x: 30, z: 0, glow: 0xff8800 },
    { key: 'skills', label: 'SKILLS', color: 0x00ccff, x: 0, z: 30, glow: 0x00ccff },
    { key: 'contact', label: 'CONTACT', color: 0xff44aa, x: -30, z: 0, glow: 0xff44aa },
  ];

  portfolioBuildings.forEach((pb) => {
    const group = new THREE.Group();
    group.position.set(pb.x, 0, pb.z);

    // Building body
    const geo = new THREE.BoxGeometry(10, 18, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      emissive: pb.color,
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 9;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Glowing edges
    const edgesGeo = new THREE.EdgesGeometry(geo);
    const edgesMat = new THREE.LineBasicMaterial({ color: pb.color, transparent: true, opacity: 0.6 });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    edges.position.y = 9;
    group.add(edges);

    // Floating label
    const labelCanvas = createTextCanvas(pb.label, pb.color);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
    const labelSprite = new THREE.Sprite(labelMat);
    labelSprite.scale.set(8, 2, 1);
    labelSprite.position.y = 21;
    group.add(labelSprite);

    // Glowing ring on ground
    const ringGeo = new THREE.RingGeometry(6.5, 7.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: pb.color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);

    // Point light
    const light = new THREE.PointLight(pb.color, 2, 25);
    light.position.y = 10;
    group.add(light);

    scene.add(group);

    const box = new THREE.Box3().setFromObject(mesh);
    box.min.add(group.position);
    box.max.add(group.position);
    colliders.push(box);

    interactiveBuildings.push({
      key: pb.key,
      position: new THREE.Vector3(pb.x, 0, pb.z),
      radius: 12,
      ring,
      edges,
      light,
    });
  });

  // --- Props: Benches, street lights, trees ---
  addStreetProps(scene, colliders, rand);

  // --- Center plaza decoration ---
  createPlaza(scene);

  return { colliders, interactiveBuildings };
}

function createBuilding(x, z, w, h, d, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addWindows(building, w, h, d, rand) {
  const windowGeo = new THREE.PlaneGeometry(1.2, 1.5);
  const windowOnMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
  const windowOffMat = new THREE.MeshBasicMaterial({ color: 0x222233 });

  const floors = Math.floor(h / 4);
  const winsPerFloor = Math.max(1, Math.floor(w / 3));

  for (let f = 0; f < floors; f++) {
    for (let wi = 0; wi < winsPerFloor; wi++) {
      const mat = rand() > 0.4 ? windowOnMat : windowOffMat;
      const win = new THREE.Mesh(windowGeo, mat);
      const fx = -w / 2 + 1.5 + wi * (w / winsPerFloor);
      const fy = -h / 2 + 2 + f * 4;

      // Front face
      win.position.set(fx, fy, d / 2 + 0.01);
      building.add(win);

      // Back face
      if (rand() > 0.3) {
        const win2 = new THREE.Mesh(windowGeo, rand() > 0.4 ? windowOnMat : windowOffMat);
        win2.position.set(fx, fy, -d / 2 - 0.01);
        win2.rotation.y = Math.PI;
        building.add(win2);
      }
    }
  }
}

function createRoads(scene) {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x333340, roughness: 0.95 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffff44 });

  // Horizontal and vertical roads
  for (let i = -3; i <= 3; i++) {
    const offset = i * 56;

    // Horizontal road
    const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(500, 14), roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.set(0, 0.02, offset);
    scene.add(hRoad);

    // Center line
    for (let d = -240; d < 240; d += 10) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.3), lineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(d, 0.03, offset);
      scene.add(dash);
    }

    // Vertical road
    const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(14, 500), roadMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.set(offset, 0.02, 0);
    scene.add(vRoad);

    for (let d = -240; d < 240; d += 10) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 4), lineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(offset, 0.03, d);
      scene.add(dash);
    }
  }

  // Sidewalks
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x444455, roughness: 0.85 });
  for (let i = -3; i <= 3; i++) {
    const offset = i * 56;
    [-8, 8].forEach((side) => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(500, 0.3, 2), sidewalkMat);
      sw.position.set(0, 0.15, offset + side);
      scene.add(sw);

      const sw2 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 500), sidewalkMat);
      sw2.position.set(offset + side, 0.15, 0);
      scene.add(sw2);
    });
  }
}

function addStreetProps(scene, colliders, rand) {
  // Street lights along main roads
  const lightPositions = [];
  for (let i = -4; i <= 4; i++) {
    lightPositions.push({ x: i * 30, z: 9 });
    lightPositions.push({ x: i * 30, z: -9 });
    lightPositions.push({ x: 9, z: i * 30 });
    lightPositions.push({ x: -9, z: i * 30 });
  }

  lightPositions.forEach((pos) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    pole.position.set(pos.x, 3, pos.z);
    scene.add(pole);

    const lampHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffcc })
    );
    lampHead.position.set(pos.x, 6.2, pos.z);
    scene.add(lampHead);

    const streetLight = new THREE.PointLight(0xffffcc, 0.5, 20);
    streetLight.position.set(pos.x, 6, pos.z);
    scene.add(streetLight);
  });

  // Trees scattered
  for (let i = 0; i < 40; i++) {
    const x = (rand() - 0.5) * 300;
    const z = (rand() - 0.5) * 300;
    // Avoid placing in center area
    if (Math.abs(x) < 40 && Math.abs(z) < 40) continue;

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a3520 })
    );
    trunk.position.set(x, 1.5, z);
    scene.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(2, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x1a6630 + Math.floor(rand() * 0x002200) })
    );
    crown.position.set(x, 4.5, z);
    crown.castShadow = true;
    scene.add(crown);
  }
}

function createPlaza(scene) {
  // Circular plaza in the center
  const plazaGeo = new THREE.CircleGeometry(20, 32);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a3a,
    roughness: 0.8,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.03;
  scene.add(plaza);

  // Center fountain base
  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3.5, 1, 16),
    new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.5 })
  );
  fountainBase.position.y = 0.5;
  scene.add(fountainBase);

  // Fountain water
  const waterGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.3, 16);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0066aa,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.8,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 1.15;
  scene.add(water);

  // Fountain pillar
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x666688 })
  );
  pillar.position.y = 2.5;
  scene.add(pillar);

  // Welcome sign
  const signCanvas = createTextCanvas('PORTFOLIO CITY', 0xffffff, 512, 64, '28px');
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMat = new THREE.SpriteMaterial({ map: signTex, transparent: true });
  const sign = new THREE.Sprite(signMat);
  sign.scale.set(12, 1.5, 1);
  sign.position.set(0, 5.5, 0);
  scene.add(sign);
}

function createTextCanvas(text, color, width = 256, height = 64, fontSize = '20px') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);
  ctx.font = `bold ${fontSize} Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const hex = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;

  ctx.shadowColor = hex;
  ctx.shadowBlur = 10;
  ctx.fillStyle = hex;
  ctx.fillText(text, width / 2, height / 2);

  return canvas;
}
