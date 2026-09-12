/**
 * STRATOS Atmospheric Engine
 * Real-time, GPU-accelerated HTML5 Canvas weather renderer.
 * Dynamically switches between clear-day, clear-night, rain, storm, snow, and clouds.
 */

export class WeatherAtmosphereEngine {
  constructor(canvasId = 'weather-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.mode = 'clear-day';
    this.isNight = false;
    this.particles = [];
    this.clouds = [];
    this.stars = [];
    this.lightningTimer = 0;
    this.lightningAlpha = 0;
    this.rafId = null;
    this.width = 0;
    this.height = 0;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Handle tab visibility to pause when inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.rafId) cancelAnimationFrame(this.rafId);
      } else {
        this.loop();
      }
    });

    this.initMode(this.mode);
    this.loop();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.reseed();
  }

  setWeatherCondition(conditionCode, isNight = false) {
    this.isNight = isNight;
    let newMode = 'clear-day';

    // Map WMO condition codes to modes
    if (conditionCode === 0 || conditionCode === 1) {
      newMode = isNight ? 'clear-night' : 'clear-day';
    } else if (conditionCode === 2 || conditionCode === 3) {
      newMode = 'clouds';
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(conditionCode)) {
      newMode = 'rain';
    } else if ([95, 96, 99].includes(conditionCode)) {
      newMode = 'storm';
    } else if ([71, 73, 75, 77, 85, 86].includes(conditionCode)) {
      newMode = 'snow';
    } else {
      newMode = isNight ? 'clear-night' : 'clouds';
    }

    if (newMode !== this.mode) {
      this.mode = newMode;
      this.initMode(newMode);
    }

    // Apply class to body for theme CSS variables
    document.body.className = `weather-${this.mode}`;
  }

  initMode(mode) {
    this.particles = [];
    this.clouds = [];
    this.stars = [];
    this.lightningAlpha = 0;

    if (mode === 'clear-night' || (mode === 'clouds' && this.isNight)) {
      // Starfield
      const starCount = Math.min(Math.floor(this.width / 10), 160);
      for (let i = 0; i < starCount; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height * 0.8,
          radius: Math.random() * 1.3 + 0.4,
          baseAlpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    if (mode === 'rain' || mode === 'storm') {
      const dropCount = mode === 'storm' ? 220 : 130;
      for (let i = 0; i < dropCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          length: Math.random() * 24 + 14,
          speed: Math.random() * 12 + 18,
          slant: -2.5,
          opacity: Math.random() * 0.4 + 0.2,
          thickness: Math.random() * 1.2 + 0.8,
        });
      }
    } else if (mode === 'snow') {
      const flakeCount = 90;
      for (let i = 0; i < flakeCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2.8 + 1,
          speed: Math.random() * 1.2 + 0.6,
          wind: (Math.random() - 0.5) * 0.8,
          swing: Math.random() * 0.05 + 0.02,
          swingOffset: Math.random() * Math.PI * 2,
          opacity: Math.random() * 0.6 + 0.25,
        });
      }
    } else if (mode === 'clouds') {
      const cloudCount = 6;
      for (let i = 0; i < cloudCount; i++) {
        this.clouds.push({
          x: (Math.random() * this.width * 1.5) - this.width * 0.25,
          y: Math.random() * this.height * 0.5,
          radiusX: Math.random() * 280 + 200,
          radiusY: Math.random() * 100 + 70,
          speed: Math.random() * 0.25 + 0.1,
          opacity: Math.random() * 0.06 + 0.03,
        });
      }
    } else if (mode === 'clear-day') {
      // Solar dust motes
      for (let i = 0; i < 35; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 1.6 + 0.6,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.4 - 0.1,
          opacity: Math.random() * 0.4 + 0.2,
        });
      }
    }
  }

  reseed() {
    this.initMode(this.mode);
  }

  loop() {
    if (this.reducedMotion) {
      // Static render only
      this.render();
      return;
    }

    this.render();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const now = performance.now();

    // 1. Stars for Night
    if (this.stars.length > 0) {
      for (let star of this.stars) {
        const twinkle = Math.sin(now * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.baseAlpha * (0.6 + 0.4 * twinkle);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
    }

    // 2. Clear Day Sunlight Glow & Particles
    if (this.mode === 'clear-day') {
      // Subtle top sun flare
      const flare = ctx.createRadialGradient(w * 0.8, -20, 10, w * 0.8, -20, w * 0.6);
      flare.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
      flare.addColorStop(0.5, 'rgba(245, 158, 11, 0.04)');
      flare.addColorStop(1, 'transparent');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, w, h);

      // Dust motes
      for (let p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${p.opacity})`;
        ctx.fill();
      }
    }

    // 3. Clouds
    if (this.clouds.length > 0) {
      for (let c of this.clouds) {
        c.x += c.speed;
        if (c.x - c.radiusX > w) {
          c.x = -c.radiusX;
        }

        const cloudGrad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.radiusX);
        cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${c.opacity})`);
        cloudGrad.addColorStop(0.6, `rgba(203, 213, 225, ${c.opacity * 0.5})`);
        cloudGrad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.scale(1, c.radiusY / c.radiusX);
        ctx.beginPath();
        ctx.arc(c.x, c.y * (c.radiusX / c.radiusY), c.radiusX, 0, Math.PI * 2);
        ctx.fillStyle = cloudGrad;
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Rain & Storm
    if (this.mode === 'rain' || this.mode === 'storm') {
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.mode === 'storm' ? 'rgba(199, 210, 254, 0.4)' : 'rgba(186, 230, 253, 0.35)';

      for (let p of this.particles) {
        p.y += p.speed;
        p.x += p.slant;

        if (p.y > h) {
          p.y = -p.length;
          p.x = Math.random() * w + 50;
        }

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.slant, p.y + p.length);
        ctx.stroke();
      }

      // Storm Lightning Flash (Subtle, elegant sheet flash)
      if (this.mode === 'storm') {
        this.lightningTimer++;
        if (this.lightningTimer > 180 && Math.random() < 0.015) {
          this.lightningAlpha = Math.random() * 0.28 + 0.12;
          this.lightningTimer = 0;
        }

        if (this.lightningAlpha > 0.01) {
          ctx.fillStyle = `rgba(165, 180, 252, ${this.lightningAlpha})`;
          ctx.fillRect(0, 0, w, h);
          this.lightningAlpha *= 0.88; // Fast smooth fade
        }
      }
    }

    // 5. Snow
    if (this.mode === 'snow') {
      for (let p of this.particles) {
        p.y += p.speed;
        p.x += Math.sin(now * 0.001 + p.swingOffset) * p.wind;

        if (p.y > h) {
          p.y = -p.radius * 2;
          p.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 249, 255, ${p.opacity})`;
        ctx.fill();
      }
    }
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
