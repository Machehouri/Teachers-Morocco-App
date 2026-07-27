import { useState } from "react";
import { createTeacher } from "../api";
import toast from "react-hot-toast";

export default function CreateTeacher() {
  const [form, setForm] = useState({
    bio: "", city: "", price_per_hour: "", phone: "", image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token    = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("bio",           form.bio);
      formData.append("city",          form.city);
      formData.append("price_per_hour", form.price_per_hour);
      formData.append("phone",         form.phone);
      if (form.image) formData.append("image", form.image);

      await createTeacher(token, formData);
      toast.success("Teacher profile created!");
      window.location.href = "/teachers";
    } catch {
      // handleResponse already toasted
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">

        {/* header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Create teacher profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">Share your experience with students in Morocco</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* image upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                  {preview ? "Change photo" : "Upload photo"}
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
                placeholder="Tell students about yourself, your experience, and teaching style…"
                required
                rows={4}
                className={field + " resize-none"}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
              />
            </div>

            {/* city + price row */}
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
                  Price per hour
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating profile…" : "Create profile"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}