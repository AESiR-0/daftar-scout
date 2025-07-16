'use client'
import React, { useEffect, useState } from "react";

const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 800;
};

const blockerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "#0e0e0e",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  fontSize: "1.25rem",
  textAlign: "center",
  padding: "2rem"
};

const MobileBlocker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(isMobileDevice());
    const handleResize = () => setBlocked(isMobileDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (blocked) {
    return (
      <div style={blockerStyle}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Desktop Only</h1>
        <p>This software is only compatible with desktops for now.<br />Please access from a desktop or laptop device.</p>
      </div>
    );
  }
  return <>{children}</>;
};

export default MobileBlocker; 