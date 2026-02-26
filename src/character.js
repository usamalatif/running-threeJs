import * as THREE from 'three';

export class Character {
  constructor(scene) {
    this.group = new THREE.Group();
    this.animTime = 0;
    this.isRunning = false;
    this.isSprinting = false;
    this.velocity = new THREE.Vector3();
    this.onGround = true;
    this.jumpVelocity = 0;
    this.height = 1.8;
    this.stamina = 100;

    // Body parts
    this._buildBody();

    this.group.position.set(0, 0, 15);
    scene.add(this.group);
  }

  _buildBody() {
    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 0.9, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x2255cc });
    this.torso = new THREE.Mesh(torsoGeo, torsoMat);
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 1.82;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x332211 });
    this.hair = new THREE.Mesh(hairGeo, hairMat);
    this.hair.position.y = 1.85;
    this.group.add(this.hair);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x2255cc });

    this.leftArm = new THREE.Mesh(armGeo, armMat);
    this.leftArm.position.set(-0.5, 1.15, 0);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, armMat);
    this.rightArm.position.set(0.5, 1.15, 0);
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333355 });

    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.2, 0.45, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.2, 0.45, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.25, 0.15, 0.35);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    this.leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    this.leftShoe.position.set(-0.2, 0.08, 0.05);
    this.group.add(this.leftShoe);

    this.rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    this.rightShoe.position.set(0.2, 0.08, 0.05);
    this.group.add(this.rightShoe);

    // Shadow under character
    const shadowGeo = new THREE.CircleGeometry(0.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02;
    this.group.add(this.shadow);
  }

  update(delta, isMoving, isSprinting) {
    this.isRunning = isMoving;
    this.isSprinting = isSprinting;

    // Stamina management
    if (isSprinting && isMoving) {
      this.stamina = Math.max(0, this.stamina - 30 * delta);
    } else {
      this.stamina = Math.min(100, this.stamina + 15 * delta);
    }

    // Gravity & jumping
    if (!this.onGround) {
      this.jumpVelocity -= 20 * delta;
      this.group.position.y += this.jumpVelocity * delta;
      if (this.group.position.y <= 0) {
        this.group.position.y = 0;
        this.onGround = true;
        this.jumpVelocity = 0;
      }
    }

    // Animation
    if (isMoving) {
      const speed = isSprinting ? 12 : 7;
      this.animTime += delta * speed;
      const swing = Math.sin(this.animTime);
      const bigSwing = Math.sin(this.animTime) * (isSprinting ? 1.2 : 0.7);

      // Arms swing opposite to legs
      this.leftArm.rotation.x = bigSwing;
      this.rightArm.rotation.x = -bigSwing;

      // Legs
      this.leftLeg.rotation.x = -bigSwing;
      this.rightLeg.rotation.x = bigSwing;

      // Shoes follow legs
      this.leftShoe.position.z = 0.05 + Math.sin(this.animTime) * 0.15;
      this.rightShoe.position.z = 0.05 - Math.sin(this.animTime) * 0.15;

      // Slight torso bob
      this.torso.position.y = 1.15 + Math.abs(Math.sin(this.animTime * 2)) * 0.05;
      this.head.position.y = 1.82 + Math.abs(Math.sin(this.animTime * 2)) * 0.05;
      this.hair.position.y = 1.85 + Math.abs(Math.sin(this.animTime * 2)) * 0.05;

      // Slight torso lean forward when sprinting
      this.torso.rotation.x = isSprinting ? 0.15 : 0.05;
    } else {
      // Idle animation - subtle breathing
      this.animTime += delta * 2;
      const breathe = Math.sin(this.animTime) * 0.02;

      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.torso.rotation.x = 0;
      this.torso.position.y = 1.15 + breathe;
      this.head.position.y = 1.82 + breathe;
      this.hair.position.y = 1.85 + breathe;
      this.leftShoe.position.z = 0.05;
      this.rightShoe.position.z = 0.05;
    }

    // Update shadow scale based on height
    const heightAboveGround = this.group.position.y;
    const shadowScale = Math.max(0.3, 1 - heightAboveGround * 0.05);
    this.shadow.scale.set(shadowScale, shadowScale, shadowScale);
    this.shadow.material.opacity = 0.3 * shadowScale;
    this.shadow.position.y = -heightAboveGround + 0.02;
  }

  jump() {
    if (this.onGround) {
      this.onGround = false;
      this.jumpVelocity = 8;
    }
  }

  getPosition() {
    return this.group.position;
  }

  setRotation(y) {
    this.group.rotation.y = y;
  }
}
