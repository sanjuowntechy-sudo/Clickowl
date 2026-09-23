import React, { useState, useMemo } from 'react';
import { ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import { DatePickerPopover } from './DatePickerPopover';

interface LogEntry {
  id: string;
  timestamp: string;
  eventName: string;
  status: number;
  source: string;
  deduplicationStatus: string;
  parameters: number;
  requestUrl: string;
  requestType: 'incoming' | 'outgoing';
  device: string;
}

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '18-06-2026 14:32:10', eventName: 'Purchase', status: 200, source: 'Server-side', deduplicationStatus: 'Deduplicated', parameters: 12, requestUrl: 'https://track.example.com/events/purchase', requestType: 'incoming', device: 'Desktop' },
  { id: '2', timestamp: '18-06-2026 14:31:45', eventName: 'Pageview', status: 200, source: 'Pixel', deduplicationStatus: 'Not Deduplicated', parameters: 8, requestUrl: 'https://track.example.com/events/pageview', requestType: 'incoming', device: 'Mobile' },
  { id: '3', timestamp: '18-06-2026 14:31:22', eventName: 'Lead', status: 201, source: 'CRM', deduplicationStatus: 'Deduplicated', parameters: 15, requestUrl: 'https://api.example.com/v1/leads', requestType: 'incoming', device: 'Desktop' },
  { id: '4', timestamp: '18-06-2026 14:30:58', eventName: 'Add to Cart', status: 403, source: 'Multiple', deduplicationStatus: 'Deduplication Failed', parameters: 6, requestUrl: 'https://track.example.com/events/cart', requestType: 'incoming', device: 'Tablet' },
  { id: '5', timestamp: '18-06-2026 14:30:31', eventName: 'Sign Up', status: 201, source: 'Web SDK', deduplicationStatus: 'Deduplicated', parameters: 10, requestUrl: 'https://track.example.com/events/signup', requestType: 'incoming', device: 'Desktop' },
  { id: '6', timestamp: '18-06-2026 14:30:15', eventName: 'Login', status: 200, source: 'Server-side', deduplicationStatus: 'Deduplicated', parameters: 5, requestUrl: 'https://track.example.com/events/login', requestType: 'incoming', device: 'Mobile' },
  { id: '7', timestamp: '18-06-2026 14:29:58', eventName: 'Search', status: 200, source: 'Pixel', deduplicationStatus: 'Not Deduplicated', parameters: 7, requestUrl: 'https://track.example.com/events/search', requestType: 'incoming', device: 'Desktop' },
  { id: '8', timestamp: '18-06-2026 14:29:42', eventName: 'Checkout', status: 400, source: 'Server-side', deduplicationStatus: 'Deduplicated', parameters: 18, requestUrl: 'https://track.example.com/events/checkout', requestType: 'incoming', device: 'Desktop' },
  { id: '9', timestamp: '18-06-2026 14:29:18', eventName: 'Purchase', status: 500, source: 'Multiple', deduplicationStatus: 'Deduplication Failed', parameters: 12, requestUrl: 'https://track.example.com/events/purchase', requestType: 'outgoing', device: 'Desktop' },
  { id: '10', timestamp: '18-06-2026 14:28:55', eventName: 'Pageview', status: 200, source: 'Web SDK', deduplicationStatus: 'Deduplicated', parameters: 8, requestUrl: 'https://analytics.example.com/v1/pageview', requestType: 'outgoing', device: 'Mobile' },
  { id: '11', timestamp: '18-06-2026 14:28:30', eventName: 'Lead', status: 200, source: 'CRM', deduplicationStatus: 'Deduplicated', parameters: 14, requestUrl: 'https://crm.example.com/api/leads', requestType: 'outgoing', device: 'Desktop' },
  { id: '12', timestamp: '18-06-2026 14:28:12', eventName: 'Add to Cart', status: 200, source: 'Pixel', deduplicationStatus: 'Not Deduplicated', parameters: 6, requestUrl: 'https://events.example.com/cart', requestType: 'outgoing', device: 'Tablet' },
  { id: '13', timestamp: '18-06-2026 14:27:48', eventName: 'Purchase', status: 200, source: 'Server-side', deduplicationStatus: 'Deduplicated', parameters: 11, requestUrl: 'https://track.example.com/events/purchase', requestType: 'incoming', device: 'Desktop' },
  { id: '14', timestamp: '18-06-2026 14:27:22', eventName: 'Sign Up', status: 404, source: 'Web SDK', deduplicationStatus: 'Deduplication Failed', parameters: 9, requestUrl: 'https://track.example.com/events/signup', requestType: 'outgoing', device: 'Mobile' },
  { id: '15', timestamp: '18-06-2026 14:27:01', eventName: 'Search', status: 200, source: 'Server-side', deduplicationStatus: 'Deduplicated', parameters: 5, requestUrl: 'https://track.example.com/events/search', requestType: 'incoming', device: 'Desktop' },
  { id: '16', timestamp: '18-06-2026 14:26:45', eventName: 'Pageview', status: 200, source: 'Pixel', deduplicationStatus: 'Not Deduplicated', parameters: 7, requestUrl: 'https://track.example.com/events/pageview', requestType: 'incoming', device: 'Mobile' },
  { id: '17', timestamp: '18-06-2026 14:26:20', eventName: 'Login', status: 200, source: 'Server-side', deduplicationStatus: 'Deduplicated', parameters: 4, requestUrl: 'https://track.example.com/events/login', requestType: 'outgoing', device: 'Desktop' },
  { id: '18', timestamp: '18-06-2026 14:25:55', eventName: 'Checkout', status: 200, source: 'Multiple', deduplicationStatus: 'Deduplicated', parameters: 20, requestUrl: 'https://track.example.com/events/checkout', requestType: 'incoming', device: 'Desktop' },
  { id: '19', timestamp: '18-06-2026 14:25:30', eventName: 'Add to Cart', status: 200, source: 'Pixel', deduplicationStatus: 'Not Deduplicated', parameters: 6, requestUrl: 'https://track.example.com/events/cart', requestType: 'incoming', device: 'Mobile' },
  { id: '20', timestamp: '18-06-2026 14:25:10', eventName: 'Lead', status: 201, source: 'CRM', deduplicationStatus: 'Deduplicated', parameters: 13, requestUrl: 'https://api.example.com/v1/leads', requestType: 'outgoing', device: 'Desktop' },
];

