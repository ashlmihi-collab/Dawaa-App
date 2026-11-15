/**
 * Web Audio API Synthesizer for Medicine Alarm Ringtones
 * Generates rich, realistic, offline-safe melodies and acoustic tones without external audio dependencies.
 */

export interface Ringtone {
  id: string;
  name: string;
  nameEn: string;
  category: 'calm' | 'classic' | 'cheerful' | 'nature' | 'energetic';
  categoryAr: string;
  description: string;
  iconName: string;
}

export const RINGTONES: Ringtone[] = [
  {
    id: 'morning_gentle',
    name: 'إشراقة الصباح الهادئة',
    nameEn: 'Gentle Morning Sun',
    category: 'calm',
    categoryAr: 'هادئ ومريح',
    description: 'نغمات متصاعدة هادئة توقظ الحواس بلطف دون إزعاج',
    iconName: 'Sun',
  },
  {
    id: 'classic_bell',
    name: 'جرس المنبه الكلاسيكي',
    nameEn: 'Classic Bell Chime',
    category: 'classic',
    categoryAr: 'كلاسيكي تقليدي',
    description: 'رنين جرس معدني واضح ومتكرر بنقاء صوتي عالي',
    iconName: 'Bell',
  },
  {
    id: 'sunny_marimba',
    name: 'ماريمبا خشبية منعشة',
    nameEn: 'Sunny Marimba',
    category: 'cheerful',
    categoryAr: 'مبهج ونشيط',
    description: 'لحن ماريمبا خشبية إيقاعية مبهجة ولطيفة على الأذن',
    iconName: 'Music',
  },
  {
    id: 'crystal_harp',
    name: 'رنين قيثارة الكريستال',
    nameEn: 'Crystal Harp',
    category: 'calm',
    categoryAr: 'هادئ ومريح',
    description: 'ترددات كريستالية ساحرة ونقية تشبه رنين الأكواب الزجاجية',
    iconName: 'Sparkles',
  },
  {
    id: 'digital_pulse',
    name: 'نبض إلكتروني حديث',
    nameEn: 'Modern Digital Pulse',
    category: 'classic',
    categoryAr: 'كلاسيكي تقليدي',
    description: 'نغمة إلكترونية ثنائية النبض واضحة وسريعة التنبيه',
    iconName: 'Activity',
  },
  {
    id: 'zen_bowl',
    name: 'وعاء التأمل زن',
    nameEn: 'Zen Singing Bowl',
    category: 'calm',
    categoryAr: 'هادئ ومريح',
    description: 'رنين عميق وطويل الأمد لوعاء التبت المهدئ للأعصاب',
    iconName: 'Disc',
  },
  {
    id: 'warm_chords',
    name: 'أوتار بيانو دافئة',
    nameEn: 'Warm Piano Chords',
    category: 'calm',
    categoryAr: 'هادئ ومريح',
    description: 'تتابعات وتريات هارمونية ناعمة كعزف البيانو الصباحي',
    iconName: 'Layers',
  },
  {
    id: 'bird_chirp',
    name: 'تغريد عصافير الفجر',
    nameEn: 'Morning Birdsong',
    category: 'nature',
    categoryAr: 'طبيعي وبيئي',
    description: 'محاكاة صوتية لطيفة لزقزقة الطيور في حديقة الصباح',
    iconName: 'Feather',
  },
  {
    id: 'medical_alert',
    name: 'تنبيه العيادة الدوائية',
    nameEn: 'Medical Care Chime',
    category: 'classic',
    categoryAr: 'كلاسيكي تقليدي',
    description: 'تنبيه ناعم واحترافي مستوحى من مراكز الرعاية الصحية المتقدمة',
    iconName: 'HeartPulse',
  },
  {
    id: 'happy_tri',
    name: 'ثلاثي نغمي مرح',
    nameEn: 'Cheerful Tri-Chime',
    category: 'cheerful',
    categoryAr: 'مبهج ونشيط',
    description: 'ثلاث نغمات متتالية تبعث على التفاؤل والبهجة',
    iconName: 'Smile',
  },
  {
    id: 'flute_melody',
    name: 'ناي شرقي هادئ',
    nameEn: 'Soft Flute Chime',
    category: 'calm',
    categoryAr: 'هادئ ومريح',
    description: 'لحن ناي هادئ بأجواء شرقية دافئة',
    iconName: 'Wind',
  },
  {
    id: 'soft_radar',
    name: 'رادار نبضي لطيف',
    nameEn: 'Gentle Sonar Ping',
    category: 'classic',
    categoryAr: 'كلاسيكي تقليدي',
    description: 'رنين دوري متباعد يسهل ملاحظته في أي غرفة',
    iconName: 'Radio',
  },
  {
    id: 'silver_clock',
    name: 'دقات الساعة الفضية',
    nameEn: 'Silver Clock Chime',
    category: 'classic',
    categoryAr: 'كلاسيكي تقليدي',
    description: 'تكتكة إيقاعية متبوعة برنين ساعة جدارية مميزة',
    iconName: 'Clock',
  },
  {
    id: 'lively_energy',
    name: 'منبه النشاط والحيوية',
    nameEn: 'Lively Energizer',
    category: 'energetic',
    categoryAr: 'عالي التنبيه',
    description: 'إيقاع تصاعدي مفعم بالطاقة لمن يحتاج تنبيهاً حاسماً',
    iconName: 'Zap',
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentLoopTimer: number | null = null;
  private isCurrentlyRinging = false;
  private activeToneId: string | null = null;
  private activeNodes: (AudioNode | { stop: () => void })[] = [];

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play a single note with envelope (Includes +25% acoustic alert boost)
  private playNote(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainMultiplier = 1,
    detune = 0
  ) {
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (detune !== 0) {
      osc.detune.setValueAtTime(detune, startTime);
    }

    // Envelope: quick attack, natural decay
    // 25% Alert Volume Boost (0.375 base peak instead of 0.3)
    const boostedMultiplier = gainMultiplier * 1.25;
    gain.gain.setValueAtTime(0.0001, startTime);
    const attackTime = Math.min(0.04, duration * 0.15);
    gain.gain.linearRampToValueAtTime(0.375 * boostedMultiplier, startTime + attackTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Synthesize a specific ringtone pattern
   */
  public playTonePattern(toneId: string, volume = 0.8) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime + 0.05;

      switch (toneId) {
        case 'morning_gentle': {
          // Ascending Pentatonic C Major (C4, D4, E4, G4, A4, C5)
          const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
          notes.forEach((freq, idx) => {
            this.playNote(freq, now + idx * 0.18, 0.6, 'sine', volume);
            this.playNote(freq * 2, now + idx * 0.18, 0.4, 'triangle', volume * 0.3);
          });
          break;
        }

        case 'classic_bell': {
          // Dual frequency bell chime
          const strikes = [0, 0.35, 0.7, 1.05];
          strikes.forEach((t) => {
            this.playNote(880, now + t, 0.5, 'sine', volume * 0.8);
            this.playNote(1760, now + t, 0.35, 'triangle', volume * 0.4);
            this.playNote(2640, now + t, 0.2, 'sine', volume * 0.15);
          });
          break;
        }

        case 'sunny_marimba': {
          // Cheerful bounce: C5, G4, A4, E5, D5
          const melody = [
            { f: 523.25, t: 0, d: 0.2 },
            { f: 392.0, t: 0.15, d: 0.2 },
            { f: 440.0, t: 0.3, d: 0.2 },
            { f: 659.25, t: 0.45, d: 0.3 },
            { f: 587.33, t: 0.7, d: 0.4 },
          ];
          melody.forEach((m) => {
            this.playNote(m.f, now + m.t, m.d, 'triangle', volume * 0.9);
            this.playNote(m.f * 3, now + m.t, m.d * 0.4, 'sine', volume * 0.2);
          });
          break;
        }

        case 'crystal_harp': {
          // Shimmering glassy chords
          const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51];
          arpeggio.forEach((freq, idx) => {
            this.playNote(freq, now + idx * 0.14, 0.8, 'sine', volume * 0.7);
            this.playNote(freq * 1.5, now + idx * 0.14, 0.5, 'sine', volume * 0.25);
          });
          break;
        }

        case 'digital_pulse': {
          // Modern tech pulse: be-beep ... be-beep
          const pulseTimes = [0, 0.12, 0.45, 0.57];
          pulseTimes.forEach((t, i) => {
            const freq = i % 2 === 0 ? 800 : 1200;
            this.playNote(freq, now + t, 0.09, 'square', volume * 0.35);
          });
          break;
        }

        case 'zen_bowl': {
          // Deep harmonic singing bowl
          const baseFreq = 216; // A3 harmonic
          this.playNote(baseFreq, now, 2.2, 'sine', volume * 0.9);
          this.playNote(baseFreq * 2.76, now, 1.8, 'sine', volume * 0.4);
          this.playNote(baseFreq * 5.4, now, 1.2, 'sine', volume * 0.15);
          break;
        }

        case 'warm_chords': {
          // Rich triad arpeggio (Fmaj7 -> G)
          const chord = [349.23, 440.0, 523.25, 659.25, 783.99];
          chord.forEach((freq, i) => {
            this.playNote(freq, now + i * 0.15, 0.9, 'sine', volume * 0.8);
            this.playNote(freq * 0.5, now + i * 0.15, 1.0, 'triangle', volume * 0.4);
          });
          break;
        }

        case 'bird_chirp': {
          // Frequency-modulated avian chirps
          for (let chirp = 0; chirp < 3; chirp++) {
            const startTime = now + chirp * 0.28;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(2000 + chirp * 200, startTime);
            osc.frequency.exponentialRampToValueAtTime(3200 + chirp * 150, startTime + 0.08);
            osc.frequency.exponentialRampToValueAtTime(2200, startTime + 0.16);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(0.25 * volume, startTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.18);
          }
          break;
        }

        case 'medical_alert': {
          // Dual pleasant clinic chime: 587Hz (D5) -> 880Hz (A5)
          this.playNote(587.33, now, 0.4, 'sine', volume * 0.8);
          this.playNote(880.0, now + 0.25, 0.7, 'sine', volume * 0.9);
          this.playNote(1760.0, now + 0.25, 0.3, 'triangle', volume * 0.2);
          break;
        }

        case 'happy_tri': {
          // Bright major triad (E5, G#5, B5, E6)
          const notes = [659.25, 830.61, 987.77, 1318.51];
          notes.forEach((freq, i) => {
            this.playNote(freq, now + i * 0.12, 0.35, 'triangle', volume * 0.7);
          });
          break;
        }

        case 'flute_melody': {
          // Breathy, melodic flute notes: D4, F4, G4, A4, C5
          const notes = [293.66, 349.23, 392.0, 440.0, 523.25];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + i * 0.22;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.3 * volume, t + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.42);
          });
          break;
        }

        case 'soft_radar': {
          // Pulsing sonar radar ping
          const pings = [0, 0.5, 1.0];
          pings.forEach((t) => {
            this.playNote(900, now + t, 0.3, 'sine', volume * 0.7);
            this.playNote(1800, now + t, 0.15, 'sine', volume * 0.25);
          });
          break;
        }

        case 'silver_clock': {
          // Tick... Tick... Ding!
          this.playNote(1200, now, 0.05, 'triangle', volume * 0.3);
          this.playNote(1000, now + 0.25, 0.05, 'triangle', volume * 0.3);
          this.playNote(784, now + 0.5, 0.9, 'sine', volume * 0.85);
          this.playNote(1568, now + 0.5, 0.4, 'triangle', volume * 0.3);
          break;
        }

        case 'lively_energy':
        default: {
          // Energetic wake up staccato
          const sequence = [440, 554, 659, 880, 659, 880];
          sequence.forEach((freq, i) => {
            this.playNote(freq, now + i * 0.11, 0.14, 'triangle', volume * 0.8);
          });
          break;
        }
      }
    } catch (err) {
      console.warn('Audio synthesis warning:', err);
    }
  }

  /**
   * Preview a tone once
   */
  public previewTone(toneId: string, volume = 0.8) {
    this.stopAlarm();
    this.playTonePattern(toneId, volume);
  }

  /**
   * Start looping alarm for ringing screen with audio + vibration
   */
  public startAlarm(toneId: string, volume = 0.8, vibrate = true) {
    this.stopAlarm();
    this.isCurrentlyRinging = true;
    this.activeToneId = toneId;

    if (vibrate && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([500, 250, 500, 250, 800]);
      } catch {
        // Ignore vibration errors
      }
    }

    // Play immediately
    this.playTonePattern(toneId, volume);

    // Loop every 2.4 seconds
    this.currentLoopTimer = window.setInterval(() => {
      if (this.isCurrentlyRinging && this.activeToneId) {
        this.playTonePattern(this.activeToneId, volume);
        if (vibrate && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
          try {
            navigator.vibrate([500, 250, 500]);
          } catch {
            // Ignore
          }
        }
      }
    }, 2400);
  }

  /**
   * Stop any active alarm or loop
   */
  public stopAlarm() {
    this.isCurrentlyRinging = false;
    this.activeToneId = null;

    if (this.currentLoopTimer !== null) {
      clearInterval(this.currentLoopTimer);
      this.currentLoopTimer = null;
    }

    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(0);
      } catch {
        // Ignore
      }
    }
  }

  public isRinging(): boolean {
    return this.isCurrentlyRinging;
  }
}

export const soundEngine = new SoundEngine();
