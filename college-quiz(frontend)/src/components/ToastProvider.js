import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({ notify: (_msg, _type) => {} });

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...toastStyleByType[t.type] }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const styles = {
  container: {
    position: "fixed",
    right: 20,
    bottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 9999,
  },
  toast: {
    padding: "10px 14px",
    borderRadius: 10,
    color: "#fff",
    boxShadow: "0 6px 20px rgba(0,0,0,.2)",
    fontWeight: 600,
    maxWidth: 380,
  },
};

const toastStyleByType = {
  info: { background: "#374151" },
  success: { background: "#16a34a" },
  error: { background: "#dc2626" },
  warning: { background: "#f59e0b" },
};


