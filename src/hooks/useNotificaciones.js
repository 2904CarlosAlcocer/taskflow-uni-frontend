import { useEffect, useState } from "react";
import api from "../api/axios";

export function useNotificaciones() {
  const [permiso, setPermiso] = useState(Notification.permission);

  useEffect(() => {
    if (permiso === "granted") {
      suscribir();
    }
  }, [permiso]);

  const solicitarPermiso = async () => {
    const resultado = await Notification.requestPermission();
    setPermiso(resultado);
    return resultado;
  };

  const suscribir = async () => {
    try {
      // Registrar service worker
      const registro = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Obtener clave pública
      const { data } = await api.get("/api/notificaciones/vapid-public-key");
      const publicKey = data.publicKey;

      // Convertir clave a Uint8Array
      const clavePublica = urlBase64ToUint8Array(publicKey);

      // Suscribirse
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: clavePublica,
      });

      // Enviar suscripción al backend
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
