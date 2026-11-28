import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Minus, Phone, Plus, Twitter, Youtube } from 'lucide-react'
import { Container, HEADING, Reveal, SectionHead } from '../shared'

export function Faq({ data }) {
  const [open, setOpen] = useState(0)
  if (!data?.items?.length) return null
  return (
    <section id="faq" className="scroll-mt-20 bg-slate-50 py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} center={false} />
        </div>
        <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6 sm:px-8">
          {data.items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={`${item.question}-${i}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className={`${HEADING} text-[1.05rem] font-semibold text-slate-900`}>{item.question}</span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${isOpen ? 'border-[#FFB400] bg-[#FFB400]' : 'border-slate-300 bg-white'}`}>
                    {isOpen ? <Minus className="h-4 w-4 text-slate-900" /> : <Plus className="h-4 w-4 text-slate-600" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-12 text-[15px] leading-7 text-slate-600">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
    <div className="flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.3)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
        <I className="h-5 w-5 text-amber-700" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-slate-500">{label}</span>
        <span className="mt-0.5 block break-words text-[15px] font-semibold text-slate-900">{value}</span>
      </span>
    </div>
  )
  return href ? <a href={href} className="block">{body}</a> : body
}

export function Contact({ data }) {
  if (!data) return null
  const tel = data.phone ? `tel:${data.phone.replace(/[^\d+]/g, '')}` : undefined
  return (
    <section id="contact" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <Reveal className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
          <Row icon={Phone} label="Call us" value={data.phone} href={tel} />
          <Row icon={Mail} label="Email us" value={data.email} href={data.email ? `mailto:${data.email}` : undefined} />
          <Row icon={MapPin} label="Address" value={data.address} />
          <Row icon={Clock} label="Support hours" value={data.hours} />
        </Reveal>
      </Container>
    </section>
  )
}

const SOCIAL_ICONS = { facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin, youtube: Youtube }

export function Footer({ brand, footer, social, contact, canGo }) {
  const socials = Object.entries(social || {}).filter(([, url]) => url)
  const links = (footer?.links || []).filter((l) => l?.label && (!canGo || canGo(l.href)))
  const half = Math.ceil(links.length / 2)
  return (
    <footer className="bg-slate-950 text-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            {brand?.logo ? (
              <img src={brand.logo} alt={brand?.name} className="h-16 w-16 rounded-2xl bg-white object-contain p-1" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFB400] text-xl font-bold text-slate-900">
                {(brand?.name || 'J').charAt(0)}
              </span>
            )}
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">{footer?.about}</p>
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map(([name, url]) => {
                  const I = SOCIAL_ICONS[name]
                  return (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#FFB400] hover:text-slate-900"
                    >
                      {I ? <I className="h-[18px] w-[18px]" /> : <span className="text-xs font-semibold capitalize">{name.charAt(0)}</span>}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
          {[links.slice(0, half), links.slice(half)].map((col, idx) => col.length > 0 && (
            <div key={idx}>
              <h4 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">{idx === 0 ? 'Company' : 'Legal & help'}</h4>
              <ul className="mt-4 space-y-3">
                {col.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm font-medium text-slate-300 transition-colors hover:text-[#FFB400]">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {footer?.copyright}</p>
          {contact?.email && <a href={`mailto:${contact.email}`} className="hover:text-slate-300">{contact.email}</a>}
        </div>
      </Container>
    </footer>
  )
}
