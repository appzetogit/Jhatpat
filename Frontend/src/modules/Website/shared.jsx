import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Bike, Car, Gift, Headset, MapPin, Package, ShieldCheck, UtensilsCrossed, Wallet, Zap,
  Star, Truck, Clock, BadgeCheck, Smartphone, Heart,
} from 'lucide-react'

export const ICONS = {
  car: Car, food: UtensilsCrossed, parcel: Package, bike: Bike, shield: ShieldCheck,
  pin: MapPin, wallet: Wallet, headset: Headset, bolt: Zap, gift: Gift, star: Star,
  truck: Truck, clock: Clock, badge: BadgeCheck, phone: Smartphone, heart: Heart,
}

export const Icon = ({ name, className }) => {
  const C = ICONS[name] || Zap
  return <C className={className} strokeWidth={2} />
}

// Accent colours stay in the Jhatpat palette; the admin picks a name, not a hex.
export const ACCENTS = {
  yellow: { solid: '#FFB400', soft: '#FFF7DB', ink: '#7A5200', ring: 'rgba(255,180,0,0.35)' },
  red: { solid: '#E31B23', soft: '#FDECEC', ink: '#8C0F15', ring: 'rgba(227,27,35,0.30)' },
  blue: { solid: '#1D4ED8', soft: '#E8EEFD', ink: '#12307F', ring: 'rgba(29,78,216,0.30)' },
  green: { solid: '#10B981', soft: '#E6F8F1', ink: '#0A6B4C', ring: 'rgba(16,185,129,0.30)' },
}
export const accentOf = (name) => ACCENTS[name] || ACCENTS.yellow

// Open an image path that may be absolute (uploaded) or shipped with the app.
export const img = (src) => (src ? src : '')

export const Reveal = ({ children, delay = 0, y = 24, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const SectionHead = ({ eyebrow, title, subtitle, center = true, dark = false }) => (
  <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    {eyebrow && (
      <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] ${dark ? 'bg-white/10 text-[#FFB400]' : 'bg-[#FFF3C4] text-[#7A5200]'}`}>
        {eyebrow}
      </span>
    )}
    {title && (
      <h2 className={`mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem] ${dark ? 'text-white' : 'text-[#15171C]'}`}>
        {title}
      </h2>
    )}
    {subtitle && (
      <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? 'text-white/70' : 'text-[#5B6070]'}`}>{subtitle}</p>
    )}
  </Reveal>
)

export const Container = ({ children, className = '' }) => (
  <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>
)

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

export const isInternal = (href = '') => href.startsWith('/') && !href.startsWith('//')
export const isAnchor = (href = '') => href.startsWith('#')

export const Cta = ({ cta, variant = 'primary', className = '' }) => {
  if (!cta?.label) return null
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-all duration-200 active:scale-[0.97]'
  const styles = {
    primary: 'bg-[#15171C] text-white shadow-[0_10px_24px_-8px_rgba(21,23,28,0.55)] hover:bg-[#2A2D34] hover:-translate-y-0.5',
    accent: 'bg-[#FFB400] text-[#15171C] shadow-[0_10px_24px_-8px_rgba(255,180,0,0.7)] hover:bg-[#FFC21F] hover:-translate-y-0.5',
    ghost: 'border border-[#15171C]/15 bg-white/70 text-[#15171C] backdrop-blur hover:bg-white hover:-translate-y-0.5',
    light: 'bg-white text-[#15171C] hover:bg-[#FFF7DB] hover:-translate-y-0.5',
  }
  return (
    <a href={cta.href || '#'} className={`${base} ${styles[variant]} ${className}`}>
      {cta.label}
    </a>
  )
}
