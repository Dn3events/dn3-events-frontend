import { useState, useEffect, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { Search, Loader, Camera } from 'lucide-react'
import QrScanner from '../components/QrScanner'
import { unlockAudio, playScanResult } from '../lib/scanSound'
import { checkin } from '../api/checkin'
import { format, parseISO } from 'date-fns'

const RESULT_STYLE = {
  admitted: 'bg-green-50 border-green-300 text-green-900',
  duplicate: 'bg-amber-50 border-amber-300 text-amber-900',
  insufficient: 'bg-amber-50 border-amber-300 text-amber-900',
  revoked: 'bg-red-50 border-red-300 text-red-900',
  invalid: 'bg-red-50 border-red-300 text-red-900',
}

const RESULT_TITLE = {
  admitted: 'ADMIT',
  duplicate: 'ALREADY CHECKED IN',
  revoked: 'TICKET CANCELLED',
  invalid: 'NOT RECOGNISED',
}

export default function CheckInTab({ eventId }) {
  const { showToast } = useStore()
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [list, setList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const inputRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const scanningRef = useRef(false)
  // The panel that opens after a scan: nothing is admitted until the person at the door confirms.
  const [pending, setPending] = useState(null)
  const [pickCount, setPickCount] = useState(1)
  const [confirming, setConfirming] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await checkin.stats(eventId)
      setStats(res.data.data)
    } catch {
      /* the numbers are a nicety; scanning must keep working */
    }
  }, [eventId])

  const loadList = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await checkin.tickets(eventId, search)
      setList(res.data.data)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load tickets', 'error')
    } finally {
      setLoadingList(false)
    }
  }, [eventId, search, showToast])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const timer = setTimeout(loadList, 250)
    return () => clearTimeout(timer)
  }, [loadList])

  // A handheld or USB scanner types the code and presses Enter, so a form submit handles it.
  const submitCode = async (e) => {
    e.preventDefault()
    const value = code.trim()
    if (!value) return
    await scanCode(value)
    setCode('')
    inputRef.current?.focus()
  }

  const pendingRef = useRef(false)

  // First scan: look only. Opens the panel when there is someone to admit, otherwise shows why not.
  const scanCode = async (value) => {
    try {
      const res = await checkin.lookup(eventId, value)
      const r = res.data.result || 'invalid'
      if (r === 'ready') {
        const remaining = res.data.data.group?.remaining ?? 1
        setResult(null)
        setPickCount(1)
        setPending({ code: value, ...res.data.data, remaining })
        pendingRef.current = true
        playScanResult('open')
      } else {
        setResult({ result: r, ...res.data })
        playScanResult(r)
      }
    } catch {
      setResult({ result: 'invalid', error: 'Could not reach the server. Do not admit until it works.' })
      playScanResult('invalid')
    }
  }

  const closePanel = () => {
    setPending(null)
    pendingRef.current = false
    scanningRef.current = false
  }

  const confirmAdmit = async () => {
    if (!pending || confirming) return
    setConfirming(true)
    try {
      const res = await checkin.scan(eventId, { code: pending.code, count: pending.kind === 'group' ? pickCount : undefined })
      const r = res.data.result || 'invalid'
      setResult({ result: r, ...res.data })
      playScanResult(r)
    } catch {
      setResult({ result: 'invalid', error: 'Could not reach the server. Nobody was admitted.' })
      playScanResult('invalid')
    } finally {
      setConfirming(false)
      closePanel()
      refresh()
      loadList()
    }
  }

  const doScan = async (body) => {
    try {
      const res = await checkin.scan(eventId, body)
      const r = res.data.result || 'invalid'
      setResult({ result: r, ...res.data })
      playScanResult(r)
    } catch {
      setResult({ result: 'invalid', error: 'Could not reach the server. Do not admit until it works.' })
      playScanResult('invalid')
    }
    refresh()
    loadList()
  }

  // One scan at a time: a second code arriving while the server is still answering waits its turn
  // by being dropped; the scanner re-reads it once the cooldown has passed.
  const onCameraCode = async (value) => {
    if (scanningRef.current) return
    scanningRef.current = true
    try {
      await scanCode(value.trim())
    } finally {
      // While the panel is open the camera ignores further codes.
      scanningRef.current = pendingRef.current
    }
  }


  const frameColour = !result ? 'border-white' : result.result === 'admitted' ? 'border-green-400' : result.result === 'invalid' || result.result === 'revoked' ? 'border-red-500' : 'border-amber-400'

  const pendingPanel = pending && (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <p className="text-sm text-gray-500">Ticket holder</p>
            <p className="text-xl font-bold text-gray-900">{pending.holder}</p>
            {pending.breakdown?.length > 0 && (
              <p className="text-sm text-gray-600">{pending.breakdown.map((b) => `${b.count} x ${b.name}`).join(', ')}</p>
            )}
            {pending.kind === 'group' ? (
              <>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-100 rounded-lg py-3"><p className="text-3xl font-bold">{pending.group.total}</p><p className="text-xs uppercase tracking-wide text-gray-600">On this QR</p></div>
                  <div className="bg-gray-100 rounded-lg py-3"><p className="text-3xl font-bold">{pending.group.used}</p><p className="text-xs uppercase tracking-wide text-gray-600">Used</p></div>
                  <div className="bg-green-100 rounded-lg py-3"><p className="text-3xl font-bold text-green-800">{pending.group.remaining}</p><p className="text-xs uppercase tracking-wide text-green-800">Left</p></div>
                </div>
                <p className="mt-5 text-center text-sm font-medium text-gray-700">How many are coming in now?</p>
                <div className="mt-2 flex items-center justify-center gap-6">
                  <button type="button" onClick={() => setPickCount((n) => Math.max(1, n - 1))} disabled={pickCount <= 1} className="w-16 h-16 rounded-full bg-gray-200 text-3xl font-bold disabled:opacity-40" aria-label="One fewer">-</button>
                  <span className="text-5xl font-bold w-16 text-center">{pickCount}</span>
                  <button type="button" onClick={() => setPickCount((n) => Math.min(pending.remaining, n + 1))} disabled={pickCount >= pending.remaining} className="w-16 h-16 rounded-full bg-gray-200 text-3xl font-bold disabled:opacity-40" aria-label="One more">+</button>
                </div>
                <p className="mt-1 text-center text-xs text-gray-500">That leaves {pending.remaining - pickCount} for later</p>
              </>
            ) : (
              <p className="mt-4 text-center text-lg text-gray-800">One ticket: {pending.ticketName}</p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={closePanel} disabled={confirming} className="py-4 rounded-lg bg-gray-200 text-gray-800 text-lg font-semibold">Cancel</button>
              <button type="button" onClick={confirmAdmit} disabled={confirming} className="py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-lg font-semibold">
                {confirming ? 'Admitting...' : pending.kind === 'group' ? `Admit ${pickCount}` : 'Admit'}
              </button>
            </div>
          </div>
        </div>
  )

  const resultCard = result && (
    <div className={`border-2 rounded-lg p-6 ${RESULT_STYLE[result.result] || RESULT_STYLE.invalid}`}>
          <p className="text-2xl font-bold">
            {result.result === 'admitted' && result.data?.admitted
              ? `ADMITTED ${result.data.admitted}`
              : result.result === 'duplicate' && result.data?.group?.total > 1
                ? 'ALL TICKETS USED'
                : result.result === 'insufficient'
                  ? 'NOT ENOUGH LEFT'
                  : RESULT_TITLE[result.result] || 'NOT RECOGNISED'}
          </p>
          {result.data?.group?.total > 0 && result.data.kind === 'group' && (
            <>
              {result.result === 'admitted' && (
                <p className="mt-3 text-center">
                  <span className="text-6xl font-extrabold">{result.data.group.remaining}</span>
                  <span className="block text-sm uppercase tracking-wide">{result.data.group.remaining === 0 ? 'left - everyone is in' : 'left for the next scan'}</span>
                </p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/70 rounded-lg py-2"><p className="text-2xl font-bold">{result.data.group.total}</p><p className="text-xs uppercase tracking-wide">On this order</p></div>
                <div className="bg-white/70 rounded-lg py-2"><p className="text-2xl font-bold">{result.data.group.used}</p><p className="text-xs uppercase tracking-wide">Used</p></div>
                <div className="bg-white/70 rounded-lg py-2"><p className="text-2xl font-bold">{result.data.group.remaining}</p><p className="text-xs uppercase tracking-wide">Left</p></div>
              </div>
            </>
          )}
          {result.data && (
            <p className="mt-1 text-lg">
              {result.data.holder}{result.data.ticketName ? ` - ${result.data.ticketName}` : ''}
              {result.result === 'duplicate' && result.data.scannedAt && ` (at ${format(parseISO(result.data.scannedAt), 'HH:mm')})`}
            </p>
          )}
          {result.result !== 'admitted' && result.error && <p className="mt-1 text-sm">{result.error}</p>}
        </div>
  )

  const scannerScreen = cameraOn && (
    <div className="fixed inset-0 z-[60] bg-black text-white select-none">
      <QrScanner onCode={onCameraCode} fullscreen />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={`relative w-[68vw] max-w-[320px] aspect-square rounded-3xl border-4 ${frameColour} transition-colors shadow-[0_0_0_100vmax_rgba(0,0,0,0.55)]`} />
      </div>
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button type="button" onClick={() => { setCameraOn(false); setResult(null); closePanel() }} className="w-11 h-11 rounded-full bg-black/50 flex items-center justify-center text-2xl" aria-label="Close scanner">&times;</button>
        {stats && <div className="px-4 py-2 rounded-full bg-black/50 text-sm font-semibold">{stats.checkedIn} / {stats.total} in</div>}
        <div className="w-11" />
      </div>
      {!result && !pending && (
        <p className="absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] text-center text-base text-white/90">Point at a ticket QR code</p>
      )}
      {result && !pending && (
        <div className="absolute inset-x-0 bottom-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {resultCard}
          <button type="button" onClick={() => setResult(null)} className="mt-3 w-full py-4 rounded-xl bg-white text-black text-lg font-semibold">Scan next</button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8" onPointerDown={unlockAudio}>
      {scannerScreen}
      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Tickets</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Checked in</p>
            <p className="text-2xl font-bold">{stats.checkedIn}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Still to arrive</p>
            <p className="text-2xl font-bold">{stats.remaining}</p>
          </div>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => { unlockAudio(); setResult(null); setCameraOn(true) }}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          <Camera className="w-6 h-6" />
          Scan tickets
        </button>
      </div>

      <form onSubmit={submitCode} className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Or type the ticket code"
          className="min-w-0 flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg text-lg font-mono focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          Check in
        </button>
      </form>

      {pendingPanel}

      {!cameraOn && resultCard}

      <div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find someone by name, email or ticket type (manual check-in)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        {loadingList && <Loader className="w-5 h-5 animate-spin text-blue-600" />}
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {list.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{t.holder}</p>
                <p className="text-sm text-gray-600">
                  {t.ticketName}
                  {t.kind === 'guest' ? ' (guest)' : ''}
                  {t.group?.total > 1 && ` - order of ${t.group.total}: ${t.group.used} in, ${t.group.remaining} left`}
                </p>
              </div>
              {t.status === 'revoked' ? (
                <span className="text-sm text-red-600">Cancelled</span>
              ) : t.scanned ? (
                <span className="text-sm text-green-700">Checked in {t.scannedAt && format(parseISO(t.scannedAt), 'HH:mm')}</span>
              ) : (
                <button onClick={() => doScan({ ticketId: t.id })} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                  Check in
                </button>
              )}
            </div>
          ))}
          {list.length === 0 && !loadingList && <p className="p-6 text-center text-gray-600">No tickets found</p>}
        </div>
      </div>
    </div>
  )
}
