import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Container, Reveal, SectionHead, isInternal } from '../shared'

export function Faq({ data }) {
  const [open, setOpen] = useState(0)
  if (!data?.items?.length) return null
  return (
    <section id="faq" className="bg-[#F7F8FA] py-20 sm:py-28">
      <Container className="max-w-[860px]">
        <SectionHead eyebrow={data.eyebrow} title={data.title} />
        <div className="mt-12 space-y-3">
          {data.items.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.question} delay={i * 0.05}>
                <div className={`overflow-hidden rounded-2xl bg-white ring-1 transition-shadow ${isOpen ? 'shadow-[0_20px_40px_-24px_rgba(21,23,28,0.3)] ring-[#FFB400]/60' : 'ring-[#15171C]/8'}`}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-base font-extrabold text-[#15171C] sm:text-lg">{item.question}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4]">
                      <ChevronDown className="h-5 w-5 text-[#15171C]" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                      >
                        <p className="px-6 pb-6 text-[15px] leading-relaxed text-[#5B6070]">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

const Row = ({ icon: I, label, value, href }) => {
  if (!value) return null
  const body = (
    <div className="flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition-colors hover:bg-white/10">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFB400]">
        <I className="h-5 w-5 text-[#15171C]" />
      </span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-wider text-white/50">{label}</span>
        <span className="mt-1 block text-base font-bold text-white">{value}</span>
      </span>
    </div>
  )
  return href ? <a href={href}>{body}</a> : body
}

export function Contact({ data }) {
  if (!data) return null
  const tel = data.phone ? `tel:${data.phone.replace(/[^\d+]/g, '')}` : undefined
  return (
    <section id="contact" className="bg-[#15171C] py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} center={false} dark />
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <Row icon={Phone} label="Call us" value={data.phone} href={tel} />
            <Row icon={Mail} label="Email" value={data.email} href={data.email ? `mailto:${data.email}` : undefined} />
            <Row icon={MapPin} label="Address" value={data.address} />
            <Row icon={Clock} label="Support hours" value={data.hours} />
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export function Footer({ brand, footer, social, contact }) {
  const socials = Object.entries(social || {}).filter(([, url]) => url)
  const links = footer?.links || []
  return (
    <footer className="bg-[#0E1014] text-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              {brand?.logo ? (
                <img src={brand.logo} alt={brand?.name} className="h-16 w-16 rounded-2xl bg-white object-contain p-1" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB400] text-lg font-black text-[#15171C]">J</span>
              )}
              {!brand?.logo && <span className="text-xl font-extrabold">{brand?.name}</span>}
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{footer?.about}</p>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/8 px-3.5 py-1.5 text-xs font-bold capitalize text-white/80 transition-colors hover:bg-[#FFB400] hover:text-[#15171C]"
                  >
                    {name}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/50">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {links.slice(0, Math.ceil(links.length / 2)).map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm font-medium text-white/80 hover:text-[#FFB400]">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/50">Legal & help</h4>
            <ul className="mt-4 space-y-2.5">
              {links.slice(Math.ceil(links.length / 2)).map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm font-medium text-white/80 hover:text-[#FFB400]">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} {footer?.copyright}</p>
          {contact?.email && <p>{contact.email}</p>}
        </div>
      </Container>
    </footer>
  )
}
