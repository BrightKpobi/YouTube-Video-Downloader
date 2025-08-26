"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import "../globals.css";
// import History from "./history/page";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 20px",
        background: "#070032",
        color: "#fff",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "20px" }}>YTV Downloader</h1>

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "5px",
          }}
        >
          <Image src="/menu-icon.png" alt="Menu" width={32} height={32} />
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              borderRadius: "8px",
              padding: "10px",
              top: "110%",
              right: 0,
              width: "160px",
              zIndex: 10,
            }}
          >
            <Link
              className="menu"
              href="/"
              style={{
                display: "block",
                padding: "8px",
                borderRadius: "5px",
                color: "#1e293b",
                textDecoration: "none",
              }}
            >
              Home
            </Link>
            <Link
              className="menu"
              href="/history"
              style={{
                display: "block",
                padding: "8px",
                borderRadius: "5px",
                color: "#1e293b",
                textDecoration: "none",
              }}
            >
              History
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
