import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, useScroll } from 'framer-motion'
import { Container, Cta, useSite } from '../shared'

export default function Header({ brand, nav = [], cta }) {
  const { ok } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const links = nav.filter((n) => n?.label && ok(n.href))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-slate-200/80 bg-white/90 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <motion.div style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-[#FFB400] to-red-600" />
      <Container className="flex h-[68px] items-center justify-between">
        <a href="#top" className="flex items-center" aria-label={brand?.name}>
          {brand?.logo ? (
            <img src={brand.logo} alt={brand?.name} className="h-12 w-12 object-contain mix-blend-multiply" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB400] text-lg font-bold text-slate-900">
              {(brand?.name || 'J').charAt(0)}
            </span>
          )}
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg px-4 py-2 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Cta cta={cta} variant="primary" className="!h-10 !px-5 !text-sm" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-900 hover:bg-slate-900/5 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {links.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-900 hover:bg-slate-50"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2">
              <Cta cta={cta} variant="primary" className="w-full" />
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
