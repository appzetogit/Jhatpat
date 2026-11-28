import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BODY, HEADING, Container } from './shared'

/* The one public page for Terms, Privacy, Refund, Cancellation, Shipping and About.
   Every app and the website link here. The text is written once, in
   Master settings > Legal pages. */
const unescape = (t) => String(t || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')

export default function PolicyPage({ kind }) {
  const navigate = useNavigate()
  const [page, setPage] = useState({ loading: true, title: '', content: '' })

  useEffect(() => {
    let alive = true
    fetch(`/api/v1/platform/page/${kind}`)
      .then((r) => r.json())
      .then((b) => alive && setPage({ loading: false, title: b?.data?.title || '', content: unescape(b?.data?.content) }))
      .catch(() => alive && setPage({ loading: false, title: '', content: '' }))
    window.scrollTo(0, 0)
    return () => { alive = false }
  }, [kind])

  useEffect(() => { if (page.title) document.title = `${page.title} | Jhatpat` }, [page.title])

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/'))

  return (
    <div className={`${BODY} min-h-screen bg-slate-50 text-slate-900`}>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <Container className="flex h-16 items-center gap-3">
          <button type="button" onClick={back} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <a href="/" className="flex items-center gap-2">
            <img src="/site/logo.png" alt="Jhatpat" className="h-10 w-10 object-contain" />
          </a>
        </Container>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className={`${HEADING} text-3xl font-bold tracking-tight sm:text-4xl`}>{page.title}</h1>
        {page.loading ? (
          <div className="mt-8 space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-4 animate-pulse rounded bg-slate-200" />)}</div>
        ) : page.content ? (
          <article
            className="mt-8 text-[15px] leading-7 text-slate-700 [&_a]:text-amber-700 [&_a]:underline [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:mt-1.5 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mt-4 [&_ul]:ml-5 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="mt-8 text-slate-600">This page is being updated. Please check back soon.</p>
        )}
      </main>
    </div>
  )
}
