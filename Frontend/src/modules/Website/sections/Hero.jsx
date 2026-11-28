import { motion } from 'framer-motion'
import { Container, Cta, Icon } from '../shared'

const CHIP_ICONS = ['car', 'food', 'parcel', 'truck']

export default function Hero({ data }) {
  if (!data) return null
  return (
    <section id="top" className="relative overflow-hidden bg-[#FFFBF0] pt-[72px]">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#FFB400]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 -left-40 h-[520px] w-[520px] rounded-full bg-[#E31B23]/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: 'radial-gradient(rgba(21,23,28,0.07) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />

      <Container className="relative grid items-center gap-10 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-24 lg:pt-20">
        <div>
          {data.eyebrow && (
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#FFB400]/40 bg-white px-4 py-1.5 text-[13px] font-bold text-[#7A5200] shadow-sm"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
              {data.eyebrow}
            </motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[2.6rem] font-black leading-[1.04] tracking-tight text-[#15171C] sm:text-6xl lg:text-[4.1rem]"
          >
            {data.title}{' '}
            <span className="bg-gradient-to-r from-[#FF8A00] via-[#E31B23] to-[#E31B23] bg-clip-text text-transparent">
              {data.highlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-[#4B5160] sm:text-xl"
          >
            {data.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Cta cta={data.primaryCta} variant="primary" />
            <Cta cta={data.secondaryCta} variant="ghost" />
          </motion.div>

          {Array.isArray(data.chips) && data.chips.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-2.5"
            >
              {data.chips.map((chip, i) => (
                <span key={chip} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#15171C] shadow-sm ring-1 ring-[#15171C]/8">
                  <Icon name={CHIP_ICONS[i % CHIP_ICONS.length]} className="h-4 w-4 text-[#E31B23]" />
                  {chip}
                </span>
              ))}
            </motion.div>
          )}

          {Array.isArray(data.stats) && data.stats.length > 0 && (
            <motion.dl
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-[#15171C]/10 pt-7"
            >
              {data.stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-black tracking-tight text-[#15171C] sm:text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-[13px] font-medium leading-snug text-[#5B6070]">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {data.image && (
            <img
              src={data.image}
              alt=""
              className="relative z-10 mx-auto w-full max-w-[640px] drop-shadow-[0_30px_40px_rgba(21,23,28,0.18)]"
              loading="eager"
            />
          )}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-2 top-10 z-20 hidden rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-12px_rgba(21,23,28,0.3)] sm:block"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F8F1]">
                <Icon name="badge" className="h-5 w-5 text-[#10B981]" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#15171C]">Captain arriving</p>
                <p className="text-xs font-medium text-[#5B6070]">2 min away</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-1 bottom-12 z-20 hidden rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-12px_rgba(21,23,28,0.3)] sm:block"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDECEC]">
                <Icon name="food" className="h-5 w-5 text-[#E31B23]" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#15171C]">Order picked up</p>
                <p className="text-xs font-medium text-[#5B6070]">On the way to you</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
