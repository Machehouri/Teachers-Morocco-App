import { useEffect, useState } from "react";
import { getTeachers } from "../api";
import { deleteTeacher } from "../api";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchTeachers = async (query = "") => {
    const data = await getTeachers(token, query);
    if (Array.isArray(data.results)) {
    setTeachers(data.results || []);
    } else if (Array.isArray(data)) {
    setTeachers(data);
    } else {
    setTeachers([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeachers(search);
  };

  const handleDelete = async (id) => {
  const token = localStorage.getItem("token");

  const confirmDelete = window.confirm("Are you sure?");
  if (!confirmDelete) return;

  await deleteTeacher(token, id);

  alert("Deleted!");

  window.location.reload();
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
        <div className="mb-8">

        <h1 className="text-5xl font-bold text-gray-800">
            Find Private Teachers
        </h1>

        <p className="text-gray-500 mt-2">
            Discover the best teachers in Morocco
        </p>

        </div>
    <div>
      <h1 className="text-5xl font-bold text-blue-600">
        Teachers
     </h1>

        <form
        onSubmit={handleSearch}
        className="flex gap-3 mb-8"
        >
        <input
            type="text"
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300"
        />

        <button
            className="bg-blue-600 text-white px-6 rounded-xl"
        >
            Search
        </button>
        </form>

      {/* 📋 LIST */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

  {teachers.length === 0 ? (

    <p className="text-gray-500">
      No teachers found
    </p>

  ) : (

    teachers.map((t) => (

      <div
        key={t.id}
        onClick={() => window.location.href = `/teachers/${t.id}`}
        className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-2xl transition duration-300"
      >

        {t.image ? (
        <img
            src={t.image}
            alt=""
            className="w-full h-56 object-cover object-top"
        />
        ) : (
        <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt=""
            className="w-full h-56 object-cover object-top"
        />
        )}

        <div className="p-5">

          <h2 className="text-2xl font-bold">
            {t.user}
          </h2>

          <p className="text-gray-500 mt-1">
            📍 {t.city}
          </p>

          <p className="mt-3 text-yellow-500 font-semibold">
            ⭐ {t.average_rating}
          </p>

          <p className="mt-2 text-green-600 font-bold">
            {t.price_per_hour} MAD/hour
          </p>

        </div>

      </div>

    ))

  )}

    </div>
    </div>
    </div>
  );
}


