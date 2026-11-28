import { motion } from 'framer-motion'

/* Brand illustrations drawn in code (yellow / black / red, as in the logo).
   Used wherever the admin has not uploaded a picture; an uploaded image always wins. */
const Wheel = ({ cx, cy, r = 13 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#111827" />
    <circle cx={cx} cy={cy} r={r * 0.5} fill="#E5E7EB" />
    <circle cx={cx} cy={cy} r={r * 0.18} fill="#111827" />
  </g>
)

export const TaxiSvg = ({ className = '' }) => (
  <svg viewBox="0 0 240 120" className={className} fill="none" aria-hidden="true">
    <rect x="92" y="16" width="30" height="12" rx="3" fill="#111827" />
    <path d="M96 22h4v4h-4zM104 22h4v4h-4zM112 22h4v4h-4z" fill="#FFB400" />
    <path d="M52 64l16-26c3-5 8-8 14-8h58c6 0 11 3 14 8l18 26z" fill="#FFB400" />
    <path d="M74 62l11-20c1-2 3-3 5-3h24v23zM124 39h18c2 0 4 1 5 3l12 20h-35z" fill="#E0F2FE" />
    <rect x="20" y="60" width="200" height="34" rx="12" fill="#FFB400" />
    <rect x="20" y="78" width="200" height="6" fill="#111827" opacity=".85" />
    <rect x="206" y="66" width="12" height="8" rx="3" fill="#FEF3C7" />
    <rect x="22" y="66" width="10" height="8" rx="3" fill="#DC2626" />
    <Wheel cx="64" cy="96" r="15" />
    <Wheel cx="178" cy="96" r="15" />
  </svg>
)

export const BikeSvg = ({ className = '' }) => (
  <svg viewBox="0 0 240 120" className={className} fill="none" aria-hidden="true">
    <rect x="22" y="22" width="52" height="46" rx="8" fill="#DC2626" />
    <path d="M42 34v20M50 34v8c0 3-8 3-8 0v-8M58 34v20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="M70 70h70c8 0 12-4 18-10l8-12h18" stroke="#111827" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M80 70h54l-4 14H90z" fill="#FFB400" />
    <circle cx="124" cy="30" r="11" fill="#111827" />
    <path d="M112 30h24" stroke="#FFB400" strokeWidth="4" />
    <path d="M118 44c-8 6-12 14-12 26h26c0-12-2-18-8-26z" fill="#111827" />
    <path d="M132 50l22 4" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
    <Wheel cx="62" cy="96" r="16" />
    <Wheel cx="184" cy="96" r="16" />
  </svg>
)

export const ParcelSvg = ({ className = '' }) => (
  <svg viewBox="0 0 240 120" className={className} fill="none" aria-hidden="true">
    <path d="M70 52l50-20 50 20v46l-50 20-50-20z" fill="#FFB400" />
    <path d="M70 52l50 20 50-20" stroke="#111827" strokeWidth="5" strokeLinejoin="round" />
    <path d="M120 72v46" stroke="#111827" strokeWidth="5" />
    <path d="M95 41l50 20v14" stroke="#DC2626" strokeWidth="10" opacity=".9" />
    <path d="M190 24c-12 0-20 9-20 20 0 14 20 32 20 32s20-18 20-32c0-11-8-20-20-20z" fill="#DC2626" />
    <circle cx="190" cy="44" r="7" fill="#fff" />
  </svg>
)

const FOR = { taxi: TaxiSvg, ride: TaxiSvg, cab: TaxiSvg, food: BikeSvg, restaurant: BikeSvg, parcel: ParcelSvg, courier: ParcelSvg }
export const artFor = (item) => {
  const key = `${item?.icon || ''} ${item?.title || ''}`.toLowerCase()
  const hit = Object.keys(FOR).find((k) => key.includes(k))
  return hit ? FOR[hit] : null
}

/* A moving road: taxi and delivery scooter drive past on a loop. */
export function RoadStrip() {
  return (
    <div className="relative h-28 overflow-hidden bg-slate-900" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-12 bg-slate-800" />
      <motion.div
        className="absolute bottom-[22px] left-0 h-[3px] w-[200%]"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg,#FFB400 0 36px,transparent 36px 72px)' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div className="absolute bottom-[26px] w-28 sm:w-36" initial={{ left: '-20%' }} animate={{ left: '110%' }} transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}>
        <motion.div animate={{ y: [0, -1.5, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
          <TaxiSvg className="w-full" />
        </motion.div>
      </motion.div>
      <motion.div className="absolute bottom-[26px] w-24 sm:w-32" initial={{ left: '-40%' }} animate={{ left: '110%' }} transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 3 }}>
        <motion.div animate={{ y: [0, -1.5, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
          <BikeSvg className="w-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export function Marquee({ items = [] }) {
  if (!items.length) return null
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className="overflow-hidden border-y-2 border-slate-900 bg-[#FFB400] py-3.5" aria-hidden="true">
      <motion.div className="flex w-max gap-10 whitespace-nowrap" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-['Outfit',sans-serif] text-lg font-bold uppercase tracking-wide text-slate-900">
            {t}
            <span className="h-2 w-2 rotate-45 bg-red-600" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
