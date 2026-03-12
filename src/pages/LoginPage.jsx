import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const COLORS = ["#E8FF47","#47FFD4","#FF6B6B","#B47FFF","#FF9F47","#47B4FF"];

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nombre:"", email:"", password:"", avatar_color:"#E8FF47" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/"); }, [user]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload  = mode === "login" ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(endpoint, payload);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0B",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: 20,
      backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(232,255,71,0.05) 0%, transparent 70%)",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #E8FF47, #B8D400)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 14px",
          }}>⚡</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>TaskFlow Uni</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 4, fontFamily: "'Space Mono', monospace" }}>
            {mode === "login" ? "BIENVENIDO DE VUELTA" : "CREA TU CUENTA"}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "32px 28px",
        }}>
          <form onSubmit={submit}>
            {mode === "register" && (
              <Field label="Nombre completo" name="nombre" value={form.nombre} onChange={handle} placeholder="Juan Pérez" />
            )}
            <Field label="Email" name="email" type="email" value={form.email} onChange={handle} placeholder="tu@email.com" />
            <Field label="Contraseña" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" />

            {mode === "register" && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, color: "#777", fontFamily: "'Space Mono', monospace", marginBottom: 10, letterSpacing: "0.06em" }}>COLOR DE AVATAR</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {COLORS.map(c => (
                    <button type="button" key={c} onClick={() => setForm(f => ({...f, avatar_color: c}))} style={{
                      width: 32, height: 32, borderRadius: "50%", background: c,
                      border: form.avatar_color === c ? "3px solid #fff" : "3px solid transparent",
                      cursor: "pointer", transition: "border 0.15s",
                    }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: "rgba(255,51,51,0.1)", border: "1px solid rgba(255,51,51,0.3)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 18,
                color: "#FF6B6B", fontSize: 13,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: 12,
              background: loading ? "#444" : "linear-gradient(135deg, #E8FF47, #C8DF00)",
              border: "none", color: "#0A0A0B", fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {loading ? "Cargando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span style={{ color: "#555", fontSize: 13 }}>
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            </span>
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{
              background: "none", border: "none", color: "#E8FF47",
              fontSize: 13, fontWeight: 600, cursor: "pointer", marginLeft: 6,
            }}>
              {mode === "login" ? "Regístrate" : "Inicia sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, color: "#777", fontFamily: "'Space Mono', monospace", marginBottom: 8, letterSpacing: "0.06em" }}>{label.toUpperCase()}</label>
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required
        style={{
          width: "100%", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          padding: "11px 14px", color: "#eee", fontSize: 14,
          fontFamily: "'DM Sans', sans-serif", outline: "none",
          boxSizing: "border-box", transition: "border 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(232,255,71,0.4)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );
}
