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
    await doScan({ code: value })
    setCode('')
    inputRef.current?.focus()
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
      await doScan({ code: value.trim() })
    } finally {
      scanningRef.current = false
    }
  }

  return (
    <div className="space-y-8" onPointerDown={unlockAudio}>
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
          onClick={() => { unlockAudio(); setCameraOn((on) => !on) }}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          <Camera className="w-6 h-6" />
          {cameraOn ? 'Stop camera' : 'Scan with camera'}
        </button>
        {cameraOn && (
          <div className="mt-4">
            <QrScanner onCode={onCameraCode} />
          </div>
        )}
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

      {result && (
        <div className={`border-2 rounded-lg p-6 ${RESULT_STYLE[result.result] || RESULT_STYLE.invalid}`}>
          <p className="text-2xl font-bold">
            {result.result === 'duplicate' && result.data?.group?.total > 0 && result.data.group.remaining === 0 && result.data.group.total > 1
              ? 'ALL TICKETS USED'
              : result.result === 'admitted' && result.data?.group?.total > 1
                ? 'ADMIT ONE'
                : RESULT_TITLE[result.result] || 'NOT RECOGNISED'}
          </p>
          {result.data?.group?.total > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/70 rounded-lg py-2">
                <p className="text-3xl font-bold">{result.data.group.total}</p>
                <p className="text-xs uppercase tracking-wide">On this order</p>
              </div>
              <div className="bg-white/70 rounded-lg py-2">
                <p className="text-3xl font-bold">{result.data.group.used}</p>
                <p className="text-xs uppercase tracking-wide">Used</p>
              </div>
              <div className="bg-white/70 rounded-lg py-2">
                <p className="text-3xl font-bold">{result.data.group.remaining}</p>
                <p className="text-xs uppercase tracking-wide">Left</p>
              </div>
            </div>
          )}
          {result.data && (
            <p className="mt-1 text-lg">
              {result.data.holder} - {result.data.ticketName}
              {result.result === 'duplicate' && result.data.scannedAt && ` (at ${format(parseISO(result.data.scannedAt), 'HH:mm')})`}
            </p>
          )}
          {result.result !== 'admitted' && result.error && <p className="mt-1 text-sm">{result.error}</p>}
        </div>
      )}

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
