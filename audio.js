/**
 * EcoPolis: Web Audio API Synthesizer (Bulletproof version)
 * Generates all game sound effects dynamically with robust fallback handling.
 */

const GameAudio = (() => {
  let isMuted = false;
  let audioCtx = null;

  // Initialize AudioContext lazily on user interaction
  function getAudioContext() {
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          console.warn("Web Audio API is not supported in this browser.");
          return null;
        }
        audioCtx = new AudioContextClass();
      }
      
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(err => {
          console.warn("Could not resume AudioContext:", err);
        });
      }
      return audioCtx;
    } catch (e) {
      console.warn("Failed to initialize AudioContext:", e);
      return null;
    }
  }

  // Create a gain node with custom envelope
  function playTone(freq, type, duration, startTimeOffset = 0, volume = 0.1, stopType = 'exponential') {
    if (isMuted) return null;
    try {
      const ctx = getAudioContext();
      if (!ctx) return null;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime + startTimeOffset);
      if (stopType === 'exponential') {
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTimeOffset + duration);
      } else {
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTimeOffset + duration);
      }

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + startTimeOffset);
      osc.stop(ctx.currentTime + startTimeOffset + duration);
      return osc;
    } catch (e) {
      console.warn("Sound playback failed:", e);
      return null;
    }
  }

  return {
    toggleMute() {
      isMuted = !isMuted;
      return isMuted;
    },
    
    getMuted() {
      return isMuted;
    },

    // Play dice roll clicks
    playDiceRoll() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        
        let delay = 0;
        for (let i = 0; i < 7; i++) {
          const pitch = 150 + Math.random() * 100;
          playTone(pitch, 'triangle', 0.08, delay, 0.08, 'linear');
          delay += 0.06 + (i * 0.03); // getting slower
        }
      } catch (e) {
        console.warn("Dice sound failed:", e);
      }
    },

    // Play buying success chord (upward green arpeggio)
    playPurchase() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, index) => {
          playTone(freq, 'sine', 0.35, index * 0.08, 0.08);
        });
      } catch (e) {
        console.warn("Purchase sound failed:", e);
      }
    },

    // Play correct answer sound (cheerful double chime)
    playCorrect() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, index) => {
          playTone(freq, 'sine', 0.4, index * 0.08, 0.08);
        });
      } catch (e) {
        console.warn("Correct answer sound failed:", e);
      }
    },

    // Play incorrect buzzer (sad detuned low tone)
    playIncorrect() {
      if (isMuted) return;
      try {
        const c = getAudioContext();
        if (!c) return;

        const now = c.currentTime;
        
        // Two oscillators slightly detuned to create a buzzing beat frequency
        const osc1 = c.createOscillator();
        const osc2 = c.createOscillator();
        const gain = c.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(130, now); // C3
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(133, now); // slightly detuned

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(c.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
      } catch (e) {
        console.warn("Incorrect synth error:", e);
      }
    },

    // Play carbon tax / fee sound (sliding down, negative)
    playTax() {
      if (isMuted) return;
      try {
        const c = getAudioContext();
        if (!c) return;

        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(c.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {
        console.warn("Tax sound failed:", e);
      }
    },

    // Play pass START space sound (cheery slide up)
    playPassStart() {
      if (isMuted) return;
      try {
        const c = getAudioContext();
        if (!c) return;

        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(c.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      } catch (e) {
        console.warn("Pass start sound failed:", e);
      }
    },

    // Play jail alarm (alternating police sirens)
    playJail() {
      if (isMuted) return;
      try {
        const c = getAudioContext();
        if (!c) return;

        let now = c.currentTime;
        
        // Alternating frequency osc
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(300, now + 0.15);
        osc.frequency.setValueAtTime(400, now + 0.3);
        osc.frequency.setValueAtTime(300, now + 0.45);
        
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } catch (e) {
        console.warn("Jail sound failed:", e);
      }
    },

    // Play victorious game-over fan fare
    playVictory() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // ascending arpeggio
        notes.forEach((freq, idx) => {
          playTone(freq, 'sine', 0.5, idx * 0.12, 0.06);
        });
        
        // Final chord
        setTimeout(() => {
          playTone(523.25, 'sine', 1.0, 0, 0.05);
          playTone(659.25, 'sine', 1.0, 0, 0.05);
          playTone(783.99, 'sine', 1.0, 0, 0.05);
          playTone(1046.50, 'sine', 1.0, 0, 0.05);
        }, 700);
      } catch (e) {
        console.warn("Victory sound failed:", e);
      }
    }
  };
})();
