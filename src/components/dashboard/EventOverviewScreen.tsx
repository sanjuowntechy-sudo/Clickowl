import React, { useEffect, useRef, useState } from 'react';
import {
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Eye,
  Pencil,
  Trash2,
  Search,
  Download,
  ChevronUp,
  X,
  PenLine,
} from 'lucide-react';
import { FilterDrawer, FilterState } from './FilterDrawer';
import { DatePickerPopover } from './DatePickerPopover';
import { EventDetailDrawer } from './EventDetailDrawer';
import { LogsScreen } from './LogsScreen';

const chartData = [
  { date: 'May 12', web: 1200, server: 1100 },
  { date: 'May 13', web: 1350, server: 1200 },
  { date: 'May 14', web: 1100, server: 1050 },
  { date: 'May 15', web: 1800, server: 1600 },
  { date: 'May 16', web: 2400, server: 2200 },
  { date: 'May 17', web: 2800, server: 2600 },
  { date: 'May 18', web: 3200, server: 3000 },
  { date: 'May 19', web: 3500, server: 3300 },
  { date: 'May 20', web: 3800, server: 3600 },
  { date: 'May 21', web: 3600, server: 3400 },
  { date: 'May 22', web: 3200, server: 3000 },
  { date: 'May 23', web: 2800, server: 2600 },
];

const annotations = [
  { id: 1, date: 'May 15, 2026 | 09:30 AM', title: 'UI Update Deployed', description: 'New checkout flow UI deployed for a/b test.', addedBy: 'Dixita S.', color: '#3B82F6', chartIdx: 3 },
  { id: 2, date: 'May 16, 2026 | 09:30 AM', title: 'UI Update Deployed', description: 'New checkout flow UI deployed for a/b test.', addedBy: 'Dixita S.', color: '#22C55E', chartIdx: 4 },
];

const events = [
  { name: 'page_view', total: '48,291', emq: '78%', updated: 'May 18, 2026 | 12:45 PM', sources: ['Browser'], destinations: 1 },
  { name: 'purchase_complete', total: '48,291', emq: '78%', updated: 'May 18, 2026 | 12:45 PM', sources: ['Server-side'], destinations: 2 },
  { name: 'add_to_cart', total: '48,291', emq: '78%', updated: 'May 18, 2026 | 12:45 PM', sources: ['Multiple'], destinations: 1 },
  { name: 'identify', total: '48,291', emq: '78%', updated: 'May 18, 2026 | 12:45 PM', sources: ['Web SDK'], destinations: 3 },
];

const eventDetails: Record<string, {
  eventId: string;
  processingTime: string;
  dataSize: string;
  rawData: Record<string, unknown>;
  userContext: { region: string; ip: string; userAgent: string };
}> = {
  page_view: {
    eventId: 'evt_8fGk2Xp01',
    processingTime: '11.2ms',
    dataSize: '3.1 KB',
    rawData: {
      event_type: 'page_view',
      timestamp: '2026-05-18T12:45:00Z',
      properties: { page_url: 'https://clickowl.com/dashboard', page_title: 'Analytics Dashboard', referrer: 'https://google.com' },
      context: { session_id: 'sess_9aB3xL2mK', load_time: 245, viewport: '1440x900' },
    },
    userContext: { region: 'North America (US-East)', ip: '192.168.1.42', userAgent: 'Chrome 124' },
  },
  purchase_complete: {
    eventId: 'evt_4rT7yH9wQ',
    processingTime: '18.5ms',
    dataSize: '5.8 KB',
    rawData: {
      event_type: 'purchase_complete',
      timestamp: '2026-05-18T12:45:00Z',
      properties: { order_id: 'ORD-7821', total: 149.99, currency: 'USD', items: ['Widget Pro', 'Widget Mini'] },
      context: { session_id: 'sess_4kL8mN2pR', payment_method: 'credit_card', status: 'completed' },
    },
    userContext: { region: 'Europe (West)', ip: '10.0.2.15', userAgent: 'Firefox 127' },
  },
  add_to_cart: {
    eventId: 'evt_2xK9pQ6wE',
    processingTime: '9.8ms',
    dataSize: '2.4 KB',
    rawData: {
      event_type: 'add_to_cart',
      timestamp: '2026-05-18T12:45:00Z',
      properties: { product_id: 'PROD-4521', product_name: 'Widget Pro', quantity: 1, price: 99.99 },
      context: { session_id: 'sess_7mN3kL9pX', cart_total: 99.99 },
    },
    userContext: { region: 'Asia Pacific (Mumbai)', ip: '172.16.0.88', userAgent: 'Safari 17' },
  },
  identify: {
    eventId: 'evt_6hJ5tW3rZ',
    processingTime: '7.3ms',
    dataSize: '1.9 KB',
    rawData: {
      event_type: 'identify',
      timestamp: '2026-05-18T12:45:00Z',
      properties: { user_id: 'usr_8kT2mX4nL', email: 'user@example.com', plan: 'enterprise' },
      context: { session_id: 'sess_3pQ9xK2mT', auth_method: 'sso' },
    },
    userContext: { region: 'North America (US-West)', ip: '10.0.1.33', userAgent: 'Chrome 124' },
  },
};

