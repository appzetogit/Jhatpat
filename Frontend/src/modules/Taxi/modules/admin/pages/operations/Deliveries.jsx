import React from 'react';
import { ChevronDown, ChevronRight, Filter, LoaderCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TABS = ['All', 'Completed', 'Cancelled', 'Upcoming', 'On Trip'];

const STATUS_STYLES = {
  COMPLETED: 'bg-[#17b8a6] text-white',
  CANCELLED: 'bg-[#f26a4b] text-white',
  UPCOMING: 'bg-[#f6b44f] text-white',
  ON_TRIP: 'bg-[#4e8df6] text-white',
};

const PAYMENT_STYLES = {
  CASH: 'bg-[#17b8a6] text-white',
  ONLINE: 'bg-[#4f46e5] text-white',
};

const unwrapResults = (response) => {
  const payload = response?.data || response || {};
  return {
    results: payload?.results || [],
    paginator: payload?.paginator || {},
  };
};

const Deliveries = () => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [pageSize, setPageSize] = React.useState('10');
  const [search, setSearch] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [expandedRow, setExpandedRow] = React.useState(null);

  React.useEffect(() => {
    let active = true;

    const loadDeliveries = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await adminService.getDeliveries({
          page: 1,
          limit: Number(pageSize) || 10,
          tab: activeTab.toLowerCase(),
          search,
        });
        const data = unwrapResults(response);

        if (!active) {
          return;
        }

        setRows(data.results);
      } catch (loadError) {
        if (active) {
          setRows([]);
          setError(loadError?.message || 'Could not load deliveries.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadDeliveries();

    return () => {
      active = false;
    };
  }, [activeTab, pageSize, search]);

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',system-ui,sans-serif]">
      <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_10px_32px_rgba(17,24,39,0.05)]">
        <div className="border-b border-gray-200 px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium">show</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(event.target.value)}
                  className="h-11 appearance-none rounded-md border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <span className="font-medium">entries</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 xl:flex-nowrap">
              <div className="flex flex-wrap items-center gap-8 border-b border-gray-200 xl:min-w-[840px]">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative pb-5 text-[14px] font-semibold tracking-tight transition ${
                        isActive ? 'text-[#4054b2]' : 'text-gray-900 hover:text-[#4054b2]'
                      }`}
                    >
                      {tab}
                      {isActive && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#4054b2]" />}
                    </button>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="relative">
                  <Search size={18} strokeWidth={2.1} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search deliveries"
                    className="h-12 rounded-full border border-gray-300 bg-white pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#f26a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#eb5e3d]"
                >
                  <Filter size={16} strokeWidth={2.2} />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto px-5 py-5 lg:px-6">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#f6f6f8]">
                {['Request Id', 'Date', 'Booking Type', 'Sender', 'Receiver', 'Driver Name', 'Parcel Category', 'Trip Status', 'Payment Option'].map((heading, index, array) => (
                  <th
                    key={heading}
                    className={`px-4 py-4 text-left text-[14px] font-semibold text-gray-900 ${
                      index === 0 ? 'rounded-l-[10px]' : ''
                    } ${index === array.length - 1 ? 'rounded-r-[10px]' : ''}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="inline-flex items-center gap-3 text-sm font-medium text-gray-500">
                      <LoaderCircle size={18} className="animate-spin" />
                      Loading deliveries
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm font-medium text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm font-medium text-gray-500">
                    No deliveries found.
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={`cursor-pointer transition-colors group ${expandedRow === row.id ? 'bg-gray-50' : 'hover:bg-gray-50/60'}`}
                    onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                  >
                    <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          size={16}
                          className={`text-gray-400 transition-transform ${expandedRow === row.id ? 'rotate-90' : ''}`}
                        />
                        {row.requestId}
                      </div>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{formatDate(row.date)}</td>
                    <td className="border-b border-gray-200 px-4 py-5">
                      <span className="inline-flex rounded-md px-3 py-1 text-[11px] font-bold uppercase leading-none bg-amber-100 text-amber-700">
                        Parcel
                      </span>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row.parcel?.senderName || row.userName || '--'}</td>
                    <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row.parcel?.receiverName || '--'}</td>
                    <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row.driverName}</td>
                    <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row.parcel?.category || '--'}</td>
                    <td className="border-b border-gray-200 px-4 py-5">
                      <span className={`inline-flex rounded-md px-3 py-1 text-[11px] font-bold uppercase leading-none ${STATUS_STYLES[row.tripStatus] || 'bg-gray-200 text-gray-700'}`}>
                        {String(row.tripStatus || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5">
                      <span className={`inline-flex rounded-md px-3 py-1 text-[11px] font-bold uppercase leading-none ${PAYMENT_STYLES[row.paymentOption] || 'bg-gray-200 text-gray-700'}`}>
                        {row.paymentOption}
                      </span>
                    </td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr>
                      <td colSpan={8} className="px-0 py-0 border-b border-gray-200">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50/60 p-6 border-t border-gray-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-4">
                              <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">Pickup & Drop</h3>
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                  <div>
                                    <p className="text-[12px] font-bold text-gray-700">Pickup</p>
                                    <p className="text-[13px] text-gray-600">{row.pickupLabel || '--'}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                  <div>
                                    <p className="text-[12px] font-bold text-gray-700">Drop-off</p>
                                    <p className="text-[13px] text-gray-600">{row.dropLabel || '--'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">Parcel & Contact</h3>
                              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-[13px] text-gray-600">
                                <div className="flex justify-between items-center">
                                  <span>Category</span>
                                  <span className="font-bold text-gray-800">{row.parcel?.category || '--'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Sender</span>
                                  <span className="font-bold text-gray-800">{row.parcel?.senderName || '--'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Receiver</span>
                                  <span className="font-bold text-gray-800">{row.parcel?.receiverName || '--'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Sender Phone</span>
                                  <span className="font-bold text-gray-800">{row.parcel?.senderPhone || row.user?.phone || '--'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Receiver Phone</span>
                                  <span className="font-bold text-gray-800">{row.parcel?.receiverPhone || '--'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Driver Phone</span>
                                  <span className="font-bold text-gray-800">{row.driver?.phone || '--'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Vehicle Number</span>
                                  <span className="font-bold text-gray-800">{row.driver?.vehicleNumber || '--'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">Fare</h3>
                              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                                <div className="flex justify-between items-center text-[15px] font-black text-gray-900">
                                  <span>Total Payable</span>
                                  <span>₹{Number(row.fare || 0).toFixed(2)}</span>
                                </div>
                              </div>
                              {row.tripStatus === 'CANCELLED' && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-[13px] text-gray-600">
                                  <h3 className="text-[11px] font-black uppercase tracking-wider text-rose-500 mb-1">Cancellation</h3>
                                  <div className="flex justify-between items-center">
                                    <span>Cancelled By</span>
                                    <span className="font-bold text-gray-800 capitalize">{row.cancelled_by || 'User'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Reason</span>
                                    <span className="font-bold text-gray-800">{row.cancellation_reason || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Fee</span>
                                    <span className="font-bold text-red-500">₹{Number(row.cancellation_charge || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;
