/**
 * Web Audio API synthesizer for realistic laboratory soundscapes:
 * - Chemical bubbling & effervescence
 * - Mechanical impeller hum
 * - Heating element resonance
 */

class LabAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private bubbleTimer: any = null;

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && !this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch (e) {
        console.error('AudioContext not supported', e);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public triggerBubble(intensity: number = 50) {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch sweep mimicking water/liquid bubble surface tension pop
      const baseFreq = 400 + Math.random() * 450;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 350 + Math.random() * 200, now + 0.06);

      const vol = Math.min(0.2, (intensity / 100) * 0.15 + 0.02);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio errors safely ignored
    }
  }

  public updateBubblingLoop(bubblingSpeed: number) {
    if (this.bubbleTimer) {
      clearInterval(this.bubbleTimer);
      this.bubbleTimer = null;
    }

    if (bubblingSpeed <= 0 || this.isMuted) return;

    // Trigger bubbles at intervals inversely proportional to speed
    const interval = Math.max(70, 800 - bubblingSpeed * 7.5);
    this.bubbleTimer = setInterval(() => {
      this.triggerBubble(bubblingSpeed);
      if (Math.random() > 0.4) {
        setTimeout(() => this.triggerBubble(bubblingSpeed), Math.random() * 50);
      }
    }, interval);
  }

  public stopAll() {
    if (this.bubbleTimer) {
      clearInterval(this.bubbleTimer);
      this.bubbleTimer = null;
    }
  }
}

export const labAudio = new LabAudioSynthesizer();
