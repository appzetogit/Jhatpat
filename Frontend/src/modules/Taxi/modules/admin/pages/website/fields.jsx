import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react'
import { adminService } from '../../services/adminService'

export const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400'

export const setIn = (obj, path, value) => {
  const keys = path.split('.')
  const next = Array.isArray(obj) ? [...obj] : { ...obj }
  let cur = next
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      cur[k] = value
    } else {
      cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...(cur[k] || {}) }
      cur = cur[k]
    }
  })
  return next
}
export const getIn = (obj, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), obj)

export const Card = ({ title, hint, children, right }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      </div>
      {right}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
)

export const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
  </label>
)

export const Text = ({ label, value, onChange, hint, placeholder, multiline, rows = 3 }) => (
  <Field label={label} hint={hint}>
    {multiline ? (
      <textarea className={inputCls} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input className={inputCls} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    )}
  </Field>
)

export const Toggle = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-300"
  >
    <span className="text-sm font-semibold text-gray-800">{label}</span>
    <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </span>
  </button>
)

export const ImageField = ({ label, value, onChange, hint }) => {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const pick = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErr('Please choose an image file')
    if (file.size > 6 * 1024 * 1024) return setErr('Image must be under 6 MB')
    setErr('')
    setBusy(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await adminService.uploadImage(reader.result)
        const url = res?.data?.url || res?.url
        if (!url) throw new Error('Upload failed')
        onChange(url)
      } catch (e) {
        setErr(e?.message || 'Upload failed')
      } finally {
        setBusy(false)
      }
    }
    reader.onerror = () => { setBusy(false); setErr('Could not read the file') }
    reader.readAsDataURL(file)
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-gray-400" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input className={inputCls} value={value ?? ''} placeholder="Image URL or upload" onChange={(e) => onChange(e.target.value)} />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => ref.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {busy ? 'Uploading…' : 'Upload'}
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50">
                Remove
              </button>
            )}
          </div>
          {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
        </div>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
      </div>
    </Field>
  )
}

/** A list the admin can add to, remove from and reorder. `blank` makes a new row. */
export const ListEditor = ({ label, items = [], onChange, blank, renderItem, itemTitle, addLabel = 'Add item' }) => {
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div>
      {label && <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">{itemTitle ? itemTitle(item, i) : `#${i + 1}`}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-gray-500 hover:bg-white disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-lg p-1.5 text-gray-500 hover:bg-white disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="space-y-3">{renderItem(item, (patch) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it))), i)}</div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, typeof blank === 'function' ? blank() : { ...blank }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  )
}

/** A list of plain strings (bullet points). */
export const StringList = ({ label, items = [], onChange, addLabel = 'Add point' }) => (
  <div>
    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
    <div className="space-y-2">
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input className={inputCls} value={v} onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} />
          <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="rounded-xl p-2.5 text-rose-500 hover:bg-rose-50" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
    <button type="button" onClick={() => onChange([...items, ''])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700">
      <Plus className="h-4 w-4" /> {addLabel}
    </button>
  </div>
)

export const Select = ({ label, value, onChange, options }) => (
  <Field label={label}>
    <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
)

export const CtaFields = ({ label, value = {}, onChange }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <Text label={`${label} — text`} value={value.label} onChange={(v) => onChange({ ...value, label: v })} />
    <Text label={`${label} — link`} value={value.href} onChange={(v) => onChange({ ...value, href: v })} placeholder="#app or https://…" />
  </div>
)
