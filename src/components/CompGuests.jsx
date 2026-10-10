import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Upload, Send } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useStore } from '../store/useStore'
import { guests as guestsAPI } from '../api/guests'
import { tickets as ticketsAPI } from '../api/tickets'
import { guestsFromCsv } from '../lib/csv'

const errorOf = (err, fallback) => err.response?.data?.error || err.response?.data?.message || fallback

// Complimentary guests: people who get a free ticket without buying. One at a time or from a CSV.
export default function CompGuests({ eventId }) {
  const { showToast } = useStore()
  const [list, setList] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', ticketId: '', notes: '', sendTicket: true })
  const [csv, setCsv] = useState(null) // { guests, errors, fileName }
  const [csvTicketId, setCsvTicketId] = useState('')
  const [csvSend, setCsvSend] = useState(false)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const [g, t] = await Promise.all([guestsAPI.listByEvent(eventId), ticketsAPI.listByEvent(eventId)])
      setList(g.data.data || [])
      setTickets(t.data.data || [])
    } catch (err) {
      showToast(errorOf(err, 'Failed to load guests'), 'error')
    } finally {
      setLoading(false)
    }
  }, [eventId, showToast])

  useEffect(() => {
    load()
  }, [load])

  const add = async (e) => {
    e.preventDefault()
    if (!form.ticketId) return showToast('Choose which ticket this guest gets', 'error')
    setBusy(true)
    try {
      await guestsAPI.create(eventId, {
        name: form.name.trim(),
        email: form.email.trim(),
        ticketId: form.ticketId,
        notes: form.notes || undefined,
        sendTicket: form.sendTicket,
      })
      showToast(form.sendTicket ? 'Guest added, ticket queued to send' : 'Guest added', 'success')
      setForm({ ...form, name: '', email: '', notes: '' })
      load()
    } catch (err) {
      showToast(errorOf(err, 'Failed to add guest'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 1024 * 1024) return showToast('That file is too large for a guest list', 'error')
    setCsv({ ...guestsFromCsv(await file.text()), fileName: file.name })
  }

  const importCsv = async () => {
    if (!csvTicketId) return showToast('Choose which ticket these guests get', 'error')
    setBusy(true)
    try {
      const res = await guestsAPI.bulk(
        eventId,
        csv.guests.map((g) => ({ ...g, ticketId: csvTicketId }))
      )
      const created = res.data.data || []
      let failed = 0
      if (csvSend) {
        for (const g of created) {
          try {
            await guestsAPI.send(eventId, g.id)
          } catch {
            failed++
          }
        }
      }
      showToast(
        `Added ${created.length} guests${csvSend ? (failed ? `, ${failed} emails could not be queued (use Send on those rows)` : ', tickets queued to send') : ''}`,
        failed ? 'error' : 'success'
      )
      setCsv(null)
      load()
    } catch (err) {
      showToast(errorOf(err, 'Import failed. Nothing was added.'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const send = async (g) => {
    try {
      await guestsAPI.send(eventId, g.id)
      showToast('Ticket queued to send', 'success')
      load()
    } catch (err) {
      showToast(errorOf(err, 'Failed to send'), 'error')
    }
  }

  const ticketSelect = (value, onChange) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
      <option value="">Ticket type...</option>
      {tickets.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  )

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3 items-end">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
        {ticketSelect(form.ticketId, (v) => setForm({ ...form, ticketId: v }))}
        <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.sendTicket} onChange={(e) => setForm({ ...form, sendTicket: e.target.checked })} />
          Email the ticket now
        </label>
        <button disabled={busy} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add guest
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          <Upload className="w-4 h-4" /> Upload CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
      </form>

      {csv && (
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <p className="font-semibold text-gray-900">
            {csv.fileName}: {csv.guests.length} valid {csv.guests.length === 1 ? 'guest' : 'guests'}
            {csv.errors.length > 0 && `, ${csv.errors.length} problem${csv.errors.length === 1 ? '' : 's'}`}
          </p>
          <p className="text-xs text-gray-600">Columns: name, email, and optionally notes. The first row must be the headings.</p>
          {csv.errors.length > 0 && (
            <ul className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-auto">
              {csv.errors.slice(0, 50).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          {csv.guests.length > 0 && (
            <>
              <div className="text-sm text-gray-700 max-h-40 overflow-auto">
                {csv.guests.slice(0, 20).map((g) => (
                  <div key={g.email}>
                    {g.name} - {g.email}
                  </div>
                ))}
                {csv.guests.length > 20 && <div>and {csv.guests.length - 20} more</div>}
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                {ticketSelect(csvTicketId, setCsvTicketId)}
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={csvSend} onChange={(e) => setCsvSend(e.target.checked)} />
                  Email every ticket after importing
                </label>
                <button disabled={busy || csv.errors.length > 0} onClick={importCsv} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {busy ? 'Importing...' : `Add ${csv.guests.length} guests`}
                </button>
                <button onClick={() => setCsv(null)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  Cancel
                </button>
              </div>
              {csv.errors.length > 0 && <p className="text-xs text-gray-600">Fix the problems in the file and upload it again. Nothing is added until the whole file is clean.</p>}
            </>
          )}
        </div>
      )}

      {loading ? null : list.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-600">No complimentary guests yet</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Ticket', 'Added', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {list.map((g) => (
                <tr key={g.id}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{g.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{g.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{g.ticketName || '-'}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{format(parseISO(g.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-3 text-right">
                    {g.ticketId && (
                      <button onClick={() => send(g)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                        <Send className="w-3 h-3" /> {g.sent ? 'Resend' : 'Send'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}
