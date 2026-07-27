import { useEffect, useState } from "react";
import { updateTeacher } from "../api";
import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

export default function EditTeacher() {
  const token    = localStorage.getItem("token");
  const role     = localStorage.getItem("role");

  const [teacher, setTeacher] = useState(null);
  const [form,    setForm]    = useState({
    bio: "", city: "", price_per_hour: "", phone: "", image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // redirect non-teachers
  if (role !== "teacher") {
    window.location.href = "/";
    return null;
  }

  useEffect(() => { fetchTeacher(); }, []); // eslint-disable-line

  // ── fetch own profile via /teachers/me/ ───────────────────────────────
  const fetchTeacher = async () => {
    try {
      const res  = await fetch(`${API_URL}/teachers/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTeacher(data);
      setForm({
        bio:           data.bio           || "",
        city:          data.city          || "",
        price_per_hour: data.price_per_hour || "",
        phone:         data.phone         || "",
        image:         null,
      });
      if (data.image) setPreview(data.image);
    } catch (err) {
      console.error(err);
      toast.error("Could not load your profile.");
    } finally {
      setFetching(false);
    }
  };

  // ── image picker ──────────────────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // ── submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("bio",            form.bio);
      formData.append("city",           form.city);
      formData.append("price_per_hour", form.price_per_hour);
      formData.append("phone",          form.phone);
      if (form.image) formData.append("image", form.image);

      await updateTeacher(token, teacher.id, formData);
      toast.success("Profile updated!");
    } catch {
      // handleResponse already toasted
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  // ── loading state ─────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">No teacher profile found.</p>
          <a href="/create" className="text-sm text-blue-600 hover:underline mt-2 block">
            Create one →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Edit profile</h1>
            <p className="text-sm text-gray-400 mt-0.5">Update your teacher information</p>
          </div>
          <a
            href={`/teachers/${teacher.id}`}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            View public profile
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* image */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Profile photo</label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  Change photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* bio */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio</label>
              <textarea
                rows={4}
                placeholder="Tell students about yourself…"
                required
                className={field + " resize-none"}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.bio.length} chars
              </p>
            </div>

            {/* city + price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Casablanca"
                  required
                  className={field}
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Price/hr
                  <span className="ml-1 text-gray-400 font-normal">(MAD)</span>
                </label>
                <input
                  type="number"
                  placeholder="100"
                  min="1"
                  required
                  className={field}
                  value={form.price_per_hour}
                  onChange={e => setForm({ ...form, price_per_hour: e.target.value })}
                />
              </div>
            </div>

            {/* phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </span>
                <input
                  type="tel"
                  placeholder="0612345678"
                  required
                  className={field + " pl-10"}
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => window.location.href = "/dashboard"}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}