export class Minimap {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 160;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.scale = 0.5; // pixels per world unit
  }

  update(playerPos, interactiveBuildings) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, w, h);

    // Draw roads
    ctx.strokeStyle = 'rgba(80, 80, 100, 0.5)';
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      const offset = i * 56 * this.scale;
      // Horizontal
      const hy = cy - playerPos.z * this.scale + offset;
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(w, hy);
      ctx.stroke();
      // Vertical
      const vx = cx - playerPos.x * this.scale + offset;
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx, h);
      ctx.stroke();
    }

    // Draw interactive buildings
    interactiveBuildings.forEach((b) => {
      const bx = cx + (b.position.x - playerPos.x) * this.scale;
      const by = cy + (b.position.z - playerPos.z) * this.scale;
      if (bx >= -5 && bx <= w + 5 && by >= -5 && by <= h + 5) {
        const colors = { about: '#00ff88', projects: '#ff8800', skills: '#00ccff', contact: '#ff44aa' };
        ctx.fillStyle = colors[b.key] || '#fff';
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Player dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Player direction indicator
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 8);
    ctx.stroke();

    // Border
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);
  }
}
