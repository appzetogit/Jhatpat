import { motion } from 'framer-motion'
import { CheckCircle2, UtensilsCrossed, Car, Package } from 'lucide-react'
import { Container, Cta, HEADING, Icon } from '../shared'
import PhoneMockup, { FloatCard } from '../PhoneMockup'

const CHIP_ICONS = ['car', 'food', 'parcel', 'truck']

export default function Hero({ data }) {
  if (!data) return null
  const stats = Array.isArray(data.stats) ? data.stats.filter((s) => s?.value) : []
  return (
    <section id="top" className="relative overflow-hidden bg-white pt-[68px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(60%_60%_at_80%_0%,rgba(255,180,0,0.16),transparent_70%),radial-gradient(50%_50%_at_0%_30%,rgba(255,180,0,0.07),transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '56px 56px' }}
      />

      <Container className="relative grid items-center gap-14 pb-20 pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-8 lg:pb-28 lg:pt-20">
        <div>
          {data.eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {data.eyebrow}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={`${HEADING} mt-6 text-[2.4rem] font-bold leading-[1.08] tracking-[-0.025em] text-slate-900 sm:text-[3.1rem] lg:text-[3.6rem]`}
          >
            {data.title}{' '}
            <span
              className="[box-decoration-break:clone]"
              style={{ backgroundImage: 'linear-gradient(transparent 64%, #FFD45E 64%, #FFD45E 92%, transparent 92%)' }}
            >
              {data.highlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-6 max-w-[34rem] text-[1.0625rem] leading-8 text-slate-600 sm:text-lg"
          >
            {data.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Cta cta={data.primaryCta} variant="primary" arrow />
            <Cta cta={data.secondaryCta} variant="ghost" />
          </motion.div>

          {Array.isArray(data.chips) && data.chips.length > 0 && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {data.chips.map((chip, i) => (
                <li key={chip} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Icon name={CHIP_ICONS[i % CHIP_ICONS.length]} className="h-4 w-4 text-amber-600" />
                  {chip}
                </li>
              ))}
            </motion.ul>
          )}

          {stats.length > 0 && (
            <motion.dl
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-slate-200 pt-8"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className={`${HEADING} text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]`}>{s.value}</dt>
                  <dd className="mt-1 text-[13px] leading-5 text-slate-500">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="absolute inset-x-6 bottom-0 top-10 rounded-[3rem] bg-gradient-to-b from-amber-100 via-amber-50 to-transparent" />
          {data.image ? (
            <img src={data.image} alt="" className="relative z-10 mx-auto w-full" loading="eager" />
          ) : (
            <PhoneMockup className="relative z-10" />
          )}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 top-14 z-20 hidden sm:block lg:-left-4"
          >
            <FloatCard icon={Car} tone="green" title="Captain arriving" text="Auto · 2 min away" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-0 top-[44%] z-20 hidden sm:block lg:-right-6"
          >
            <FloatCard icon={UtensilsCrossed} tone="red" title="Order picked up" text="Arriving in 12 min" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 left-0 z-20 hidden sm:block lg:-left-8"
          >
            <FloatCard icon={Package} tone="blue" title="Parcel delivered" text="Signed by receiver" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

export { CheckCircle2 }
