// Audio System

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.volume = 0.5;

        this.ambience = {
            wind: null,
            water: null
        };
    }

    createNoiseBuffer() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    startAmbience() {
         if (!this.enabled || this.ambience.wind) return;
         if (this.ctx.state === 'suspended') this.ctx.resume();

         const noiseBuffer = this.createNoiseBuffer();
         if (!noiseBuffer) return;

         // Wind
         const windSrc = this.ctx.createBufferSource();
         windSrc.buffer = noiseBuffer;
         windSrc.loop = true;
         const windFilter = this.ctx.createBiquadFilter();
         windFilter.type = 'lowpass';
         windFilter.frequency.value = 400;
         const windGain = this.ctx.createGain();
         windGain.gain.value = 0;
         windSrc.connect(windFilter);
         windFilter.connect(windGain);
         windGain.connect(this.ctx.destination);
         windSrc.start();

         this.ambience.wind = { src: windSrc, gain: windGain, filter: windFilter };

         // Water
         const waterSrc = this.ctx.createBufferSource();
         waterSrc.buffer = noiseBuffer;
         waterSrc.loop = true;
         const waterFilter = this.ctx.createBiquadFilter();
         waterFilter.type = 'lowpass';
         waterFilter.frequency.value = 800;
         const waterGain = this.ctx.createGain();
         waterGain.gain.value = 0;
         waterSrc.connect(waterFilter);
         waterFilter.connect(waterGain);
         waterGain.connect(this.ctx.destination);
         waterSrc.start();

         this.ambience.water = { src: waterSrc, gain: waterGain, filter: waterFilter };
    }

    updateAmbience(waterIntensity, windIntensity) {
         if (!this.ambience.wind) this.startAmbience();
         if (!this.ambience.wind) return;

         const now = this.ctx.currentTime;
         // Smooth transitions
         this.ambience.wind.gain.gain.setTargetAtTime(windIntensity * this.volume * 0.5, now, 0.5);
         this.ambience.water.gain.gain.setTargetAtTime(waterIntensity * this.volume * 0.8, now, 0.5);
    }

    updateListener(x, y, z, yaw, pitch) {
        if (!this.ctx || this.ctx.state === 'suspended') return;

        const listener = this.ctx.listener;

        // Position
        if (listener.positionX) {
            listener.positionX.value = x;
            listener.positionY.value = y;
            listener.positionZ.value = z;
        } else {
            listener.setPosition(x, y, z);
        }

        // Orientation
        // Forward vector
        const fx = Math.sin(yaw) * Math.cos(pitch);
        const fy = -Math.sin(pitch);
        const fz = Math.cos(yaw) * Math.cos(pitch);

        // Up vector (approximate)
        const ux = 0;
        const uy = 1;
        const uz = 0;

        if (listener.forwardX) {
            listener.forwardX.value = fx;
            listener.forwardY.value = fy;
            listener.forwardZ.value = fz;
            listener.upX.value = ux;
            listener.upY.value = uy;
            listener.upZ.value = uz;
        } else {
            listener.setOrientation(fx, fy, fz, ux, uy, uz);
        }
    }

    play(type, position = null) {
        if (!this.enabled) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Connect graph
        let targetNode = gain;

        if (position) {
            const panner = this.ctx.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 100;
            panner.rolloffFactor = 1;
            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z;

            osc.connect(panner);
            panner.connect(gain);
        } else {
            osc.connect(gain);
        }

        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'step':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(this.volume * 0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'break':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(this.volume * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'place':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gain.gain.setValueAtTime(this.volume * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'jump':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(300, now + 0.2);
                gain.gain.setValueAtTime(this.volume * 0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'eat':
                // Burp/Crunch sound
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150 + Math.random() * 50, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(this.volume * 0.5, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'fuse':
                 // Hiss sound
                 osc.type = 'sawtooth'; // or white noise buffer if available
                 osc.frequency.setValueAtTime(1000, now);
                 osc.frequency.linearRampToValueAtTime(500, now + 4.0);
                 gain.gain.setValueAtTime(this.volume * 0.5, now);
                 osc.start(now);
                 osc.stop(now + 4.0);
                 break;
        }
    }
}

window.soundManager = new SoundManager();
