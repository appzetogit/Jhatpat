import { Check, Star } from 'lucide-react'
import { Container, Cta, Icon, Reveal, SectionHead } from '../shared'

export function Features({ data }) {
  if (!data?.items?.length) return null
  return (
    <section id="features" className="bg-[#F7F8FA] py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-3xl bg-white p-7 ring-1 ring-[#15171C]/6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_50px_-28px_rgba(21,23,28,0.35)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#15171C] transition-colors group-hover:bg-[#FFB400]">
                  <Icon name={f.icon} className="h-7 w-7 text-[#FFB400] transition-colors group-hover:text-[#15171C]" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight text-[#15171C]">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5B6070]">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

const StoreBadge = ({ href, label, small }) => {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-2xl bg-[#15171C] px-5 py-3 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#2A2D34]"
    >
      <Icon name="phone" className="h-6 w-6 text-[#FFB400]" />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/60">{small}</span>
        <span className="block text-base font-extrabold">{label}</span>
      </span>
    </a>
  )
}

export function AppDownload({ data }) {
  if (!data) return null
  const hasStores = data.playStoreUrl || data.appStoreUrl
  return (
    <section id="app" className="bg-white py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#FFB400] via-[#FFC21F] to-[#FF8A00] px-7 py-14 sm:px-14 lg:py-0">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/25 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="lg:py-20">
              <Reveal>
                <span className="inline-block rounded-full bg-[#15171C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#15171C]">
                  {data.eyebrow}
                </span>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#15171C] sm:text-5xl">{data.title}</h2>
                <p className="mt-4 max-w-lg text-lg leading-relaxed text-[#15171C]/75">{data.subtitle}</p>
                {Array.isArray(data.points) && (
                  <ul className="mt-6 space-y-2.5">
                    {data.points.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-[15px] font-bold text-[#15171C]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#15171C]">
                          <Check className="h-3.5 w-3.5 text-[#FFB400]" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  {hasStores ? (
                    <>
                      <StoreBadge href={data.playStoreUrl} small="Get it on" label="Google Play" />
                      <StoreBadge href={data.appStoreUrl} small="Download on the" label="App Store" />
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#15171C] px-6 py-3.5 text-[15px] font-bold text-white">
                      <Icon name="clock" className="h-4 w-4 text-[#FFB400]" />
                      Apps launching soon
                    </span>
                  )}
                </div>
              </Reveal>
            </div>
            {data.image && (
              <Reveal y={30} className="flex justify-center lg:justify-end">
                <img src={data.image} alt="Jhatpat app" loading="lazy" className="w-full max-w-[460px] lg:translate-y-8" />
              </Reveal>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

export function Partner({ data }) {
  if (!data) return null
  return (
    <section id="partner" className="bg-[#15171C] py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        {data.image && (
          <Reveal y={30}>
            <div className="relative">
              <div className="absolute -inset-3 -z-0 -rotate-2 rounded-[36px] bg-[#FFB400]/20" />
              <img src={data.image} alt="" loading="lazy" className="relative w-full rounded-[32px] object-cover ring-1 ring-white/10" />
            </div>
          </Reveal>
        )}
        <div>
          <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} center={false} dark />
          {Array.isArray(data.points) && (
            <ul className="mt-8 space-y-3.5">
              {data.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-base font-semibold text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFB400]">
                    <Check className="h-4 w-4 text-[#15171C]" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-9">
            <Cta cta={data.cta} variant="accent" />
          </div>
        </div>
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
            <Reveal key={t.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl bg-[#F7F8FA] p-7 ring-1 ring-[#15171C]/6">
                <div className="flex gap-1" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="h-5 w-5 fill-[#FFB400] text-[#FFB400]" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-[16px] font-medium leading-relaxed text-[#2A2D34]">“{t.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15171C] text-base font-extrabold text-[#FFB400]">
                    {(t.name || '?').charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-[#15171C]">{t.name}</span>
                    <span className="block text-[13px] text-[#6B7080]">{t.role}</span>
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
