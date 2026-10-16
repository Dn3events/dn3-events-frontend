import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { discounts as api } from '../api/discounts'
import ConfirmDialog from './ConfirmDialog'

const errorOf = (err, fallback) => err.response?.data?.error || err.response?.data?.message || fallback
const EMPTY = { code: '', description: '', type: 'percentage', value: '', maxUses: '' }
const label = (d) => (d.type === 'percentage' ? `${Number(d.value)}% off` : `£${Number(d.value).toFixed(2)} off`)

export default function DiscountCodes({ eventId }) {
  const { showToast } = useStore()
  const [list, setList] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await api.list(eventId)
      setList(res.data.data || [])
    } catch (err) {
      showToast(errorOf(err, 'Failed to load discount codes'), 'error')
    }
  }, [eventId, showToast])

  useEffect(() => {
    load()
  }, [load])

  const valid = () => {
    const v = Number(form.value)
    if (!form.code.trim()) return 'Enter a code'
    if (!(v > 0)) return 'Enter a value above 0'
    if (form.type === 'percentage' && v > 100) return 'A percentage cannot be more than 100'
    if (v > 999.99) return 'The value cannot be more than 999.99'
    if (form.maxUses !== '' && !(Number.isInteger(Number(form.maxUses)) && Number(form.maxUses) >= 1)) return 'Max uses must be a whole number, or empty for unlimited'
    return ''
  }

  const save = async (e) => {
    e.preventDefault()
    const problem = valid()
    if (problem) return showToast(problem, 'error')
    const payload = {
      code: form.code.trim(),
      description: form.description.trim() || null,
      type: form.type,
      value: Number(form.value),
      maxUses: form.maxUses === '' ? null : Number(form.maxUses),
    }
    setBusy(true)
    try {
      if (editingId) await api.update(eventId, editingId, payload)
      else await api.create(eventId, payload)
      showToast(editingId ? 'Code updated' : 'Code created', 'success')
      setForm(EMPTY)
      setEditingId(null)
      load()
    } catch (err) {
      showToast(errorOf(err, 'Failed to save code'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const edit = (d) => {
    setEditingId(d.id)
    setForm({ code: d.code, description: d.description || '', type: d.type, value: String(Number(d.value)), maxUses: d.maxUses ?? '' })
  }

  const toggle = async (d) => {
    try {
      await api.toggle(eventId, d.id)
      load()
    } catch (err) {
      showToast(errorOf(err, 'Failed to update code'), 'error')
    }
  }

  const remove = async () => {
    try {
      await api.remove(eventId, toDelete.id)
      showToast('Code deleted', 'success')
      load()
    } catch (err) {
      showToast(errorOf(err, 'Failed to delete code'), 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount codes</h3>
      <form onSubmit={save} className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3 items-end mb-4">
        <input placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="px-3 py-2 border border-gray-300 rounded-lg font-mono" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed amount (£)</option>
        </select>
        <input type="number" step="0.01" min="0" placeholder={form.type === 'percentage' ? '% off' : '£ off'} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-28 px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" min="1" placeholder="Max uses" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="w-28 px-3 py-2 border border-gray-300 rounded-lg" />
        <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <button disabled={busy} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <Plus className="w-4 h-4" /> {editingId ? 'Save' : 'Add code'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY) }} className="px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
        )}
      </form>

      {list.length === 0 ? (
        <p className="text-gray-600 text-sm">No discount codes yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {list.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-mono font-semibold text-gray-900">
                  {d.code} <span className="font-sans font-normal text-gray-600">{label(d)}</span>
                  {!d.enabled && <span className="ml-2 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Off</span>}
                </p>
                <p className="text-xs text-gray-600">
                  Used {d.usedCount}
                  {d.maxUses ? ` of ${d.maxUses}` : ' times (no limit)'}
                  {d.description ? ` - ${d.description}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(d)} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  {d.enabled ? 'Turn off' : 'Turn on'}
                </button>
                <button onClick={() => edit(d)} className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                  Edit
                </button>
                <button onClick={() => setToDelete(d)} className="p-1 text-red-600 hover:bg-red-50 rounded" aria-label={`Delete ${d.code}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete discount code?"
        message={`${toDelete?.code} will stop working. Past orders that used it keep their discount.`}
        confirmText="Delete"
        isDangerous
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
