import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

// Camera QR scanner. Uses the browser's BarcodeDetector when there is one and jsQR otherwise
// (iOS Safari has no BarcodeDetector). Calls onCode once per distinct code; the same code is
// ignored for `cooldownMs` so one held-up ticket is not submitted over and over.
export default function QrScanner({ onCode, cooldownMs = 4000, fullscreen = false }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const lastRef = useRef({ code: null, at: 0 })
  const onCodeRef = useRef(onCode)
  const [error, setError] = useState('')

  useEffect(() => {
    onCodeRef.current = onCode
  }, [onCode])

  useEffect(() => {
    let stream
    let raf
    let stopped = false
    const detector = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null

    const handle = (code) => {
      const now = Date.now()
      const last = lastRef.current
      if (code === last.code && now - last.at < cooldownMs) return
      lastRef.current = { code, at: now }
      onCodeRef.current(code)
    }

    const tick = async () => {
      if (stopped) return
      const video = videoRef.current
      if (video && video.readyState >= 2) {
        try {
          if (detector) {
            const found = await detector.detect(video)
            if (found.length) handle(found[0].rawValue)
          } else {
            const canvas = canvasRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const res = jsQR(img.data, img.width, img.height)
            if (res?.data) handle(res.data)
          }
        } catch {
          /* a bad frame is not worth stopping for */
        }
      }
      raf = setTimeout(tick, 200)
    }

    ;(async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser cannot open the camera. Use the code box or the list instead.')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        tick()
      } catch (err) {
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera permission was refused. Allow it in the browser settings, or use the code box.'
            : 'Could not start the camera. Use the code box or the list instead.'
        )
      }
    })()

    return () => {
      stopped = true
      clearTimeout(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [cooldownMs])

  if (error) return <p className={fullscreen ? 'absolute inset-x-4 top-1/3 text-center text-base text-white bg-red-700/90 rounded-xl p-4' : 'text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3'}>{error}</p>
  if (fullscreen) {
    return (
      <>
        <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover bg-black" />
        <canvas ref={canvasRef} className="hidden" />
      </>
    )
  }
  return (
    <div className="relative max-w-md mx-auto">
      <video ref={videoRef} playsInline muted className="w-full rounded-lg bg-black" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
