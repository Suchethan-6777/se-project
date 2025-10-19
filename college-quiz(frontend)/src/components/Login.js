// src/components/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { getStoredUser, saveUser, navigateByRole } from "../utils/auth";

function Login() {
  const [userType, setUserType] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  // Check for existing session
  useEffect(() => {
    const user = getStoredUser();
    if (user?.role) {
      navigateByRole(navigate, user.role);
    }
  }, []);

  // Google OAuth Login
  const handleGoogleSuccess = (credentialResponse) => {
    const jwt = credentialResponse.credential;
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    const email = payload.email;

    if (!email.endsWith("@student.nitw.ac.in") && !email.endsWith("@nitw.ac.in")) {
      showToast("⚠ Only NITW members are allowed!", "error");
      return;
    }

    if (!termsAccepted) {
      showToast("⚠ You must accept the Terms & Conditions!", "error");
      setShowTermsModal(true);
      return;
    }

    const user = {
      email,
      role: userType,
      method: "google",
      lastLogin: new Date().toLocaleString(),
    };
    // Social login is considered persistent
    saveUser(user, true);
    showToast("✅ Google Login Successful!", "success");
    navigateByRole(navigate, userType);
  };

  const handleGoogleError = () => {
    showToast("❌ Google Login Failed. Try again.", "error");
  };

  // Email + Password Login
  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      showToast("⚠ You must accept the Terms & Conditions!", "error");
      setShowTermsModal(true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!email.endsWith("@student.nitw.ac.in") && !email.endsWith("@nitw.ac.in")) {
        showToast("⚠ Only NITW members are allowed!", "error");
        return;
      }

      if (password.trim().length < 6) {
        showToast("⚠ Password must be at least 6 characters.", "error");
        return;
      }

      const user = {
        email,
        role: userType,
        method: "email",
        lastLogin: new Date().toLocaleString(),
      };

      saveUser(user, rememberMe);

      showToast("✅ Login Successful!", "success");
      navigateByRole(navigate, userType);
    }, 1000);
  };

  // Toast notifications
  const showToast = (message, type = "info") => {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.zIndex = "9999";
    toast.style.background =
      type === "success" ? "green" : type === "error" ? "red" : "gray";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.card}>
        <h2 style={styles.title}>College Quiz Portal</h2>
        <p style={styles.subtitle}>Login with your NITW credentials</p>

        {/* User Type Selector */}
        <div style={styles.radioGroup}>
          {["student", "faculty", "admin"].map((role) => (
            <label key={role} style={{ marginRight: "15px" }}>
              <input
                type="radio"
                name="userType"
                value={role}
                checked={userType === role}
                onChange={(e) => setUserType(e.target.value)}
              />{" "}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </label>
          ))}
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleEmailLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email (NITW only)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <div style={styles.extraOptions}>
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />{" "}
              Remember Me
            </label>
            <button
              type="button"
              style={styles.linkBtn}
              onClick={() => showToast("🔑 Reset link sent (demo)", "info")}
            >
              Forgot Password?
            </button>
          </div>

          <div style={{ margin: "10px 0" }}>
            <label>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />{" "}
              I agree to the <b>Terms & Conditions</b>
            </label>
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ margin: "15px 0", color: "#ccc" }}>or</p>

        {/* Google Login */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        {/* Footer */}
        <footer style={styles.footer}>
          &copy; {new Date().getFullYear()} College Quiz Portal
        </footer>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Terms & Conditions</h3>
            <div style={styles.modalContent}>
              <p>
                By using this portal, you agree to abide by all rules, maintain academic integrity,
                and restrict usage to authorized NITW members. Unauthorized access,
                sharing answers, or cheating may lead to account suspension or academic penalties.
                All data collected will be used only for academic and administrative purposes.
              </p>
              <p style={{ fontSize: "12px", color: "#888" }}>
                Full terms are available in the official policy document.
              </p>
            </div>
            <button
              style={styles.closeBtn}
              onClick={() => setShowTermsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)",
    fontFamily: "Arial, sans-serif",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    background: "rgba(0,0,0,0.4)",
  },
  card: {
    position: "relative",
    background: "#fff",
    padding: "44px",
    borderRadius: "16px",
    width: "380px",
    boxShadow: "0 20px 50px rgba(2, 6, 23, 0.35)",
    textAlign: "center",
    zIndex: 1,
  },
  title: { marginBottom: "8px", color: "#111827", letterSpacing: "0.2px" },
  subtitle: { marginBottom: "22px", color: "#6b7280", fontSize: "14px" },
  radioGroup: { display: "flex", justifyContent: "center", marginBottom: "15px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column" },
  input: { marginBottom: "14px", padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "15px", background: "#f9fafb", outline: "none" },
  extraOptions: { display: "flex", justifyContent: "space-between", marginBottom: "15px", fontSize: "14px" },
  linkBtn: { background: "none", border: "none", color: "#2563eb", cursor: "pointer" },
  loginBtn: { padding: "12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", transition: "transform .05s ease" },
  footer: { marginTop: "20px", fontSize: "12px", color: "#9ca3af" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  modal: { background: "#fff", padding: "20px 30px", borderRadius: "8px", width: "400px", maxHeight: "80vh", overflowY: "auto", textAlign: "left" },
  modalContent: { marginTop: "10px", fontSize: "13px", color: "#333" },
  closeBtn: { marginTop: "15px", padding: "8px 12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
};

export default Login;
