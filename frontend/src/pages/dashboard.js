import { useEffect, useState } from "react";
import { getBookings, updateBookingStatus, handleResponse } from "../api";

const API_URL = "http://127.0.0.1:8000";


// ── helpers ────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  accepted: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  rejected: { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
  pending:  { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-semibold text-blue-600 text-sm flex-shrink-0">
      {name?.slice(0, 2).toUpperCase() ?? "??"}
    </div>
  );
}

function getNextLesson(bookings) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookings
    .filter(b => b.status === "accepted" && new Date(b.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] ?? null;
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(dateStr) - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

// ── upcoming lesson card ───────────────────────────────────────────────────
function UpcomingCard({ lesson, role }) {
  if (!lesson) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">No upcoming lessons</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {role === "student" ? "Book a teacher to get started" : "Accept a booking to see it here"}
          </p>
        </div>
      </div>
    );
  }

  const name = role === "teacher" ? lesson.student_name : lesson.teacher_name;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {name?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-xs text-blue-200 mb-0.5">Next lesson</p>
          <p className="text-white font-semibold text-sm">{name}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-blue-200 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/>
                <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5"/>
              </svg>
              {lesson.date}
            </span>
            <span className="text-xs text-blue-200 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {lesson.time?.slice(0, 5)}
            </span>
          </div>
        </div>
      </div>
      <span className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0">
        {daysUntil(lesson.date)}
      </span>
    </div>
  );
}

// ── earnings section ───────────────────────────────────────────────────────
function EarningsSection({ bookings, pricePerHour }) {
  const now      = new Date();
  const accepted = bookings.filter(b => b.status === "accepted");
  const total    = accepted.length * pricePerHour;

  const thisMonth = accepted.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthEarnings = thisMonth.length * pricePerHour;
  const pending       = bookings.filter(b => b.status === "pending").length;

  // 5-month bar chart
  const months = Array.from({ length: 5 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    const count = accepted.filter(b => {
      const bd = new Date(b.date);
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    }).length;
    return { label: d.toLocaleString("default", { month: "short" }), value: count * pricePerHour };
  });
  const maxVal = Math.max(...months.map(m => m.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <h3 className="text-sm font-medium text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Earnings
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-xs text-emerald-600">Total earned</p>
          <p className="text-xl font-semibold text-emerald-700 mt-1">
            {total} <span className="text-xs font-normal">MAD</span>
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-blue-600">This month</p>
          <p className="text-xl font-semibold text-blue-700 mt-1">
            {monthEarnings} <span className="text-xs font-normal">MAD</span>
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="text-xl font-semibold text-amber-700 mt-1">
            {pending} <span className="text-xs font-normal">lessons</span>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">Monthly earnings (MAD)</p>
      <div className="flex items-end gap-2 h-20">
        {months.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {m.value > 0 && <span className="text-xs text-gray-400">{m.value}</span>}
            <div
              className="w-full rounded-t-md bg-blue-500"
              style={{ height: `${(m.value / maxVal) * 56}px`, minHeight: m.value > 0 ? "4px" : "0px" }}
            />
            <span className="text-xs text-gray-400">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const username = localStorage.getItem("username");
  const role     = localStorage.getItem("role");
  const token    = localStorage.getItem("token");

  const [bookings,       setBookings]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [filter,         setFilter]         = useState("all");
  const [search,         setSearch]         = useState("");

  useEffect(() => {
    fetchBookings();
    if (role === "teacher") fetchTeacherProfile();
  }, []); // eslint-disable-line

  const fetchBookings = async () => {
    try {
      const data = await getBookings(token);
      setBookings(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherProfile = async () => {
    try {
      const res  = await fetch(`${API_URL}/teachers/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await handleResponse(res);
      setTeacherProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(token, id, status);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  // derived
  const nextLesson   = getNextLesson(bookings);
  const accepted     = bookings.filter(b => b.status === "accepted").length;
  const pending      = bookings.filter(b => b.status === "pending").length;
  const uniquePeople = new Set(
    bookings.map(b => role === "teacher" ? b.student_name : b.teacher_name)
  ).size;

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => {
      if (!search) return true;
      const name = role === "teacher" ? b.student_name : b.teacher_name;
      return name?.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Welcome back</p>
            <h1 className="text-lg font-semibold text-gray-900">{username}</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 capitalize border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {role}
          </span>
        </div>

        {/* upcoming lesson */}
        <UpcomingCard lesson={nextLesson} role={role} />

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Accepted</p>
            <p className="text-2xl font-semibold text-emerald-600 mt-1">{accepted}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Pending</p>
            <p className="text-2xl font-semibold text-amber-500 mt-1">{pending}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">{role === "teacher" ? "Students" : "Teachers"}</p>
            <p className="text-2xl font-semibold text-blue-600 mt-1">{uniquePeople}</p>
          </div>
        </div>

        {/* earnings (teacher only) */}
        {role === "teacher" && teacherProfile && (
          <EarningsSection
            bookings={bookings}
            pricePerHour={Number(teacherProfile.price_per_hour) || 0}
          />
        )}

        {/* teacher quick actions */}
        {role === "teacher" && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Edit profile</p>
                <p className="text-xs text-gray-400 mt-0.5">Update your teacher info</p>
              </div>
              <button
                onClick={() => window.location.href = "/edit"}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition active:scale-95"
              >
                Edit
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Manage availability</p>
                <p className="text-xs text-gray-400 mt-0.5">Add or remove time slots</p>
              </div>
              <button
                onClick={() => window.location.href = "/availability"}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl transition active:scale-95"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        {/* bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-sm font-medium text-gray-800">
              {role === "teacher" ? "Student bookings" : "My bookings"}
            </h2>
            <div className="relative">
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder={role === "teacher" ? "Search students…" : "Search teachers…"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 transition"
              />
            </div>
          </div>

          {/* filter tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
            {["all", "pending", "accepted", "rejected"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize
                  ${filter === f ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {f}
                {f !== "all" && (
                  <span className="ml-1 text-gray-400">
                    {bookings.filter(b => b.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400">No bookings found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(b => {
                const name = role === "teacher" ? b.student_name : b.teacher_name;
                return (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={name} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/>
                              <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5"/>
                            </svg>
                            {b.date}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                              <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            {b.time?.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={b.status} />
                      {role === "teacher" && b.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatus(b.id, "accepted")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition active:scale-95"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatus(b.id, "rejected")}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition active:scale-95"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}