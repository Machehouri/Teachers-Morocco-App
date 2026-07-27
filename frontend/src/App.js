import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Teachers from "./pages/Teachers";
import CreateTeacher from "./pages/CreateTeacher";
import EditTeacher from "./pages/EditTeacher";
import TeacherProfile from "./pages/TeacherProfile";
import Dashboard from "./pages/dashboard";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import { Toaster } from "react-hot-toast";
import Availability from "./pages/Availability";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/availability" element={<Availability />} />

        <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateTeacher />
              </ProtectedRoute>
            }
          />
        <Route path="/edit" element={<EditTeacher />} />
        <Route path="/teachers/:id" element={<TeacherProfile />} />
        <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;