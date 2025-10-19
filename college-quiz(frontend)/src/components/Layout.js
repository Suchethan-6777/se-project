import React from "react";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        {children}
      </main>
    </div>
  );
}


