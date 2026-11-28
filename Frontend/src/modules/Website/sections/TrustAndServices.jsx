import { Check } from 'lucide-react'
import { Container, Cta, Icon, Reveal, SectionHead, accentOf } from '../shared'

export function Trust({ data }) {
  if (!data?.items?.length) return null
  return (
    <section className="relative z-10 -mt-1 bg-white">
      <Container className="py-14 sm:py-16">
        {data.title && (
          <Reveal>
            <p className="text-center text-sm font-bold uppercase tracking-[0.16em] text-[#8A8F9C]">{data.title}</p>
          </Reveal>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-[#15171C]/8 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(21,23,28,0.25)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF3C4]">
                  <Icon name={item.icon} className="h-6 w-6 text-[#15171C]" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#15171C]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#5B6070]">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function Services({ data }) {
  if (!data?.items?.length) return null
  return (
    <section id="services" className="bg-[#F7F8FA] py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {data.items.map((item, i) => {
            const accent = accentOf(item.accent)
            return (
              <Reveal key={item.title} delay={i * 0.1}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_2px_0_rgba(21,23,28,0.04),0_30px_60px_-30px_rgba(21,23,28,0.3)] ring-1 ring-[#15171C]/6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_40px_70px_-30px_rgba(21,23,28,0.4)]">
                  <div className="relative aspect-[4/3] overflow-hidden" style={{ background: accent.soft }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <span
                      className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
                      style={{ background: accent.solid }}
                    >
                      <Icon name={item.icon} className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="text-2xl font-extrabold tracking-tight text-[#15171C]">{item.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#5B6070]">{item.text}</p>
                    {Array.isArray(item.points) && (
                      <ul className="mt-5 space-y-2.5">
                        {item.points.map((p) => (
                          <li key={p} className="flex items-center gap-2.5 text-sm font-semibold text-[#2A2D34]">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: accent.soft }}>
                              <Check className="h-3 w-3" style={{ color: accent.ink }} strokeWidth={3} />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-7">
                      <Cta cta={item.cta} variant="primary" className="w-full" />
                    </div>
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
    <section id="how" className="bg-white py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow={data.eyebrow} title={data.title} center={false} />
          <ol className="mt-10 space-y-6">
            {data.steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <li className="flex gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#15171C] text-lg font-black text-[#FFB400]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#15171C]">{s.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-[#5B6070]">{s.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        {data.image && (
          <Reveal y={30}>
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rotate-2 rounded-[36px] bg-[#FFB400]/30" />
              <img src={data.image} alt="" loading="lazy" className="w-full rounded-[32px] object-cover shadow-[0_40px_70px_-30px_rgba(21,23,28,0.4)]" />
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  )
}
