import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, RotateCcw, Save } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Card, CtaFields, ImageField, ListEditor, Select, StringList, Text, Toggle, getIn, setIn } from './fields'

const ICON_OPTIONS = ['car', 'food', 'parcel', 'bike', 'truck', 'shield', 'pin', 'wallet', 'headset', 'bolt', 'gift', 'star', 'clock', 'badge', 'phone', 'heart']
const ICONS = ICON_OPTIONS.map((v) => ({ value: v, label: v }))
const ACCENTS = ['yellow', 'red', 'blue', 'green'].map((v) => ({ value: v, label: v }))

const SECTION_LABELS = {
  hero: 'Hero', trust: 'Trust bar', services: 'Services', how: 'How it works', features: 'Features',
  app: 'App download', partner: 'Partner with us', gallery: 'Gallery', testimonials: 'Testimonials', faq: 'FAQs', contact: 'Contact',
}

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'hero', label: 'Hero' },
  { id: 'trust', label: 'Trust bar' },
  { id: 'services', label: 'Services' },
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'app', label: 'App download' },
  { id: 'partner', label: 'Partner' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQs' },
  { id: 'contact', label: 'Contact & social' },
  { id: 'footer', label: 'Footer & SEO' },
]

export default function WebsiteEditor() {
  const [content, setContent] = useState(null)
  const [saved, setSaved] = useState('')
  const [published, setPublished] = useState(true)
  const [tab, setTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const apply = (res) => {
    const data = res?.data || {}
    setContent(data.content)
    setSaved(JSON.stringify(data.content))
    setPublished(data.published !== false)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      apply(await adminService.getWebsite())
    } catch (e) {
      setNotice({ type: 'error', text: e?.message || 'Could not load the website content' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const dirty = useMemo(() => content && JSON.stringify(content) !== saved, [content, saved])

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = (path, value) => setContent((c) => setIn(c, path, value))
  const bind = (path) => ({ value: getIn(content, path), onChange: (v) => set(path, v) })

  const save = async () => {
    setSaving(true)
    setNotice(null)
    try {
      apply(await adminService.saveWebsite({ content, published }))
      setNotice({ type: 'ok', text: 'Saved. Your website is updated.' })
    } catch (e) {
      setNotice({ type: 'error', text: e?.message || 'Could not save' })
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    if (!window.confirm('Reset the whole website to the original Jhatpat content? Your edits will be lost.')) return
    setSaving(true)
    try {
      apply(await adminService.resetWebsite())
      setNotice({ type: 'ok', text: 'Website reset to the default content.' })
    } catch (e) {
      setNotice({ type: 'error', text: e?.message || 'Could not reset' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>
  }
  if (!content) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
        {notice?.text || 'Could not load the website content.'}
        <button onClick={load} className="ml-3 underline">Retry</button>
      </div>
    )
  }

  const panel = {
    general: (
      <>
        <Card title="Website status" hint="Turn the public website off while you work on it.">
          <Toggle label={published ? 'Website is live' : 'Website is hidden (visitors see a maintenance message)'} checked={published} onChange={setPublished} />
        </Card>
        <Card title="Sections" hint="Show or hide whole sections of the home page.">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.keys(SECTION_LABELS).map((key) => (
              <Toggle key={key} label={SECTION_LABELS[key]} checked={content.sections?.[key] !== false} onChange={(v) => set(`sections.${key}`, v)} />
            ))}
          </div>
        </Card>
        <Card title="Brand">
          <Text label="Brand name" {...bind('brand.name')} />
          <ImageField label="Logo" hint="Square image, at least 256 px. Shown in the header and footer." {...bind('brand.logo')} />
        </Card>
        <Card title="Top menu">
          <ListEditor
            items={content.nav}
            onChange={(v) => set('nav', v)}
            blank={{ label: '', href: '' }}
            addLabel="Add menu link"
            itemTitle={(it) => it.label || 'New link'}
            renderItem={(it, up) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label="Text" value={it.label} onChange={(v) => up({ label: v })} />
                <Text label="Link" value={it.href} onChange={(v) => up({ href: v })} placeholder="#services or /taxi/about" />
              </div>
            )}
          />
          <CtaFields label="Header button" value={content.navCta} onChange={(v) => set('navCta', v)} />
        </Card>
      </>
    ),

    hero: (
      <>
        <Card title="Hero">
          <Text label="Small label above the title" {...bind('hero.eyebrow')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Title" {...bind('hero.title')} />
            <Text label="Highlighted words" hint="Shown in a colour gradient after the title." {...bind('hero.highlight')} />
          </div>
          <Text label="Subtitle" multiline {...bind('hero.subtitle')} />
          <CtaFields label="Main button" value={content.hero.primaryCta} onChange={(v) => set('hero.primaryCta', v)} />
          <CtaFields label="Second button" value={content.hero.secondaryCta} onChange={(v) => set('hero.secondaryCta', v)} />
          <ImageField label="Hero image (optional)" hint="Leave empty to show the built-in app preview. Use a tall app screenshot or transparent PNG if you upload one." {...bind('hero.image')} />
        </Card>
        <Card title="Service chips">
          <StringList label="Chips" items={content.hero.chips} onChange={(v) => set('hero.chips', v)} addLabel="Add chip" />
        </Card>
        <Card title="Numbers">
          <ListEditor
            items={content.hero.stats}
            onChange={(v) => set('hero.stats', v)}
            blank={{ value: '', label: '' }}
            addLabel="Add number"
            itemTitle={(it) => it.value || 'New number'}
            renderItem={(it, up) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label="Value" value={it.value} onChange={(v) => up({ value: v })} placeholder="1 Lakh+" />
                <Text label="Label" value={it.label} onChange={(v) => up({ label: v })} />
              </div>
            )}
          />
        </Card>
      </>
    ),

    trust: (
      <Card title="Trust bar">
        <Text label="Heading" {...bind('trust.title')} />
        <ListEditor
          items={content.trust.items}
          onChange={(v) => set('trust.items', v)}
          blank={{ icon: 'shield', title: '', text: '' }}
          itemTitle={(it) => it.title || 'New item'}
          renderItem={(it, up) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label="Title" value={it.title} onChange={(v) => up({ title: v })} />
                <Select label="Icon" value={it.icon} onChange={(v) => up({ icon: v })} options={ICONS} />
              </div>
              <Text label="Text" multiline rows={2} value={it.text} onChange={(v) => up({ text: v })} />
            </>
          )}
        />
      </Card>
    ),

    services: (
      <Card title="Services">
        <Text label="Small label" {...bind('services.eyebrow')} />
        <Text label="Heading" {...bind('services.title')} />
        <Text label="Subheading" {...bind('services.subtitle')} />
        <ListEditor
          items={content.services.items}
          onChange={(v) => set('services.items', v)}
          blank={{ icon: 'car', title: '', text: '', points: [], image: '', cta: { label: '', href: '#app' }, accent: 'yellow' }}
          addLabel="Add service"
          itemTitle={(it) => it.title || 'New service'}
          renderItem={(it, up) => (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Text label="Title" value={it.title} onChange={(v) => up({ title: v })} />
                <Select label="Icon" value={it.icon} onChange={(v) => up({ icon: v })} options={ICONS} />
                <Select label="Accent colour" value={it.accent} onChange={(v) => up({ accent: v })} options={ACCENTS} />
              </div>
              <Text label="Description" multiline rows={2} value={it.text} onChange={(v) => up({ text: v })} />
              <StringList label="Bullet points" items={it.points || []} onChange={(v) => up({ points: v })} />
              <ImageField label="Image (optional)" hint="Leave empty to show the coloured icon header. A 4:3 photo works best." value={it.image} onChange={(v) => up({ image: v })} />
              <CtaFields label="Button" value={it.cta} onChange={(v) => up({ cta: v })} />
            </>
          )}
        />
      </Card>
    ),

    how: (
      <Card title="How it works">
        <Text label="Small label" {...bind('how.eyebrow')} />
        <Text label="Heading" {...bind('how.title')} />
        <ListEditor
          label="Steps"
          items={content.how.steps}
          onChange={(v) => set('how.steps', v)}
          blank={{ title: '', text: '' }}
          addLabel="Add step"
          itemTitle={(it, i) => `Step ${i + 1}${it.title ? ` — ${it.title}` : ''}`}
          renderItem={(it, up) => (
            <>
              <Text label="Title" value={it.title} onChange={(v) => up({ title: v })} />
              <Text label="Text" multiline rows={2} value={it.text} onChange={(v) => up({ text: v })} />
            </>
          )}
        />
      </Card>
    ),

    features: (
      <Card title="Features">
        <Text label="Small label" {...bind('features.eyebrow')} />
        <Text label="Heading" {...bind('features.title')} />
        <Text label="Subheading" {...bind('features.subtitle')} />
        <ListEditor
          items={content.features.items}
          onChange={(v) => set('features.items', v)}
          blank={{ icon: 'bolt', title: '', text: '' }}
          addLabel="Add feature"
          itemTitle={(it) => it.title || 'New feature'}
          renderItem={(it, up) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label="Title" value={it.title} onChange={(v) => up({ title: v })} />
                <Select label="Icon" value={it.icon} onChange={(v) => up({ icon: v })} options={ICONS} />
              </div>
              <Text label="Text" multiline rows={2} value={it.text} onChange={(v) => up({ text: v })} />
            </>
          )}
        />
      </Card>
    ),

    app: (
      <Card title="App download" hint="This whole section is hidden until you add a Google Play or App Store link.">
        <Text label="Small label" {...bind('app.eyebrow')} />
        <Text label="Heading" {...bind('app.title')} />
        <Text label="Subheading" multiline rows={2} {...bind('app.subtitle')} />
        <ImageField label="Phone image (optional)" hint="Leave empty to show the built-in app preview." {...bind('app.image')} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Google Play link" placeholder="https://play.google.com/…" {...bind('app.playStoreUrl')} />
          <Text label="App Store link" placeholder="https://apps.apple.com/…" {...bind('app.appStoreUrl')} />
        </div>
        <StringList label="Points" items={content.app.points} onChange={(v) => set('app.points', v)} />
      </Card>
    ),

    partner: (
      <Card title="Partner with us">
        <Text label="Small label" {...bind('partner.eyebrow')} />
        <Text label="Heading" {...bind('partner.title')} />
        <Text label="Subheading" multiline rows={2} {...bind('partner.subtitle')} />
        <ImageField label="Image (optional)" hint="Leave empty to show the benefit cards." {...bind('partner.image')} />
        <StringList label="Points" items={content.partner.points} onChange={(v) => set('partner.points', v)} />
        <CtaFields label="Button" value={content.partner.cta} onChange={(v) => set('partner.cta', v)} />
      </Card>
    ),

    gallery: (
      <Card title="Gallery" hint="Upload photos of your cars, riders, food or team. The section stays hidden until you add at least one photo.">
        <Text label="Small label" {...bind('gallery.eyebrow')} />
        <Text label="Heading" {...bind('gallery.title')} />
        <Text label="Subheading" multiline rows={2} {...bind('gallery.subtitle')} />
        <ListEditor
          items={content.gallery.items}
          onChange={(v) => set('gallery.items', v)}
          blank={{ image: '', caption: '' }}
          addLabel="Add photo"
          itemTitle={(it) => it.caption || 'New photo'}
          renderItem={(it, up) => (
            <>
              <ImageField label="Photo" value={it.image} onChange={(v) => up({ image: v })} />
              <Text label="Caption" value={it.caption} onChange={(v) => up({ caption: v })} />
            </>
          )}
        />
      </Card>
    ),

    testimonials: (
      <Card title="Testimonials" hint="Off by default. Add real customer or captain quotes here, then switch the section on under General.">
        <Text label="Small label" {...bind('testimonials.eyebrow')} />
        <Text label="Heading" {...bind('testimonials.title')} />
        <ListEditor
          items={content.testimonials.items}
          onChange={(v) => set('testimonials.items', v)}
          blank={{ name: '', role: '', text: '' }}
          addLabel="Add testimonial"
          itemTitle={(it) => it.name || 'New testimonial'}
          renderItem={(it, up) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label="Name" value={it.name} onChange={(v) => up({ name: v })} />
                <Text label="Role" value={it.role} onChange={(v) => up({ role: v })} />
              </div>
              <Text label="What they said" multiline rows={3} value={it.text} onChange={(v) => up({ text: v })} />
            </>
          )}
        />
      </Card>
    ),

    faq: (
      <Card title="FAQs">
        <Text label="Small label" {...bind('faq.eyebrow')} />
        <Text label="Heading" {...bind('faq.title')} />
        <ListEditor
          items={content.faq.items}
          onChange={(v) => set('faq.items', v)}
          blank={{ question: '', answer: '' }}
          addLabel="Add question"
          itemTitle={(it) => it.question || 'New question'}
          renderItem={(it, up) => (
            <>
              <Text label="Question" value={it.question} onChange={(v) => up({ question: v })} />
              <Text label="Answer" multiline rows={3} value={it.answer} onChange={(v) => up({ answer: v })} />
            </>
          )}
        />
      </Card>
    ),

    contact: (
      <>
        <Card title="Contact">
          <Text label="Small label" {...bind('contact.eyebrow')} />
          <Text label="Heading" {...bind('contact.title')} />
          <Text label="Subheading" {...bind('contact.subtitle')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Phone" {...bind('contact.phone')} />
            <Text label="Email" {...bind('contact.email')} />
            <Text label="Address" {...bind('contact.address')} />
            <Text label="Support hours" {...bind('contact.hours')} />
          </div>
        </Card>
        <Card title="Social links" hint="Only links you fill in are shown in the footer.">
          <div className="grid gap-3 sm:grid-cols-2">
            {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((k) => (
              <Text key={k} label={k} placeholder="https://…" {...bind(`social.${k}`)} />
            ))}
          </div>
        </Card>
      </>
    ),

    footer: (
      <>
        <Card title="Footer">
          <Text label="About text" multiline rows={2} {...bind('footer.about')} />
          <Text label="Copyright text" hint="The year is added automatically." {...bind('footer.copyright')} />
          <ListEditor
            label="Links"
            items={content.footer.links}
            onChange={(v) => set('footer.links', v)}
            blank={{ label: '', href: '' }}
            addLabel="Add link"
            itemTitle={(it) => it.label || 'New link'}
            renderItem={(it, up) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label="Text" value={it.label} onChange={(v) => up({ label: v })} />
                <Text label="Link" value={it.href} onChange={(v) => up({ href: v })} />
              </div>
            )}
          />
        </Card>
        <Card title="Search engines (SEO)">
          <Text label="Page title" hint="Shown in the browser tab and Google results." {...bind('seo.title')} />
          <Text label="Description" multiline rows={3} {...bind('seo.description')} />
        </Card>
      </>
    ),
  }[tab]

  return (
    <div className="mx-auto max-w-[1100px] pb-28">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Website</h1>
          <p className="mt-1 text-sm text-gray-500">Everything on the public home page is edited here. Changes go live when you press Save.</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
            <ExternalLink className="h-4 w-4" /> View website
          </a>
          <button onClick={reset} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${tab === t.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">{panel}</div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:left-[280px]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0 text-sm font-semibold">
            {notice ? (
              <span className={`inline-flex items-center gap-2 ${notice.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {notice.type === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {notice.text}
              </span>
            ) : dirty ? (
              <span className="text-amber-600">You have unsaved changes</span>
            ) : (
              <span className="text-gray-400">All changes saved</span>
            )}
          </div>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
