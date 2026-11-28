import { Apple, Check, Play, Star } from 'lucide-react'
import { Container, Cta, HEADING, Icon, Reveal, SectionHead, toneAt } from '../shared'
import PhoneMockup from '../PhoneMockup'

export function Features({ data }) {
  if (!data?.items?.length) return null
  return (
    <section id="features" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((f, i) => {
            const t = toneAt(i)
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.07}>
                <div className="flex gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: t.bg }}>
                    <Icon name={f.icon} className="h-6 w-6" style={{ color: t.fg }} />
                  </span>
                  <div>
                    <h3 className={`${HEADING} text-lg font-semibold text-slate-900`}>{f.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-7 text-slate-600">{f.text}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

const StoreButton = ({ href, kind }) => {
  if (!href) return null
  const isApple = kind === 'apple'
  const I = isApple ? Apple : Play
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-14 items-center gap-3 rounded-xl bg-black px-5 text-white ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:bg-slate-900"
    >
      <I className={`h-7 w-7 ${isApple ? 'fill-white' : 'fill-white'}`} />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-wider text-white/70">{isApple ? 'Download on the' : 'Get it on'}</span>
        <span className={`${HEADING} block text-[17px] font-semibold`}>{isApple ? 'App Store' : 'Google Play'}</span>
      </span>
    </a>
  )
}

export const hasStoreLinks = (data) => Boolean(data?.playStoreUrl || data?.appStoreUrl)

/* Shown only when at least one store link is set; with none there is nothing to
   download, so the whole block (and every link pointing at it) is left out. */
export function AppDownload({ data }) {
  if (!hasStoreLinks(data)) return null
  return (
    <section id="app" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-7 pt-14 sm:px-14 lg:pt-0">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#FFB400]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-[#FFB400]/10 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="pb-14 lg:py-20">
              <Reveal>
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#FFB400]">{data.eyebrow}</p>
                <h2 className={`${HEADING} mt-3 text-[2rem] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-[2.6rem]`}>{data.title}</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-slate-300 sm:text-[1.0625rem]">{data.subtitle}</p>
                {Array.isArray(data.points) && data.points.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {data.points.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-[15px] font-medium text-white">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB400]">
                          <Check className="h-3 w-3 text-slate-900" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-9 flex flex-wrap gap-3">
                  <StoreButton href={data.playStoreUrl} kind="play" />
                  <StoreButton href={data.appStoreUrl} kind="apple" />
                </div>
              </Reveal>
            </div>
            <Reveal y={30} className="flex justify-center lg:justify-end">
              {data.image ? (
                <img src={data.image} alt="Jhatpat app" loading="lazy" className="w-full max-w-[440px] lg:translate-y-8" />
              ) : (
                <div className="lg:translate-y-14">
                  <PhoneMockup />
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function Partner({ data }) {
  if (!data) return null
  const points = Array.isArray(data.points) ? data.points : []
  return (
    <section id="partner" className="scroll-mt-20 bg-slate-950 py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} center={false} dark />
          <div className="mt-9">
            <Cta cta={data.cta} variant="accent" arrow />
          </div>
        </div>
        {data.image ? (
          <Reveal y={24}>
            <img src={data.image} alt="" loading="lazy" className="w-full rounded-3xl object-cover ring-1 ring-white/10" />
          </Reveal>
        ) : (
          <div className="space-y-4">
            {points.map((p, i) => {
              const t = toneAt(i === 0 ? 0 : i === 1 ? 3 : 2)
              return (
                <Reveal key={p} delay={i * 0.08}>
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-colors hover:bg-white/[0.07]">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: t.bg }}>
                      <Icon name={['wallet', 'clock', 'shield', 'heart'][i % 4]} className="h-6 w-6" style={{ color: t.fg }} />
                    </span>
                    <p className={`${HEADING} text-[1.05rem] font-medium text-white`}>{p}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        )}
      </Container>
    </section>
  )
}

export function Testimonials({ data }) {
  if (!data?.items?.length) return null
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {data.items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7">
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((s) => <Star key={s} className="h-[18px] w-[18px] fill-[#FFB400] text-[#FFB400]" />)}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-slate-700">“{t.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-[#FFB400]">
                    {(t.name || '?').charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{t.name}</span>
                    <span className="block text-[13px] text-slate-500">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function Gallery({ data }) {
  const items = (data?.items || []).filter((g) => g?.image)
  if (!items.length) return null
  return (
    <section id="gallery" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-14 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[260px]">
          {items.map((g, i) => (
            <Reveal key={`${g.image}-${i}`} delay={(i % 3) * 0.07} className={i % 5 === 0 ? 'lg:row-span-2' : ''}>
              <figure className="group relative h-full overflow-hidden rounded-3xl bg-slate-100">
                <img src={g.image} alt={g.caption || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {g.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-[15px] font-semibold text-white">
                    {g.caption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
