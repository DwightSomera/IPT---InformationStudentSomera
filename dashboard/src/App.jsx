import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AddStudent from "./pages/AddStudent";
import Sidebar from "./pages/Sidebar";
import Car from "./pages/Car";
import Users from "./pages/Users";  

import Login from "./pages/Login";


function ProtectedLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  // Check if user data exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* If already logged in, redirect Login attempts to Home */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Protected Routes: If not logged in, redirect to Login */}
        <Route element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Home />} />
          <Route path="/students" element={<AddStudent />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/users" element={<Users />} />
          <Route path="/add-user" element={<Users />} />
          <Route path="/car" element={<Car />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


