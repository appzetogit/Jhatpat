import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Bike, Car, Gift, Headset, MapPin, Package, ShieldCheck, UtensilsCrossed, Wallet, Zap,
  Star, Truck, Clock, BadgeCheck, Smartphone, Heart, ArrowRight,
} from 'lucide-react'

/* Type scale. Headings use Outfit, everything else Inter; weights stay at 600/700
   (900 reads as shouting). Sizes step up at sm and lg only. */
export const HEADING = "font-['Outfit',system-ui,sans-serif]"
export const BODY = "font-['Inter',system-ui,sans-serif]"

export const ICONS = {
  car: Car, food: UtensilsCrossed, parcel: Package, bike: Bike, shield: ShieldCheck,
  pin: MapPin, wallet: Wallet, headset: Headset, bolt: Zap, gift: Gift, star: Star,
  truck: Truck, clock: Clock, badge: BadgeCheck, phone: Smartphone, heart: Heart,
}

export const Icon = ({ name, className, strokeWidth = 2, style }) => {
  const C = ICONS[name] || Zap
  return <C className={className} strokeWidth={strokeWidth} style={style} />
}

// Soft tile colours for icon chips: [background, icon, ring].
export const TONES = {
  yellow: { bg: '#FFF4CC', fg: '#B45309', solid: '#FFB400', grad: 'from-amber-100 via-amber-50 to-white' },
  red: { bg: '#FFE4E6', fg: '#BE123C', solid: '#E11D48', grad: 'from-rose-100 via-rose-50 to-white' },
  blue: { bg: '#DBEAFE', fg: '#1D4ED8', solid: '#2563EB', grad: 'from-blue-100 via-blue-50 to-white' },
  green: { bg: '#D1FAE5', fg: '#047857', solid: '#10B981', grad: 'from-emerald-100 via-emerald-50 to-white' },
  violet: { bg: '#EDE9FE', fg: '#6D28D9', solid: '#7C3AED', grad: 'from-violet-100 via-violet-50 to-white' },
  orange: { bg: '#FFEDD5', fg: '#C2410C', solid: '#F97316', grad: 'from-orange-100 via-orange-50 to-white' },
}
export const toneOf = (name) => TONES[name] || TONES.yellow
const ROTATION = ['yellow', 'red', 'blue', 'green', 'violet', 'orange']
export const toneAt = (i) => TONES[ROTATION[i % ROTATION.length]]

export const Reveal = ({ children, delay = 0, y = 16, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const Container = ({ children, className = '' }) => (
  <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>{children}</div>
)

export const SectionHead = ({ eyebrow, title, subtitle, center = true, dark = false }) => (
  <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
    {eyebrow && (
      <p className={`text-[13px] font-semibold uppercase tracking-[0.12em] ${dark ? 'text-[#FFB400]' : 'text-amber-600'}`}>
        {eyebrow}
      </p>
    )}
    {title && (
      <h2 className={`${HEADING} mt-3 text-[1.9rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.4rem] lg:text-[2.75rem] ${dark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
    )}
    {subtitle && (
      <p className={`mt-4 text-base leading-7 sm:text-[1.0625rem] ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{subtitle}</p>
    )}
  </Reveal>
)

/* Which in-page anchors actually exist on this render. A button or menu link that
   points at a section which is off, empty or missing is dropped instead of
   scrolling nowhere. */
const SiteContext = createContext({ ok: () => true })
export const SiteProvider = SiteContext.Provider
export const useSite = () => useContext(SiteContext)

export const makeAnchorCheck = (visibleIds) => (href = '') => {
  if (!href.startsWith('#') || href === '#' || href === '#top') return true
  return visibleIds.has(href.slice(1))
}

export const Cta = ({ cta, variant = 'primary', className = '', arrow = false }) => {
  const { ok } = useSite()
  if (!cta?.label || !ok(cta.href)) return null
  const base = 'group inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]'
  const styles = {
    primary: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800',
    accent: 'bg-[#FFB400] text-slate-900 shadow-sm hover:bg-[#FFC21F]',
    ghost: 'border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50',
    light: 'bg-white text-slate-900 hover:bg-slate-100',
  }
  return (
    <a href={cta.href || '#'} className={`${base} ${styles[variant]} ${className}`}>
      {cta.label}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
    </a>
  )
}

export const useWebsite = () => {
  const [state, setState] = useState({ loading: true, content: null, published: true, error: false })
  useEffect(() => {
    let alive = true
    fetch('/api/v1/taxi/common/website')
      .then((r) => r.json())
      .then((body) => {
        if (!alive) return
        const data = body?.data || {}
        setState({ loading: false, content: data.content || null, published: data.published !== false, error: !data.content })
      })
      .catch(() => alive && setState({ loading: false, content: null, published: true, error: true }))
    return () => { alive = false }
  }, [])
  return state
}
