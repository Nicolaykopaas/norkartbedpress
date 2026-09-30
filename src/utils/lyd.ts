export type EffektType = 'strike' | 'par' | 'gutter';

let ctx: AudioContext | undefined;

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  vol = 0.15
) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + start);
  g.gain.setValueAtTime(vol, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur);
}

function støy(start: number, dur: number, vol: number) {
  if (!ctx) return;
  const buf = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * dur),
    ctx.sampleRate
  );
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++)
    d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g).connect(ctx.destination);
  src.start(ctx.currentTime + start);
}

export function spillLyd(type: EffektType) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    if (type === 'strike') {
      // Kjegler som smeller, så fanfare
      [0, 0.06, 0.13, 0.2, 0.28].forEach((t) => støy(t, 0.25, 0.35));
      [523, 659, 784, 1047].forEach((f, i) =>
        tone(f, 0.4 + i * 0.12, 0.3, 'square')
      );
    } else if (type === 'par') {
      tone(880, 0, 0.25, 'sine');
      tone(1175, 0.12, 0.35, 'sine');
    } else {
      // Sur trombone
      [392, 370, 349, 311].forEach((f, i) =>
        tone(f, i * 0.28, i === 3 ? 0.8 : 0.28, 'sawtooth', 0.12)
      );
    }
  } catch {
    /* lyd er valgfritt */
  }
}

function velgStemme(): SpeechSynthesisVoice | undefined {
  const alle = window.speechSynthesis.getVoices();
  const norske = alle.filter((v) => /^(nb|no|nn)/i.test(v.lang));
  const poeng = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online/i.test(v.name) ? 10 : 0) +
    (/google/i.test(v.name) ? 5 : 0) +
    (/nora|pernille|finn|iselin|henrik/i.test(v.name) ? 3 : 0) +
    (v.localService ? 0 : 2);
  return (
    norske.sort((a, b) => poeng(b) - poeng(a))[0] ??
    alle.find((v) => /^en/i.test(v.lang))
  );
}

/** Leser opp tekst livlig, med en tilfeldig variasjon i tempo og tonehøyde. */
export function snakk(tekst: string, energi = 1) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    // Del opp på utropstegn/punktum og les hver bit med litt ulik tone
    tekst
      .split(/(?<=[!?.])\s+/)
      .filter(Boolean)
      .forEach((bit, i) => {
        const u = new SpeechSynthesisUtterance(bit);
        const stemme = velgStemme();
        if (stemme) u.voice = stemme;
        u.lang = stemme?.lang ?? 'nb-NO';
        u.rate = (1.05 + Math.random() * 0.15) * energi;
        u.pitch =
          (1.15 + (i % 2) * 0.2 + Math.random() * 0.15) *
          (bit.endsWith('!') ? 1.1 : 1);
        u.volume = 1;
        synth.speak(u);
      });
  } catch {
    /* stemme er valgfritt */
  }
}
