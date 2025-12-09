// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "15vh" }}>
      <h1>Military Asset Management System</h1>
      <p style={{ fontSize: "18px", marginTop: "10px" }}>
        Securely manage bases, equipment, movement logs and asset expenditure.
      </p>

      <button
        onClick={() => navigate("/login")}
        style={{
          marginTop: "25px",
          padding: "10px 22px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "5px",
          background: "#1976d2",
          border: "none",
          color: "white",
        }}
      >
        Login
      </button>
    </div>
  );
}
