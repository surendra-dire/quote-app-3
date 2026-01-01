import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/login/Login";
import Quotes from "./components/quotes/Quotes";
import Register from "./components/register/Register"; // 1. Added this import

function AppWrapper() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/" element={<Login setUser={setUser} />} />

      {/* 2. Added the Register Route here */}
      <Route path="/register" element={<Register />} />

      {/* Quotes Route */}
      <Route
        path="/quotes"
        element={
          user ? <Quotes user={user} logout={logout} /> : <Login setUser={setUser} />
        }
      />
    </Routes>
  );
}

export default function App() {
  return <AppWrapper />;
}