import { useEffect, useMemo } from 'react'
import { BODY, SiteProvider, makeAnchorCheck, useWebsite } from './shared'
import { Marquee } from './Art'
import Header from './sections/Header'
import Hero from './sections/Hero'
import { Trust, Services, How } from './sections/TrustAndServices'
import { Features, AppDownload, Partner, Testimonials, Gallery, hasStoreLinks } from './sections/Showcase'
import { Faq, Contact, Footer } from './sections/FaqContactFooter'

const Skeleton = () => (
  <div className="min-h-screen bg-white" aria-busy="true">
    <div className="mx-auto max-w-[1180px] px-5 pt-28 sm:px-8">
      <div className="h-5 w-48 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-6 h-12 w-full max-w-xl animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-3 h-12 w-3/4 max-w-md animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-8 h-20 w-full max-w-lg animate-pulse rounded-xl bg-slate-50" />
    </div>
  </div>
)

const Message = ({ title, text }) => (
  <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
    <div>
      <img src="/site/logo.png" alt="Jhatpat" className="mx-auto h-24 w-24 object-contain" />
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{text}</p>
    </div>
  </div>
)

export default function WebsiteHome() {
  const { loading, content, published, error } = useWebsite()

  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'
    return () => { root.style.scrollBehavior = prev }
  }, [])

  useEffect(() => {
    if (!content?.seo) return
    if (content.seo.title) document.title = content.seo.title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    if (content.seo.description) meta.content = content.seo.description
  }, [content])

  // Which anchors exist on this render, so no button or menu link points at a
  // section that is switched off, empty, or (for the app block) has no store link.
  const visible = useMemo(() => {
    if (!content) return new Set()
    const on = (k) => content.sections?.[k] !== false
    const ids = new Set()
    if (on('services') && content.services?.items?.length) ids.add('services')
    if (on('how') && content.how?.steps?.length) ids.add('how')
    if (on('features') && content.features?.items?.length) ids.add('features')
    if (on('app') && hasStoreLinks(content.app)) ids.add('app')
    if (on('partner') && content.partner) ids.add('partner')
    if (on('faq') && content.faq?.items?.length) ids.add('faq')
    if (on('contact') && content.contact) ids.add('contact')
    return ids
  }, [content])
  const site = useMemo(() => ({ ok: makeAnchorCheck(visible) }), [visible])

  if (loading) return <Skeleton />
  if (!published) return <Message title="We'll be back soon" text="Our website is being updated. Please check back shortly." />
  if (error || !content) return <Message title="Something went wrong" text="We could not load this page. Please refresh in a moment." />

  const on = (key) => content.sections?.[key] !== false
  const marquee = (content.services?.items || []).map((s) => s.title).concat(content.hero?.chips || []).filter(Boolean)

  return (
    <SiteProvider value={site}>
      <div className={`${BODY} bg-white text-slate-900 antialiased`}>
        <Header brand={content.brand} nav={content.nav} cta={content.navCta} />
        <main>
          {on('hero') && <Hero data={content.hero} />}
          {on('hero') && <Marquee items={marquee} />}
          {on('trust') && <Trust data={content.trust} />}
          {on('services') && <Services data={content.services} />}
          {on('how') && <How data={content.how} />}
          {on('features') && <Features data={content.features} />}
          {on('app') && <AppDownload data={content.app} />}
          {on('partner') && <Partner data={content.partner} />}
          {on('gallery') && <Gallery data={content.gallery} />}
          {on('testimonials') && <Testimonials data={content.testimonials} />}
          {on('faq') && <Faq data={content.faq} />}
          {on('contact') && <Contact data={content.contact} />}
        </main>
        <Footer brand={content.brand} footer={content.footer} social={content.social} contact={content.contact} canGo={site.ok} />
      </div>
    </SiteProvider>
  )
}
