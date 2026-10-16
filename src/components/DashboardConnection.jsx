import { useEffect, useState } from 'react'
import { Link2 } from 'lucide-react'
import Modal from './Modal'
import { organisations } from '../api/organisations'

// Lets an organisation owner connect the operations dashboard: make a read-only key (shown once)
// and revoke old ones. Only owners can use the key endpoints; for everyone else this renders nothing.
export default function DashboardConnection() {
  const [org, setOrg] = useState(null)
  const [open, setOpen] = useState(false)
  const [keys, setKeys] = useState([])
  const [newKey, setNewKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    organisations.list().then((r) => {
      const mine = (r.data?.data || []).find((o) => o.myRole === 'org_owner')
      if (mine) setOrg(mine)
    }).catch(() => {})
  }, [])

  async function load() {
    try { setKeys((await organisations.listKeys(org.id)).data.data || []) } catch { setError('Could not load keys') }
  }
  function openIt() { setOpen(true); setNewKey(''); setCopied(false); setError(''); load() }

  async function create() {
    setBusy(true); setError('')
    try {
      const r = await organisations.createKey(org.id, 'Operations dashboard')
      setNewKey(r.data.data.key); setCopied(false); await load()
    } catch { setError('Could not create a key') }
    setBusy(false)
  }
  async function revoke(id) {
    if (!window.confirm('Revoke this key? The dashboard will stop getting live figures until you make a new one.')) return
    try { await organisations.revokeKey(org.id, id); await load() } catch { setError('Could not revoke that key') }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(newKey); setCopied(true) } catch { setError('Copy failed - select the key and copy it by hand') }
  }

  if (!org) return null
  const live = keys.filter((k) => !k.revokedAt)

  return (
    <>
      <button onClick={openIt} className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-gray-300 hover:bg-gray-800 w-full text-left">
        <Link2 className="w-5 h-5" />
        <span>Dashboard connection</span>
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Dashboard connection" size="lg">
        <p className="text-sm text-gray-600 mb-4">
          A key lets your operations dashboard read live ticket figures and buyer lists. It can only read, never change anything, and only sees {org.name}.
        </p>
        {newKey && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Copy your new key now. It is shown once and cannot be shown again.</p>
            <input readOnly value={newKey} onFocus={(e) => e.target.select()} className="w-full rounded border border-gray-300 bg-white px-3 py-2 font-mono text-xs" />
            <button onClick={copy} className="mt-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-ink">{copied ? 'Copied' : 'Copy key'}</button>
          </div>
        )}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="mb-4 space-y-2">
          {live.length === 0 && <p className="text-sm text-gray-500">No active keys.</p>}
          {live.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
              <div>
                <div className="font-medium text-gray-900">{k.name} <span className="font-mono text-xs text-gray-500">{k.prefix}...</span></div>
                <div className="text-xs text-gray-500">Made {new Date(k.createdAt).toLocaleDateString('en-GB')}{k.lastUsedAt ? `, last used ${new Date(k.lastUsedAt).toLocaleString('en-GB')}` : ', not used yet'}</div>
              </div>
              <button onClick={() => revoke(k.id)} className="text-red-600 hover:underline">Revoke</button>
            </div>
          ))}
        </div>
        <button disabled={busy} onClick={create} className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Make a new key</button>
      </Modal>
    </>
  )
}
