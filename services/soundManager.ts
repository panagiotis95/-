
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private fireNodes: { noise: AudioBufferSourceNode, gain: GainNode } | null = null;
  
  private settings = {
    master: true,
    fire: true,
    effects: true,
    narrator: true
  };

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateMasterVolume();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private updateMasterVolume() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.settings.master ? 1 : 0, this.ctx.currentTime, 0.05);
    }
  }

  public updateSettings(newSettings: Partial<typeof this.settings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.initCtx();
    this.updateMasterVolume();
    
    // Immediate fire sound update
    if (!this.settings.fire || !this.settings.master) {
      this.muteFireImmediate();
    } else if (this.settings.fire && this.settings.master && !this.fireNodes) {
      // If it should be playing but isn't (logic handled by component usually)
    }
  }

  private muteFireImmediate() {
    if (this.fireNodes && this.ctx) {
      const nodes = this.fireNodes;
      nodes.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        try { nodes.noise.stop(); } catch(e) {}
      }, 200);
      this.fireNodes = null;
    }
  }

  public getContext(): AudioContext | null {
    this.initCtx();
    return this.ctx;
  }

  public decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  public async decodePCMToBuffer(
    data: Uint8Array,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> {
    this.initCtx();
    if (!this.ctx) throw new Error("AudioContext not initialized");

    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = this.ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  public playClick() {
    if (!this.settings.effects || !this.settings.master) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playTruckHorn() {
    if (!this.settings.effects || !this.settings.master) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [180, 185, 90].forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.5);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  public playEngineRev() {
    if (!this.settings.effects || !this.settings.master) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + 1.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 1.5);
  }

  public playGiftOpen() {
    if (!this.settings.effects || !this.settings.master) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const frequencies = [880, 1320, 1760, 2200];
    frequencies.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + (i * 0.05));
      gain.gain.setValueAtTime(0, now + (i * 0.05));
      gain.gain.linearRampToValueAtTime(0.1, now + (i * 0.05) + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.05) + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + (i * 0.05));
      osc.stop(now + (i * 0.05) + 0.6);
    });
  }

  public playWhoosh() {
    if (!this.settings.effects || !this.settings.master) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = 4.0; 
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);
    filter.Q.value = 5;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + duration * 0.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + duration);
  }

  public startFireSound() {
    if (!this.settings.fire || !this.settings.master) return;
    this.initCtx();
    if (!this.ctx || this.fireNodes || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = 2.0;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      let val = Math.random() * 2 - 1;
      if (Math.random() > 0.9995) val *= 10;
      data[i] = val;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 1.5);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    this.fireNodes = { noise, gain };
  }

  public stopFireSound() {
    if (this.fireNodes && this.ctx) {
      const now = this.ctx.currentTime;
      const nodes = this.fireNodes;
      nodes.gain.gain.linearRampToValueAtTime(0, now + 0.8);
      setTimeout(() => { try { nodes.noise.stop(); } catch (e) {} }, 1000);
      this.fireNodes = null;
    }
  }

  public isChannelEnabled(channel: keyof typeof this.settings): boolean {
    return this.settings.master && this.settings[channel];
  }
}

export const soundManager = new SoundManager();
