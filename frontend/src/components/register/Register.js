import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api"; // Ensure this function exists in your api.js
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Sends the data to your Spring Boot backend
      await registerUser(formData); 
      alert("Registration Successful!");
      navigate("/"); // Moves back to login page
    } catch (err) {
      setError("Registration failed. Username might be taken.");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password" 
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Submit</button>
          {error && <p className="error">{error}</p>}
        </form>
        
        <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <Link to="/" className="back-to-login">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;