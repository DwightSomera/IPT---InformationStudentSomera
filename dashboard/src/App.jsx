import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useState } from 'react';
import Home from "./pages/Home";
import AddStudent from "./pages/AddStudent";
import Sidebar from "./pages/Sidebar";
import Car from "./pages/Car";
import Users from "./pages/Users";  

import Login from "./pages/Login";


function ProtectedLayout({ setIsAuthenticated }) {
  return (
    <div className="app-layout">
      <Sidebar setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  // Check if user data exists in localStorage and keep it in state
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Routes>
        {/* If already logged in, redirect Login attempts to Home */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Protected Routes: If not logged in, redirect to Login */}
        <Route element={isAuthenticated ? <ProtectedLayout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />}>
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


