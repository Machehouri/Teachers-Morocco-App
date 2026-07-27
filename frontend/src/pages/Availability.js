import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteAvailability } from "../api";
import { handleResponse } from "../api";

const API_URL = "http://127.0.0.1:8000";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function toKey(date) {

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fmtDisplay(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function buildTimeOptions() {
  const opts = [];
  for (let h = 7; h <= 21; h++) {
    for (const m of ["00", "30"]) {
      const value  = `${String(h).padStart(2, "0")}:${m}`;
      const suffix = h >= 12 ? "PM" : "AM";
      const h12    = h > 12 ? h - 12 : h === 0 ? 12 : h;
      opts.push({ value, label: `${h12}:${m} ${suffix}` });
    }
  }
  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

// ── Calendar ───────────────────────────────────────────────────────────────
function Calendar({ selected, onSelect, slotsMap }) {
  const [cur, setCur] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDow    = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
  const offset      = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const daysInPrev  = new Date(cur.getFullYear(), cur.getMonth(), 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true });
  const rem = cells.length % 7;
  if (rem !== 0)
    for (let d = 1; d <= 7 - rem; d++)
      cells.push({ day: d, current: false });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCur(c => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg"
        >‹</button>
        <span className="text-sm font-medium text-gray-800">
          {MONTHS[cur.getMonth()]} {cur.getFullYear()}
        </span>
        <button
          onClick={() => setCur(c => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg"
        >›</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, idx) => {
          if (!cell.current)
            return (
              <div key={idx} className="aspect-square flex items-center justify-center text-xs text-gray-300">
                {cell.day}
              </div>
            );

          const cellDate  = new Date(cur.getFullYear(), cur.getMonth(), cell.day);
          const key       = toKey(cellDate);
          const isSel     = key === toKey(selected);
          const isToday   = key === toKey(today);
          const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
          const hasSlots  = slotsMap[key]?.length > 0;

          return (
            <button
              key={idx}
              onClick={() => onSelect(cellDate)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                transition-colors relative
                ${isSel
                  ? "bg-blue-600 text-white font-medium"
                  : isToday
                  ? "text-blue-600 font-semibold hover:bg-blue-50"
                  : isWeekend
                  ? "text-red-400 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              {cell.day}
              {hasSlots && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                  ${isSel ? "bg-blue-200" : "bg-emerald-400"}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── SlotChip ───────────────────────────────────────────────────────────────
function SlotChip({ slot, onDelete }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm
      ${slot.is_booked ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}
    >
      <span className="text-gray-700 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
          <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
      </span>

      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${slot.is_booked ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
        >
          {slot.is_booked ? "booked" : "open"}
        </span>

        {!slot.is_booked && (
          <button
            onClick={() => onDelete(slot.id)}
            className="text-gray-300 hover:text-red-400 transition-colors"
            title="Delete slot"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 3h4a1 1 0 011 1v3H9V4a1 1 0 011-1z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Availability() {
  // ✅ ALL hooks must come before any early return
  const [selected,     setSelected]     = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [startTime,    setStartTime]    = useState("09:00");
  const [endTime,      setEndTime]      = useState("10:00");
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  const slotsMap = availability.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {});

  const selectedKey = toKey(selected);
  const daySlots    = (slotsMap[selectedKey] || [])
    .slice()
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/availability/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await handleResponse(res);
      setAvailability(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      toast.error("Failed to load availability.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Early return AFTER all hooks
  if (role !== "teacher") {
    window.location.href = "/";
    return null;
  }

  const handleSave = async () => {
    if (startTime >= endTime) {
      toast.error("End time must be after start time.");
      return;
    }
    if (daySlots.some(s => s.start_time.slice(0, 5) === startTime)) {
      toast.error("A slot at this start time already exists.");
      return;
    }

    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/availability/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          day:        selectedKey,
          start_time: startTime,
          end_time:   endTime,
        }),
      });
      const data = await handleResponse(res);

      if (res.ok) {
        toast.success("Slot saved!");
        setAvailability(prev => [...prev, data]);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteAvailability(token, id);
    setAvailability(prev => prev.filter(a => a.id !== id));
    toast.success("Slot deleted!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Manage Availability</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add time slots for students to book lessons with you.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Calendar
              selected={selected}
              onSelect={setSelected}
              slotsMap={slotsMap}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <h2 className="text-sm font-medium text-gray-800">Add slot</h2>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Selected date</label>
                <div className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 font-medium">
                  {fmtDisplay(selected)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start time</label>
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    {TIME_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End time</label>
                  <select
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    {TIME_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save slot"}
              </button>

              <div className="border-t border-gray-100" />

              <div>
                <p className="text-xs text-gray-400 mb-2">
                  {daySlots.length > 0
                    ? `${daySlots.length} slot${daySlots.length > 1 ? "s" : ""} — ${fmtDisplay(selected)}`
                    : `No slots for ${fmtDisplay(selected)}`}
                </p>

                {daySlots.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-5">
                    Click "Save slot" to add your first slot.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-0.5">
                    {daySlots.map(slot => (
                      <SlotChip key={slot.id} slot={slot} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}