import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
const STORAGE_KEY = "agst_notifications";
const SYNC_URL_KEY = "agst_notif_sync_url";

function loadNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveNotifications(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function getSyncUrl() {
  try {
    if (import.meta?.env?.VITE_NOTIF_SYNC_URL) {
      return import.meta.env.VITE_NOTIF_SYNC_URL;
    }
  } catch {}

  try {
    return localStorage.getItem(SYNC_URL_KEY) || "";
  } catch {
    return "";
  }
}

function syncNotification(notification) {
  const url = getSyncUrl();
  if (!url) return;

  try {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    }).catch(() => {});
  } catch {}
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState(() => loadNotifications());

  const addNotification = useCallback(({ type = "info", message }) => {
    if (!message) return;

    const nova = {
      id: Date.now() + Math.random(),
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const next = [nova, ...prev].slice(0, 50);
      saveNotifications(next);
      return next;
    });

    // Placeholder para sincronizar com backend quando a API estiver pronta.
    syncNotification(nova);
  }, []);

  const showToast = useCallback(
    ({ type = "success", message }) => {
      setToast({ type, message });
      addNotification({ type, message });

      setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    [addNotification],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      saveNotifications(next);
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ToastContext.Provider
      value={{
        showToast,
        addNotification,
        notifications,
        unreadCount,
        markAllRead,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return ctx;
}
