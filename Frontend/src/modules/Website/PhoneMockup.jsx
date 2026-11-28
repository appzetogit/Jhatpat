import { Bike, Car, CarTaxiFront, CheckCircle2, Navigation, Search } from 'lucide-react'
import { HEADING } from './shared'

/* A drawn app screen, not an image: a map with a live route and the ride picker.
   Pure markup, so it stays sharp at any size and needs no asset. */

const MapArt = () => (
  <svg viewBox="0 0 300 250" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="300" height="250" fill="#E9EEF3" />
    <rect x="-10" y="150" width="110" height="60" rx="10" fill="#D8E9D2" />
    <rect x="190" y="14" width="120" height="58" rx="10" fill="#D8E9D2" />
    <path d="M-10 210 C 60 190, 120 235, 320 200 L320 260 L-10 260Z" fill="#CFE3F3" />
    {[20, 74, 128, 182, 236].map((x) => <rect key={x} x={x} y="-6" width="12" height="270" fill="#FFFFFF" opacity="0.9" />)}
    {[34, 92, 150].map((y) => <rect key={y} x="-6" y={y} width="320" height="10" fill="#FFFFFF" opacity="0.9" />)}
    <path d="M 62 196 L 62 98 L 134 98 L 134 56 L 238 56" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 62 196 L 62 98 L 134 98 L 134 56 L 238 56" fill="none" stroke="#FFB400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 7" />
    <circle cx="62" cy="196" r="9" fill="#10B981" stroke="#fff" strokeWidth="3" />
    <g transform="translate(238 56)">
      <circle r="13" fill="#E11D48" opacity="0.2" />
      <circle r="8" fill="#E11D48" stroke="#fff" strokeWidth="3" />
    </g>
  </svg>
)

const OPTIONS = [
  { icon: Bike, name: 'Bike', meta: '2 min', price: '₹38' },
  { icon: CarTaxiFront, name: 'Auto', meta: '3 min', price: '₹52', active: true },
  { icon: Car, name: 'Cab', meta: '4 min', price: '₹86' },
]

export default function PhoneMockup({ className = '' }) {
  return (
    <div className={`relative mx-auto w-[272px] sm:w-[292px] ${className}`}>
      <div className="rounded-[2.6rem] bg-slate-900 p-[9px] shadow-[0_40px_80px_-24px_rgba(15,23,42,0.55)] ring-1 ring-slate-800">
        <div className="relative h-[560px] overflow-hidden rounded-[2.1rem] bg-white sm:h-[590px]">
          <div className="absolute left-1/2 top-2 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />

          <div className="relative h-[52%]">
            <MapArt />
            <div className="absolute inset-x-3 top-9 z-20 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-md">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-[12px] font-medium text-slate-500">Where to?</span>
            </div>
            <div className="absolute left-[18%] top-[43%] z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFB400] shadow-lg ring-4 ring-white/80">
              <Navigation className="h-4 w-4 fill-slate-900 text-slate-900" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-[1.6rem] bg-white px-4 pb-4 pt-3 shadow-[0_-12px_30px_-12px_rgba(15,23,42,0.25)]">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <p className={`${HEADING} text-[15px] font-semibold text-slate-900`}>Choose a ride</p>
              <p className="text-[11px] font-medium text-slate-500">4.2 km · 14 min</p>
            </div>
            <div className="mt-3 space-y-2">
              {OPTIONS.map((o) => (
                <div
                  key={o.name}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${o.active ? 'border-[#FFB400] bg-amber-50' : 'border-slate-200 bg-white'}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${o.active ? 'bg-[#FFB400]' : 'bg-slate-100'}`}>
                    <o.icon className="h-[18px] w-[18px] text-slate-900" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold text-slate-900">{o.name}</span>
                    <span className="block text-[11px] text-slate-500">{o.meta} away</span>
                  </span>
                  <span className="text-[13px] font-semibold text-slate-900">{o.price}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex h-11 items-center justify-center rounded-xl bg-slate-900 text-[13px] font-semibold text-white">
              Confirm Auto
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const FloatCard = ({ icon: I, tone = 'green', title, text, className = '' }) => {
  const tones = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-amber-100 text-amber-700',
  }
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/5 ${className}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <I className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[13px] font-semibold leading-tight text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{text}</p>
      </div>
    </div>
  )
}

export { CheckCircle2 }
