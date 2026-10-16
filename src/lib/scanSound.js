// Audible and haptic feedback for door staff. Browsers block audio until a user gesture,
// so unlockAudio() must be called from a tap (the Scan button, or any tap on the page).
let ctx = null

export function unlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume()
    // A silent blip fully unlocks iOS Safari.
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    g.gain.value = 0.0001
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.01)
  } catch { /* audio is a nice-to-have */ }
}

function tone(freq, start, dur, type, vol) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  const t0 = ctx.currentTime + start
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}

// admitted: two rising high notes (a clear "bing"). Anything else: low harsh buzz, different shape.
export function playScanResult(result) {
  try {
    if (!ctx) unlockAudio()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    if (result === 'admitted') {
      tone(880, 0, 0.14, 'sine', 0.5)
      tone(1320, 0.12, 0.3, 'sine', 0.5)
      navigator.vibrate?.(80)
    } else if (result === 'duplicate') {
      tone(220, 0, 0.25, 'sawtooth', 0.35)
      tone(220, 0.3, 0.25, 'sawtooth', 0.35)
      navigator.vibrate?.([150, 80, 150])
    } else {
      tone(160, 0, 0.7, 'square', 0.3)
      navigator.vibrate?.([300, 100, 300])
    }
  } catch { /* ignore */ }
}
