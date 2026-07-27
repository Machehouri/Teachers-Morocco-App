import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createReview } from "../api";
import toast from "react-hot-toast";
import { handleResponse } from "../api";

export default function TeacherProfile() {
  const { id } = useParams();

  const [teacher,          setTeacher]          = useState(null);
  const [selectedSlot,     setSelectedSlot]     = useState(null);
  const [rating,           setRating]           = useState(5);
  const [comment,          setComment]          = useState("");
  const [date,             setDate]             = useState("");
  const [time,             setTime]             = useState("");

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchTeacher = async () => {
    const res  = await fetch(`http://127.0.0.1:8000/teachers/${id}/`);
    const data = await handleResponse(res);
    setTeacher(data);
  };

  useEffect(() => { fetchTeacher(); }, []); // eslint-disable-line

  // ── review ───────────────────────────────────────────────────────────────
  const handleReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Login first"); return; }

    await createReview(token, { teacher: teacher.id, rating, comment });
    toast.success("Review submitted!");
    window.location.reload();
  };

  // ── booking ──────────────────────────────────────────────────────────────
  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Login first"); return; }

    const res = await fetch("http://127.0.0.1:8000/bookings/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teacher: teacher.id, date, time }),
    });

    const data = await res.json();
    console.log(data);

    await handleResponse(res);

    toast.success("Lesson booked!");
    setSelectedSlot(null);
    fetchTeacher();
  };

  // ── loading ──────────────────────────────────────────────────────────────
  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  const openSlots = teacher.availabilities?.filter((a) => !a.is_booked) ?? [];

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── HERO CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 mb-6">

          {/* avatar */}
          {teacher.image ? (
            <img
              src={teacher.image}
              alt={teacher.user}
              className="w-20 h-20 rounded-xl object-cover object-top flex-shrink-0 border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-600 flex-shrink-0">
              {teacher.user?.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {teacher.user}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {teacher.city}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700">
                <svg className="w-3 h-3 fill-amber-500" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {teacher.average_rating} rating
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {teacher.price_per_hour} MAD/hr
              </span>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT COL ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* about */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                About
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {teacher.bio || "No bio provided."}
              </p>
            </div>

            {/* subjects */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                Subjects
              </h2>
              {teacher.subjects?.length === 0 ? (
                <p className="text-sm text-gray-400">No subjects listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects?.map((s) => (
                    <span
                      key={s.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Reviews
              </h2>

              {/* review form */}
              <form
                onSubmit={handleReview}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-5"
              >
                <p className="text-xs text-gray-500 mb-2">Leave a review</p>

                {/* star rating */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        rating >= star ? "text-amber-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Write your review…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition active:scale-95"
                >
                  Submit review
                </button>
              </form>

              {/* review list */}
              {teacher.reviews?.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {teacher.reviews?.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{r.student}</span>
                        <span className="flex items-center gap-0.5 text-amber-400 text-sm">
                          {"★".repeat(r.rating)}
                          <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COL / SIDEBAR ── */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">

              {/* stat mini-cards */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-lg font-semibold text-gray-900">{teacher.average_rating}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Rating</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-lg font-semibold text-gray-900">{teacher.price_per_hour}</div>
                  <div className="text-xs text-gray-400 mt-0.5">MAD/hr</div>
                </div>
              </div>

              {/* phone */}
              <a
                href={`tel:${teacher.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                {teacher.phone}
              </a>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-3">
                  Available slots
                  {openSlots.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                      {openSlots.length}
                    </span>
                  )}
                </p>

                {openSlots.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No slots available right now.
                  </p>
                ) : (
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-0.5">
                    {openSlots.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(a);
                          setDate(a.day.toString().split("T")[0]);
                          setTime(a.start_time);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition
                          ${selectedSlot?.id === a.id
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                      >
                        <p className={`text-xs font-medium ${selectedSlot?.id === a.id ? "text-blue-100" : "text-gray-500"}`}>
                          {a.day}
                        </p>
                        <p className={`text-sm font-medium mt-0.5 ${selectedSlot?.id === a.id ? "text-white" : "text-gray-800"}`}>
                          {a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!selectedSlot}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition
                    ${selectedSlot
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {selectedSlot ? "Book lesson" : "Select a slot first"}
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}