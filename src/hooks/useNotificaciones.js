import { useEffect, useState } from "react";
import api from "../api/axios";

export function useNotificaciones() {
  const [permiso, setPermiso] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (permiso === "granted") {
      suscribir();
    }
  }, [permiso]);

  const solicitarPermiso = async () => {
    if (typeof Notification === "undefined") return "denied";
    const resultado = await Notification.requestPermission();
    setPermiso(resultado);
    return resultado;
  };

  const suscribir = async () => {
    try {
      if (!("serviceWorker" in navigator)) return;

      const registro = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const { data } = await api.get("/api/notificaciones/vapid-public-key");
      const clavePublica = urlBase64ToUint8Array(data.publicKey);

      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: clavePublica,
      });

      await api.post("/api/notificaciones/suscribir", { suscripcion });
      console.log("✅ Suscripción push guardada");
    } catch (err) {
      console.error("Error suscribiendo:", err);
    }
  };

  return { permiso, solicitarPermiso };
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}