"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

// Define the type for the history items
interface HistoryItem {
  title: string;
  thumbnail: string;
  date: string;
}

export default function History() {
  // Correctly type the state as an array of HistoryItem
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    // Type assertion to tell TypeScript the shape of the parsed data
    const saved = JSON.parse(
      localStorage.getItem("downloadHistory") || "[]"
    ) as HistoryItem[];
    setHistory(saved);
  }, []);

  const handleDelete = (idx: number) => {
    // Type the 'idx' parameter
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    localStorage.setItem("downloadHistory", JSON.stringify(updated));
    setMenuOpen(null);
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "40px",
        color: "#fff",
        background: "linear-gradient(135deg, #070032 60%, #1e1e3f 100%)",
        padding: "32px 0",
        borderRadius: "16px",
        width: "90%",
        minHeight: "60vh",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}
    >
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "8px" }}>
        {history.length === 0 ? "No History" : "Download History"}
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#bdbdbd", marginBottom: "25px" }}>
        {history.length === 0
          ? "You have no history yet. Download videos to see them here."
          : "Here are your downloaded videos."}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px",
          marginTop: "25px",
          padding: "0 16px",
        }}
      >
        {history.length === 0
          ? null
          : history.map((item, idx) => (
              <div className="history-card" key={idx}>
                {/* Three-dot menu */}
                <div
                  className="three-dot-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === idx ? null : idx);
                  }}
                >
                  <span style={{ fontSize: 22, color: "#bdbdbd" }}>⋮</span>
                </div>
                {/* Dropdown menu */}
                {menuOpen === idx && (
                  <div className="three-dot-dropdown">
                    <button onClick={() => handleDelete(idx)}>Delete</button>
                  </div>
                )}
                <Image
                  className="thumbnail"
                  src={item.thumbnail}
                  alt={item.title}
                  width={400}
                  height={225}
                  style={{ objectFit: "cover", borderRadius: "12px" }}
                />
                <div className="details">
                  <h3>{item.title}</h3>
                  <p>Downloaded on: {item.date}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
