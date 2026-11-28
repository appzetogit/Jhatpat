import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Container, Cta } from '../shared'

export default function Header({ brand, nav = [], cta }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'bg-white/85 shadow-[0_1px_0_rgba(21,23,28,0.06)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <Container className="flex h-[72px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2" aria-label={brand?.name}>
          {brand?.logo ? (
            <img src={brand.logo} alt={brand?.name} className="h-14 w-14 object-contain mix-blend-multiply" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB400] text-lg font-black text-[#15171C]">J</span>
          )}
          {!brand?.logo && <span className="text-xl font-extrabold tracking-tight text-[#15171C]">{brand?.name}</span>}
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-[15px] font-semibold text-[#3A3F4B] transition-colors hover:bg-[#15171C]/5 hover:text-[#15171C]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Cta cta={cta} variant="primary" className="!px-5 !py-2.5 !text-sm" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[#15171C] hover:bg-[#15171C]/5 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-[#15171C]/5 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-[#15171C] hover:bg-[#FFF7DB]"
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
