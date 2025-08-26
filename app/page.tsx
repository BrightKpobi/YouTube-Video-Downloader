"use client";
import { useState } from "react";
import "./globals.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setProgress(0);
    setDownloading(true);
    setVideoTitle("");

    try {
      const cleanUrl = url.split("&")[0].split("?")[0];
      const res = await fetch(
        `/api/download?url=${encodeURIComponent(cleanUrl)}`
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to download");
        setDownloading(false);
        return;
      }

      // Get filename from Content-Disposition header
      const disposition = res.headers.get("Content-Disposition");
      let filename = "video.mp4";
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      // Get total size from Content-Length header
      const total = Number(res.headers.get("Content-Length")) || 0;

      // Read the stream in chunks
      const reader = res.body.getReader();
      let receivedLength = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        if (total) {
          setProgress(Math.round((receivedLength / total) * 100));
        }
      }

      // Combine chunks into a blob
      const blob = new Blob(chunks, { type: "video/mp4" });
      setVideoTitle(filename);

      // Save to localStorage
      const historyItem = {
        title: filename,
        thumbnail: `https://img.youtube.com/vi/${
          cleanUrl.split("v=")[1] || cleanUrl.split("/").pop()
        }/mqdefault.jpg`,
        date: new Date().toISOString().slice(0, 10),
      };
      const prevHistory = JSON.parse(
        localStorage.getItem("downloadHistory") || "[]"
      );
      localStorage.setItem(
        "downloadHistory",
        JSON.stringify([historyItem, ...prevHistory])
      );

      // Trigger browser download
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlObj);

      setProgress(100);
      setDownloading(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="container">
        <div className="content">
          <h1>Download Your YouTube Video</h1>
          <form onSubmit={handleSubmit}>
            <input
              className="url-input"
              type="text"
              placeholder="Paste YouTube video URL"
              style={{ fontSize: "18px" }}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="submit" disabled={downloading}>
              {downloading ? "Downloading..." : "Download"}
            </button>
            {/* Real Progress bar */}
            {downloading && progress < 100 && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
                <span>{progress}%</span>
              </div>
            )}
            {error && (
              <div style={{ color: "red", paddingTop: "5px" }}>{error}</div>
            )}
            {videoTitle && (
              <div style={{ color: "green" }}>Downloaded: {videoTitle}</div>
            )}
          </form>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h2>Fast & Easy</h2>
          <p>Download videos in just a few clicks.</p>
        </div>
        <div className="card">
          <h2>High Quality</h2>
          <p>Choose from multiple resolutions.</p>
        </div>
        <div className="card">
          <h2>Secure</h2>
          <p>Your privacy is guaranteed.</p>
        </div>
      </div>
    </>
  );
}