const statuses = ['200', '201', '400', '403', '404', '500'];
const deduplicationStatuses = ['Deduplicated', 'Not Deduplicated', 'Deduplication Failed'];

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-md text-[12px] text-muted hover:border-ink/30 transition-colors min-w-[140px] justify-between"
      >
        <span className={value ? 'text-ink font-medium' : 'text-muted'}>{value || label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-md shadow-lg z-20 min-w-[160px] py-1">
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-bg transition-colors ${!value ? 'text-ink font-medium' : 'text-muted'}`}
            >
              {label}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-bg transition-colors ${value === opt ? 'text-ink font-medium' : 'text-muted'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const LogsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('May 12, 2026 - May 23, 2026');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isLoading] = useState(false);
  const [hasError] = useState(false);

  const eventTypes = useMemo(() => [...new Set(mockLogs.map((l) => l.eventName))].sort(), []);
  const sources = useMemo(() => [...new Set(mockLogs.map((l) => l.source))].sort(), []);
  const devices = useMemo(() => [...new Set(mockLogs.map((l) => l.device))].sort(), []);

  const filteredLogs = useMemo(() => {
    return mockLogs.filter((log) => {
      if (log.requestType !== activeTab) return false;
      if (eventTypeFilter && log.eventName !== eventTypeFilter) return false;
      if (sourceFilter && log.source !== sourceFilter) return false;
      if (deviceFilter && log.device !== deviceFilter) return false;
      return true;
    });
  }, [activeTab, eventTypeFilter, sourceFilter, deviceFilter]);

  const hasActiveFilters = eventTypeFilter || sourceFilter || deviceFilter;

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-success';
    if (status >= 400 && status < 500) return 'text-warning';
    if (status >= 500) return 'text-danger';
    return 'text-muted';
  };

  const getDedupColor = (status: string) => {
    if (status === 'Deduplicated') return 'text-success';
    if (status === 'Not Deduplicated') return 'text-muted';
    return 'text-danger';
  };

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h1 className="text-xl font-bold text-ink">Logs</h1>
        <div className="flex items-center gap-3">
          <FilterDropdown
            label="Event Type"
            value={eventTypeFilter}
            options={eventTypes}
            onChange={setEventTypeFilter}
          />
          <FilterDropdown
            label="Source"
            value={sourceFilter}
            options={sources}
            onChange={setSourceFilter}
          />
          <FilterDropdown
            label="Device"
            value={deviceFilter}
            options={devices}
            onChange={setDeviceFilter}
          />
          <button
            onClick={() => setDatePickerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-md text-[12px] text-muted hover:border-ink/30 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{selectedDateRange}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === 'incoming'
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Incoming Requests
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === 'outgoing'
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Outgoing Requests
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-bg border-b border-border">
                <th className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">Timestamp</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">Event name</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">Status</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">Source</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">Deduplication status</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">Parameters</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-left">Request URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-3 bg-border rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-border rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-border rounded w-8" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-border rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-border rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-border rounded w-6" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-border rounded w-40" /></td>
                  </tr>
                ))
              ) : hasError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-danger" />
                      <p className="text-[13px] text-danger">Failed to load logs. Please try again.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-[13px] text-muted">
                      {hasActiveFilters ? 'No logs match the selected filters' : 'No logs found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3 text-[12px] text-muted whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 text-[12px] text-ink font-medium">{log.eventName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-semibold ${getStatusColor(log.status)}`}>{log.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 bg-bg border border-border rounded text-[10px] text-muted">{log.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] ${getDedupColor(log.deduplicationStatus)}`}>{log.deduplicationStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted text-center">{log.parameters}</td>
                    <td className="px-4 py-3 text-[12px] text-muted max-w-[200px] truncate" title={log.requestUrl}>{log.requestUrl}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {datePickerOpen && (
        <DatePickerPopover
          onClose={() => setDatePickerOpen(false)}
          onApply={(start, end) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            setSelectedDateRange(`${months[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`);
          }}
        />
      )}
    </div>
  );
};
