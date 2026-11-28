import { Check } from 'lucide-react'
import { artFor } from '../Art'
import { Container, Cta, HEADING, Icon, Reveal, SectionHead, toneAt, toneOf } from '../shared'

export function Trust({ data }) {
  if (!data?.items?.length) return null
  return (
    <section className="border-y border-slate-200 bg-slate-50/60">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item, i) => {
            const t = toneAt(i)
            return (
              <Reveal key={item.title} delay={i * 0.05}>
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: t.bg }}>
                    <Icon name={item.icon} className="h-5 w-5" style={{ color: t.fg }} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
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

export function Services({ data }) {
  if (!data?.items?.length) return null
  return (
    <section id="services" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {data.items.map((item, i) => {
            const tone = toneOf(item.accent)
            return (
              <Reveal key={item.title} delay={i * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)]">
                  <div className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${tone.grad}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      (() => {
                        const Art = artFor(item)
                        return (
                          <>
                            <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20" style={{ background: tone.solid }} />
                            <span className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full opacity-10" style={{ background: tone.solid }} />
                            {Art ? (
                              <Art className="relative w-52 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1" />
                            ) : (
                              <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-900/5">
                                <Icon name={item.icon} className="h-9 w-9" strokeWidth={1.75} style={{ color: tone.solid }} />
                              </span>
                            )}
                          </>
                        )
                      })()
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3 className={`${HEADING} text-[1.4rem] font-semibold tracking-tight text-slate-900`}>{item.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-7 text-slate-600">{item.text}</p>
                    {Array.isArray(item.points) && item.points.length > 0 && (
                      <ul className="mt-5 space-y-3">
                        {item.points.map((p) => (
                          <li key={p} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: tone.bg }}>
                              <Check className="h-3 w-3" style={{ color: tone.fg }} strokeWidth={3} />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.cta?.label && (
                      <div className="mt-auto pt-7">
                        <Cta cta={item.cta} variant="ghost" className="w-full" arrow />
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export function How({ data }) {
  if (!data?.steps?.length) return null
  return (
    <section id="how" className="scroll-mt-20 bg-[#FFF8E6] py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="relative mt-14 grid gap-5 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[3.4rem] hidden h-px border-t-2 border-dashed border-slate-300 md:block" />
          {data.steps.map((s, i) => {
            const t = toneAt(i === 0 ? 0 : i === 1 ? 2 : 3)
            return (
              <Reveal key={s.title} delay={i * 0.1}>
                <div className="relative h-full rounded-3xl border border-slate-200 bg-white p-7 text-center">
                  <span
                    className={`${HEADING} relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg`}
                    style={{ background: t.solid }}
                  >
                    {i + 1}
                  </span>
                  <h3 className={`${HEADING} mt-5 text-xl font-semibold text-slate-900`}>{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">{s.text}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
