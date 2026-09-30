/**
 * Real-time Web Audio API engine sound and mechanical sound synthesizer
 * Zero external assets needed, zero CORS issues, instant reactive audio.
 */

class SupercarAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;

  // Engine oscillators
  private oscLow: OscillatorNode | null = null;
  private oscMid: OscillatorNode | null = null;
  private oscHigh: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  // Sound state
  private currentRpm: number = 800; // Idle RPM
  private targetRpm: number = 800;
  private isMuted: boolean = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  public startEngine() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isRunning) return;

    const t = this.ctx.currentTime;

    // Engine filter to shape the throatiness of V12
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(450, t);
    this.filter.Q.setValueAtTime(3.5, t);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.01, t);
    this.engineGain.gain.exponentialRampToValueAtTime(0.28, t + 0.3);

    // V12 fundamental harmonics
    this.oscSub = this.ctx.createOscillator();
    this.oscSub.type = 'sawtooth';
    this.oscSub.frequency.setValueAtTime(35, t);

    this.oscLow = this.ctx.createOscillator();
    this.oscLow.type = 'triangle';
    this.oscLow.frequency.setValueAtTime(70, t);

    this.oscMid = this.ctx.createOscillator();
    this.oscMid.type = 'sawtooth';
    this.oscMid.frequency.setValueAtTime(140, t);

    this.oscHigh = this.ctx.createOscillator();
    this.oscHigh.type = 'sawtooth';
    this.oscHigh.frequency.setValueAtTime(210, t);

    // Mix nodes
    this.oscSub.connect(this.filter);
    this.oscLow.connect(this.filter);
    this.oscMid.connect(this.filter);
    this.oscHigh.connect(this.filter);
    this.filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.oscSub.start(t);
    this.oscLow.start(t);
    this.oscMid.start(t);
    this.oscHigh.start(t);

    this.isRunning = true;
    this.playStartupRev();
  }

  public stopEngine() {
    if (!this.isRunning || !this.ctx || !this.engineGain) return;
    const t = this.ctx.currentTime;
    this.engineGain.gain.setValueAtTime(this.engineGain.gain.value, t);
    this.engineGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    setTimeout(() => {
      try {
        this.oscSub?.stop();
        this.oscLow?.stop();
        this.oscMid?.stop();
        this.oscHigh?.stop();
        this.oscSub?.disconnect();
        this.oscLow?.disconnect();
        this.oscMid?.disconnect();
        this.oscHigh?.disconnect();
      } catch {
        // cleanup ignore
      }
      this.isRunning = false;
    }, 550);
  }

  public setRpm(rpm: number) {
    this.targetRpm = Math.max(800, Math.min(8500, rpm));
    if (!this.isRunning || !this.ctx) return;

    // Smooth lerp
    this.currentRpm += (this.targetRpm - this.currentRpm) * 0.25;
    const t = this.ctx.currentTime;

    // V12 firing frequency: (RPM / 60) * (12 / 2) = RPM * 0.1
    const baseFreq = (this.currentRpm / 60) * 6;

    this.oscSub?.frequency.setValueAtTime(Math.max(20, baseFreq * 0.5), t);
    this.oscLow?.frequency.setValueAtTime(baseFreq, t);
    this.oscMid?.frequency.setValueAtTime(baseFreq * 2, t);
    this.oscHigh?.frequency.setValueAtTime(baseFreq * 3, t);

    // Open filter cutoff as RPM increases
    const filterFreq = 300 + (this.currentRpm / 8500) * 2200;
    this.filter?.frequency.setValueAtTime(filterFreq, t);
  }

  public revEngine(targetRpm: number = 7000) {
    if (!this.isRunning) {
      this.startEngine();
    }
    const peakRpm = targetRpm;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < 12) {
        this.setRpm(800 + (peakRpm - 800) * (step / 12));
      } else if (step < 26) {
        const falloff = 1 - (step - 12) / 14;
        this.setRpm(800 + (peakRpm - 800) * falloff);
      } else {
        this.setRpm(800);
        this.playExhaustPop();
        clearInterval(interval);
      }
    }, 30);
  }

  public playStartupRev() {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < 8) {
        this.setRpm(800 + 3800 * (step / 8));
      } else if (step < 20) {
        this.setRpm(800 + 3800 * (1 - (step - 8) / 12));
      } else {
        this.setRpm(800);
        clearInterval(interval);
      }
    }, 40);
  }

  public playExhaustPop() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // White noise burst for backfire / exhaust pop
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const popFilter = this.ctx.createBiquadFilter();
      popFilter.type = 'bandpass';
      popFilter.frequency.setValueAtTime(320, t);
      popFilter.Q.setValueAtTime(1.5, t);

      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(0.4, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      noise.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(this.masterGain);

      noise.start(t);
    } catch {
      // ignore
    }
  }

  public playScissorDoorSound() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Pneumatic / hydraulic scissor hinge whoosh
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const audioEngine = new SupercarAudioEngine();
