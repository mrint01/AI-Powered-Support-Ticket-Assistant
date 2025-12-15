import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TicketsList from "./components/TicketsList";
import TicketForm from "./components/TicketForm";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthProvider, useAuth } from "./AuthContext";
import AdminTicketsList from "./components/AdminTicketsList";

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="mb-4 flex gap-4">
      {user && (
        <Link to="/" className="text-blue-600 hover:underline">
          {user.role === "admin" ? "Admin Panel" : "My Tickets"}
        </Link>
      )}
      {user && user.role === "user" && (
        <Link to="/new" className="text-blue-600 hover:underline">
          Submit Ticket
        </Link>
      )}
      {!user && (
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      )}
      {!user && (
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      )}

      {user && (
        <button
          onClick={logout}
          className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
        >
          Logout
        </button>
      )}
    </nav>
  );
}

function HomeRoute() {
  const { user, loading } = useAuth();
  console.log("user ",user)
  console.log(" localStorage ", localStorage.getItem("user"))
  if (loading) return <div>Loading...</div>;
  if (user && user.role === "admin") return <AdminTicketsList />;
  return <TicketsList />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="p-4">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/new" element={<TicketForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
