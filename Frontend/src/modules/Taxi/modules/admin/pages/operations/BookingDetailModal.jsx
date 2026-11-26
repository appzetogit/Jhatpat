import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Row = ({ label, value, bold }) => (
  <div className="flex justify-between items-center text-[13px] text-slate-600">
    <span>{label}</span>
    <span className={bold ? 'font-black text-slate-900' : 'font-bold text-slate-800'}>{value ?? '--'}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">{title}</h3>
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">{children}</div>
  </div>
);

/**
 * Shared detail view for Trips / Ongoing / Deliveries admin pages, opened via a
 * "View" button on each row instead of an inline expand -- same data, one place
 * to keep it consistent across all three booking lists.
 */
const BookingDetailModal = ({ row, onClose }) => {
  if (!row) return null;
  const isParcel = row.bookingType === 'PARCEL';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-50 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl shadow-xl"
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl sticky top-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isParcel ? 'Parcel Booking' : 'Ride Booking'}</p>
              <h2 className="text-[18px] font-black text-slate-800">{row.requestId}</h2>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X size={22} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block px-3 py-1 text-[11px] font-bold rounded uppercase bg-slate-200 text-slate-700">
                {formatDateTime(row.date)}
              </span>
              <span className={`inline-block px-3 py-1 text-[11px] font-bold rounded uppercase ${isParcel ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {isParcel ? 'Parcel' : 'Ride'}
              </span>
              <span className="inline-block px-3 py-1 text-[11px] font-bold rounded uppercase bg-slate-800 text-white">
                {row.tripStatus || 'UNKNOWN'}
              </span>
              <span className="inline-block px-3 py-1 text-[11px] font-bold rounded uppercase bg-emerald-100 text-emerald-700">
                {row.paymentOption || 'CASH'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="Pickup & Drop">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[12px] font-bold text-slate-700">Pickup</p>
                      <p className="text-[13px] text-slate-600">{row.pickupLabel || '--'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <div>
                      <p className="text-[12px] font-bold text-slate-700">Drop-off</p>
                      <p className="text-[13px] text-slate-600">{row.dropLabel || '--'}</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title={isParcel ? 'Sender & Driver' : 'Rider & Driver'}>
                <Row label={isParcel ? 'Sender' : 'Rider'} value={row.parcel?.senderName || row.userName} />
                <Row label={isParcel ? 'Sender Phone' : 'Rider Phone'} value={row.parcel?.senderPhone || row.user?.phone} />
                <Row label="Driver" value={row.driverName || 'Unassigned'} />
                <Row label="Driver Phone" value={row.driver?.phone} />
                <Row label="Vehicle Number" value={row.driver?.vehicleNumber} />
                <Row label="Vehicle Type" value={row.transportType} />
              </Section>

              {isParcel && (
                <Section title="Parcel Details">
                  <Row label="Category" value={row.parcel?.category} />
                  <Row label="Receiver" value={row.parcel?.receiverName} />
                  <Row label="Receiver Phone" value={row.parcel?.receiverPhone} />
                </Section>
              )}

              <Section title="Payment & Fare">
                {isParcel ? (
                  <Row label="Total Payable" value={`₹${Number(row.fare || 0).toFixed(2)}`} bold />
                ) : (
                  <>
                    <Row label="Base Fare" value={`₹${Number(row.baseFare || 0).toFixed(2)}`} />
                    <Row label="Wait Time Charge" value={`₹${Number(row.waitingChargeAmount || 0).toFixed(2)}`} />
                    <Row label="Time Charge" value={`₹${Number(row.timeChargeAmount || 0).toFixed(2)}`} />
                    <Row label="Distance Charge" value={`₹${Number(row.distanceChargeAmount || 0).toFixed(2)}`} />
                    {Number(row.recovered_cancellation_due) > 0 && (
                      <Row label="Previous Cancellation Due" value={`₹${Number(row.recovered_cancellation_due).toFixed(2)}`} />
                    )}
                    <div className="pt-2 mt-1 border-t border-slate-100">
                      <Row
                        label="Total Payable"
                        value={`₹${(Number(row.fare || 0) + Number(row.recovered_cancellation_due || 0)).toFixed(2)}`}
                        bold
                      />
                    </div>
                  </>
                )}
              </Section>

              {row.tripStatus === 'CANCELLED' && (
                <Section title="Cancellation Details">
                  <Row label="Cancelled By" value={row.cancelled_by || 'User'} />
                  <Row label="Reason" value={row.cancellation_reason || 'N/A'} />
                  <Row label="Cancellation Time" value={formatDateTime(row.cancellation_time || row.date)} />
                  <Row label="Cancellation Fee" value={`₹${Number(row.cancellation_charge || 0).toFixed(2)}`} />
                  <Row label="Status" value={row.cancellation_status === 'recovered' ? 'Recovered' : 'Pending'} />
                  {row.cancellation_status === 'recovered' && (
                    <Row label="Recovery Time" value={formatDateTime(row.recovered_at)} />
                  )}
                </Section>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingDetailModal;
