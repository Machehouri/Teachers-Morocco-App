import { useEffect, useRef, useState } from "react";
import { markNotificationRead } from "../api";

const API_URL = "http://127.0.0.1:8000";

export default function Navbar() {
  const token    = localStorage.getItem("token");
  const role     = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const [notifications, setNotifications] = useState([]);
  const [open,          setOpen]          = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token) fetchNotifications();
  }, []); // eslint-disable-line

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res  = await fetch(`${API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRead = async (id) => {
    await markNotificationRead(token, id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => markNotificationRead(token, n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navLink = "text-sm text-gray-600 hover:text-gray-900 transition font-medium";

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* logo */}
        <a href="/" className="text-lg font-bold text-blue-600 flex-shrink-0">
          TeachMe
        </a>

        {/* desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {token ? (
            <>
              <a href="/"            className={navLink}>Home</a>
              <a href="/dashboard"   className={navLink}>Dashboard</a>
              {role === "teacher" && (
                <>
                  <a href="/availability" className={navLink}>Availability</a>
                  <a href="/create"       className={navLink}>Create profile</a>
                </>
              )}

              {/* notification bell */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(v => !v)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* dropdown */}
                {open && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-800">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleRead(n.id)}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition flex items-start gap-3
                              ${!n.is_read ? "bg-blue-50/50" : ""}`}
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                              ${n.is_read ? "bg-gray-300" : "bg-blue-500"}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${n.is_read ? "text-gray-500" : "text-gray-800"}`}>
                                {n.message}
                              </p>
                              {n.created_at && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(n.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* user + logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                  {username?.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <a href="/login"  className={navLink}>Login</a>
              <a
                href="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition active:scale-95"
              >
                Sign up
              </a>
            </>
          )}
        </div>

        {/* mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
          onClick={() => setMenuOpen(v => !v)}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>

      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {token ? (
            <>
              <a href="/"          className="block py-2 text-sm text-gray-700">Home</a>
              <a href="/dashboard" className="block py-2 text-sm text-gray-700">Dashboard</a>
              {role === "teacher" && (
                <>
                  <a href="/availability" className="block py-2 text-sm text-gray-700">Availability</a>
                  <a href="/create"       className="block py-2 text-sm text-gray-700">Create profile</a>
                </>
              )}
              <button
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                className="block w-full text-left py-2 text-sm text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login"  className="block py-2 text-sm text-gray-700">Login</a>
              <a href="/signup" className="block py-2 text-sm text-gray-700">Sign up</a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}