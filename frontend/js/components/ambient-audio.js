/**
 * STRATOS Generative Atmospheric Audio Synthesizer
 * Uses Web Audio API to procedurally generate immersive environmental soundscapes
 * (Rainfall, Cosmic Night Drones, Solar Harmonics) with zero external audio assets.
 */

export class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentMode = 'clear-day';
    this.masterGain = null;
    this.noiseNode = null;
    this.filterNode = null;
    this.osc1 = null;
    this.osc2 = null;

    this.init();
  }

  init() {
    const toggleBtn = document.getElementById('ambient-audio-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      this.toggle();
      this.updateButtonUI(toggleBtn);
    });
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Low soothing volume
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  toggle() {
    this.ensureContext();
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    this.ensureContext();
    this.isPlaying = true;

    if (this.currentMode === 'rain' || this.currentMode === 'storm') {
      this.startRainSynth();
    } else if (this.currentMode === 'clear-night') {
      this.startCosmicDrone();
    } else {
      this.startSolarHarmonics();
    }
  }

  stop() {
    this.isPlaying = false;

    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch {}
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    if (this.osc1) {
      try { this.osc1.stop(); } catch {}
      this.osc1.disconnect();
      this.osc1 = null;
    }
    if (this.osc2) {
      try { this.osc2.stop(); } catch {}
      this.osc2.disconnect();
      this.osc2 = null;
    }
  }

  startRainSynth() {
    // Generative Pink/Brown Noise via Web Audio Buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Bandpass filter for gentle rain acoustics
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(850, this.ctx.currentTime);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.masterGain);
    this.noiseNode.start();
  }

  startCosmicDrone() {
    // Dual detuned deep oscillators for interstellar night ambiance
    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();

    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(108, this.ctx.currentTime); // A2 fundamental

    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(162, this.ctx.currentTime); // E3 perfect fifth

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.osc1.connect(filter);
    this.osc2.connect(filter);
    filter.connect(this.masterGain);

    this.osc1.start();
    this.osc2.start();
  }

  startSolarHarmonics() {
    // Gentle ethereal sun resonance
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(216, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.osc1.connect(filter);
    filter.connect(this.masterGain);
    this.osc1.start();
  }

  updateButtonUI(btn) {
    if (this.isPlaying) {
      btn.innerHTML = `
        <svg class="w-4 h-4 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        <span class="text-[11px] font-mono text-cyan-300">Sound ON</span>
      `;
      btn.classList.add('bg-cyan-500/20', 'border-cyan-500/40');
    } else {
      btn.innerHTML = `
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
        <span class="text-[11px] font-mono text-slate-400 hidden sm:inline">Ambiance</span>
      `;
      btn.classList.remove('bg-cyan-500/20', 'border-cyan-500/40');
    }
  }
}