interface MiniLineChartProps {
  height?: number;
}

const MiniLineChart: React.FC<MiniLineChartProps> = ({ height = 220 }) => {
  const maxVal = 6000;
  const w = 800;
  const h = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const getX = (i: number) => padding.left + (i / (chartData.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

  const webPath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.web)}`)
    .join(' ');

  const serverPath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.server)}`)
    .join(' ');

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const yTicks = [0, 1500, 3000, 4500, 6000];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ height: `${h}px` }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {yTicks.map((val) => (
          <g key={val}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={w - padding.right}
              y2={getY(val)}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text x={padding.left - 8} y={getY(val) + 4} textAnchor="end" className="fill-[#9CA3AF]" fontSize="10">
              {val >= 1000 ? `${val / 1000}k` : val}
            </text>
          </g>
        ))}

        {chartData.map((d, i) => (
          <text key={i} x={getX(i)} y={h - 8} textAnchor="middle" className="fill-[#9CA3AF]" fontSize="10">
            {d.date.replace('May ', '')}
          </text>
        ))}

        <path d={webPath} fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={serverPath} fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {annotations.map((ann) => (
          <g key={ann.id}>
            <circle cx={getX(ann.chartIdx)} cy={getY(chartData[ann.chartIdx].web)} r="10" fill={ann.color} opacity="0.2" />
            <circle cx={getX(ann.chartIdx)} cy={getY(chartData[ann.chartIdx].web)} r="8" fill={ann.color} />
            <text x={getX(ann.chartIdx)} y={getY(chartData[ann.chartIdx].web) + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
              {ann.id}
            </text>
          </g>
        ))}

        {chartData.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.web)} r="3" fill="white" stroke="#06B6D4" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.server)} r="3" fill="white" stroke="#F97316" strokeWidth="2" />
          </g>
        ))}

        {hoverIdx !== null && (
          <>
            <line
              x1={getX(hoverIdx)}
              y1={padding.top}
              x2={getX(hoverIdx)}
              y2={padding.top + chartH}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <rect x={getX(hoverIdx) - 50} y={padding.top - 8} width="100" height="50" rx="6" fill="#1F2937" />
            <text x={getX(hoverIdx)} y={padding.top + 12} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
              Web: {chartData[hoverIdx].web.toLocaleString()}
            </text>
            <text x={getX(hoverIdx)} y={padding.top + 28} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
              Server: {chartData[hoverIdx].server.toLocaleString()}
            </text>
          </>
        )}

        {chartData.map((_, i) => (
          <rect
            key={i}
            x={getX(i) - chartW / chartData.length / 2}
            y={padding.top}
            width={chartW / chartData.length}
            height={chartH}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
          />
        ))}
      </svg>
    </div>
  );
};

const initialFilters: FilterState = {
  destinationPlatform: '',
  eventName: '',
  campaignName: { operator: 'Contains', value: '' },
  adName: { operator: 'Contains', value: '' },
  utmSource: { operator: 'Contains', value: '' },
  utmMedium: { operator: 'Contains', value: '' },
  eventSource: { operator: 'Equals', value: '' },
  eventSourceId: { operator: 'Contains', value: '' },
  deviceCategory: '',
  deviceOS: '',
  browser: '',
  country: '',
  region: '',
  city: '',
  productName: { operator: 'Contains', value: '' },
  value: { operator: 'Greater than', value: '' },
  currency: 'INR',
  dateRange: '',
  startDate: '',
  endDate: '',
  timeStart: '',
  timeEnd: '',
};

interface EventOverviewScreenProps {
  initialTab?: 'overview' | 'users' | 'logs';
}

