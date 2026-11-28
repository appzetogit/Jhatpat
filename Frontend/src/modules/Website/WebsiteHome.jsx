import { useEffect } from 'react'
import { useWebsite } from './shared'
import Header from './sections/Header'
import Hero from './sections/Hero'
import { Trust, Services, How } from './sections/TrustAndServices'
import { Features, AppDownload, Partner, Testimonials } from './sections/Showcase'
import { Faq, Contact, Footer } from './sections/FaqContactFooter'

const Skeleton = () => (
  <div className="min-h-screen bg-[#FFFBF0]" aria-busy="true">
    <div className="mx-auto max-w-[1200px] px-5 pt-28 sm:px-8">
      <div className="h-6 w-56 animate-pulse rounded-full bg-[#15171C]/8" />
      <div className="mt-6 h-14 w-full max-w-xl animate-pulse rounded-2xl bg-[#15171C]/8" />
      <div className="mt-3 h-14 w-3/4 max-w-md animate-pulse rounded-2xl bg-[#15171C]/8" />
      <div className="mt-8 h-24 w-full max-w-lg animate-pulse rounded-2xl bg-[#15171C]/6" />
    </div>
  </div>
)

const Message = ({ title, text }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#FFFBF0] px-6 text-center">
    <div>
      <img src="/site/logo.png" alt="Jhatpat" className="mx-auto h-24 w-24 object-contain" />
      <h1 className="mt-4 text-2xl font-extrabold text-[#15171C]">{title}</h1>
      <p className="mt-2 text-[#5B6070]">{text}</p>
    </div>
  </div>
)

export default function WebsiteHome() {
  const { loading, content, published, error } = useWebsite()

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

  if (loading) return <Skeleton />
  if (!published) return <Message title="We'll be back soon" text="Our website is being updated. Please check back shortly." />
  if (error || !content) return <Message title="Something went wrong" text="We could not load this page. Please refresh in a moment." />

  const on = (key) => content.sections?.[key] !== false

  return (
    <div className="bg-white font-sans text-[#15171C] antialiased" style={{ fontFamily: "'Poppins', 'Inter', system-ui, sans-serif" }}>
      <Header brand={content.brand} nav={content.nav} cta={content.navCta} />
      <main>
        {on('hero') && <Hero data={content.hero} />}
        {on('trust') && <Trust data={content.trust} />}
        {on('services') && <Services data={content.services} />}
        {on('how') && <How data={content.how} />}
        {on('features') && <Features data={content.features} />}
        {on('app') && <AppDownload data={content.app} />}
        {on('partner') && <Partner data={content.partner} />}
        {on('testimonials') && <Testimonials data={content.testimonials} />}
        {on('faq') && <Faq data={content.faq} />}
        {on('contact') && <Contact data={content.contact} />}
      </main>
      <Footer brand={content.brand} footer={content.footer} social={content.social} contact={content.contact} />
    </div>
  )
}
