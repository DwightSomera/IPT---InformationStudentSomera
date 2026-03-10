import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddStudent from "./pages/AddStudent";
import Sidebar from "./pages/Sidebar";
import Car from "./pages/Car";
import Users from "./pages/Users";  

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/AddStudent" element={<AddStudent />} />
            <Route path="/Car" element={<Car />} />
            <Route path="/Users" element={<Users />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;