export const EventOverviewScreen: React.FC<EventOverviewScreenProps> = ({ initialTab = 'overview' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'logs'>(initialTab);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('May 12, 2026 – May 23, 2026');
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ name: string; detail: typeof eventDetails[string] } | null>(null);
  const [granularity, setGranularity] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [granularityOpen, setGranularityOpen] = useState(false);
  const granularityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (granularityRef.current && !granularityRef.current.contains(e.target as Node)) {
        setGranularityOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.destinationPlatform) count++;
    if (appliedFilters.eventName) count++;
    if (appliedFilters.campaignName.value) count++;
    if (appliedFilters.adName.value) count++;
    if (appliedFilters.utmSource.value) count++;
    if (appliedFilters.utmMedium.value) count++;
    if (appliedFilters.eventSource.value) count++;
    if (appliedFilters.eventSourceId.value) count++;
    if (appliedFilters.deviceCategory) count++;
    if (appliedFilters.deviceOS) count++;
    if (appliedFilters.browser) count++;
    if (appliedFilters.country) count++;
    if (appliedFilters.region) count++;
    if (appliedFilters.city) count++;
    if (appliedFilters.productName.value) count++;
    if (appliedFilters.value.value) count++;
    if (appliedFilters.dateRange) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const getActiveFilterChips = () => {
    const chips: { key: string; label: string }[] = [];
    if (appliedFilters.destinationPlatform) chips.push({ key: 'platform', label: appliedFilters.destinationPlatform });
    if (appliedFilters.eventName) chips.push({ key: 'event', label: appliedFilters.eventName });
    if (appliedFilters.campaignName.value) chips.push({ key: 'campaign', label: appliedFilters.campaignName.value });
    if (appliedFilters.utmSource.value) chips.push({ key: 'utmSource', label: appliedFilters.utmSource.value });
    if (appliedFilters.deviceCategory) chips.push({ key: 'device', label: appliedFilters.deviceCategory });
    if (appliedFilters.country) chips.push({ key: 'country', label: appliedFilters.country });
    if (appliedFilters.dateRange) chips.push({ key: 'date', label: appliedFilters.dateRange });
    return chips;
  };

  const removeFilterChip = (key: string) => {
    setAppliedFilters(prev => {
      const next = { ...prev };
      switch (key) {
        case 'platform': next.destinationPlatform = ''; break;
        case 'event': next.eventName = ''; break;
        case 'campaign': next.campaignName = { ...next.campaignName, value: '' }; break;
        case 'utmSource': next.utmSource = { ...next.utmSource, value: '' }; break;
        case 'device': next.deviceCategory = ''; break;
        case 'country': next.country = ''; break;
        case 'date': next.dateRange = ''; break;
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setAppliedFilters({ ...initialFilters });
  };

  const handleEventClick = (eventName: string) => {
    const detail = eventDetails[eventName];
    if (detail) {
      setSelectedEvent({ name: eventName, detail });
      setEventDrawerOpen(true);
    }
  };

  const chips = getActiveFilterChips();

  const subTabs = [
    { id: 'overview' as const, label: 'Event Overview' },
    { id: 'users' as const, label: 'Users' },
    { id: 'logs' as const, label: 'Logs' },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-tabs Header */}
      <div className="flex items-center justify-between border-b border-border pb-0">
        <div className="flex items-center gap-0">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-[1px] ${
                activeSubTab === tab.id
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>
          <button
            onClick={() => setDatePickerOpen(true)}
            className="flex items-center gap-2 text-[12px] text-muted hover:text-ink transition-colors"
          >
            <span>{selectedDateRange}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {chips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md text-[11px] text-[#1D4ED8] font-medium"
            >
              {chip.label}
              <button
                onClick={() => removeFilterChip(chip.key)}
                className="p-0.5 rounded-full hover:bg-[#DBEAFE] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-[11px] text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {activeSubTab === 'overview' && (
        <>
          {/* Monitoring Section */}
          <div>
            <h2 className="text-[14px] font-semibold text-ink mb-3">Monitoring</h2>
            <div className="flex gap-2">
              <div className="bg-surface border border-border rounded-lg px-5 py-4 min-w-[163px]">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">TOTAL EVENTS</p>
                <p className="text-xl font-bold text-ink">104,187</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-[11px] text-success font-semibold">+14.3%</span>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg px-5 py-4 min-w-[163px]">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">UNIQUE USERS</p>
                <p className="text-xl font-bold text-ink">18,432</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3 text-warning" />
                  <span className="text-[11px] text-warning font-semibold">-2.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Events Over Time Section */}
          <div>
            <h2 className="text-[14px] font-semibold text-ink mb-3">Events Over Time</h2>
            <div className="border-b border-border pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                    <span className="text-[11px] text-muted">Web</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                    <span className="text-[11px] text-muted">Server</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    title="Annotate"
                    aria-label="Annotate"
                    className="w-7 h-7 flex items-center justify-center border border-border rounded-md text-muted hover:text-ink hover:bg-bg transition-colors"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative" ref={granularityRef}>
                    <button
                      onClick={() => setGranularityOpen(!granularityOpen)}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-ink transition-colors"
                    >
                      {granularity}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {granularityOpen && (
                      <div className="absolute top-full right-0 mt-1.5 bg-surface border border-border rounded-lg shadow-lg z-20 py-1 min-w-[110px]">
                        {(['Daily', 'Weekly', 'Monthly'] as const).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => { setGranularity(opt); setGranularityOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                              granularity === opt
                                ? 'text-ink font-semibold bg-bg'
                                : 'text-muted hover:text-ink hover:bg-bg'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <MiniLineChart height={200} />
            </div>
          </div>

          {/* Annotations Section */}
          <div>
            <h2 className="text-[14px] font-semibold text-ink mb-3">Annotations</h2>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">#</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">DATE & TIME</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">TITLE</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">DESCRIPTION</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">ADDED BY</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-right">ACTIONS</th>
                    </tr>
                  </thead>
                <tbody>
                  {annotations.map((ann) => (
                    <tr key={ann.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: ann.color }}>
                          {ann.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted">{ann.date}</td>
                      <td className="px-4 py-3 text-[11px] font-semibold text-ink">{ann.title}</td>
                      <td className="px-4 py-3 text-[11px] text-muted">{ann.description}</td>
                      <td className="px-4 py-3 text-[11px] text-muted">{ann.addedBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1 hover:bg-bg rounded transition-colors">
                            <Eye className="w-3.5 h-3.5 text-muted" />
                          </button>
                          <button className="p-1 hover:bg-bg rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-muted" />
                          </button>
                          <button className="p-1 hover:bg-bg rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-muted" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>

          {/* Table Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-1.5 border border-border rounded-md hover:bg-bg transition-colors">
                <Search className="w-3.5 h-3.5 text-muted" />
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-muted hover:text-ink border border-border rounded-md hover:border-ink/20 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
            <button className="p-1.5 hover:bg-bg rounded transition-colors">
              <ChevronUp className="w-4 h-4 text-muted" />
            </button>
          </div>

          {/* Events Breakdown Section */}
          <div>
            <h2 className="text-[14px] font-semibold text-ink mb-3">Events Breakdown</h2>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">EVENT NAME</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">TOTAL EVENTS</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">EMQ SCORE</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">LAST UPDATED</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">SOURCES</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">DESTINATIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.name} className="border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleEventClick(event.name)}
                            className="text-[11px] text-info font-medium underline hover:text-[#1D4ED8] transition-colors cursor-pointer text-left"
                          >
                            {event.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-semibold text-ink">{event.total}</td>
                        <td className="px-4 py-3 text-[11px] text-muted">{event.emq}</td>
                        <td className="px-4 py-3 text-[11px] text-muted">{event.updated}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {event.sources.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-bg border border-border rounded text-[10px] text-muted">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-bg border border-border text-[10px] font-semibold text-ink">
                            {event.destinations}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'logs' && (
        <LogsScreen />
      )}

      {activeSubTab === 'users' && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-[13px] text-muted">Users content</p>
        </div>
      )}

      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={(filters) => setAppliedFilters(filters)}
        currentFilters={appliedFilters}
      />

      {datePickerOpen && (
        <DatePickerPopover
          onClose={() => setDatePickerOpen(false)}
          onApply={(start, end) => {
            const formatDate = (d: Date) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            };
            setSelectedDateRange(`${formatDate(start)} – ${formatDate(end)}`);
          }}
        />
      )}

      <EventDetailDrawer
        isOpen={eventDrawerOpen}
        onClose={() => { setEventDrawerOpen(false); setSelectedEvent(null); }}
        event={selectedEvent ? { name: selectedEvent.name, ...selectedEvent.detail } : null}
      />
    </div>
  );
};
