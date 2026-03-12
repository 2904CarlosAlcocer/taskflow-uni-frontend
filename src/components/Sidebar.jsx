import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ view, setView }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const navItems = [
    { id: "mis-tareas", label: "Mis Tareas", icon: "≡" },
    { id: "amigos",     label: "Ver Grupo",  icon: "◎" },
  ];

  return (
    <aside style={{
      width: 220, background: "rgba(10,10,11,0.98)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      padding: "28px 0", position: "sticky", top: 0, height: "100vh",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #E8FF47, #B8D400)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>TaskFlow</div>
            <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace" }}>UNI</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "'Space Mono', monospace", padding: "0 12px", marginBottom: 8, letterSpacing: "0.1em" }}>MENÚ</div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, border: "none",
            background: view === item.id ? "rgba(232,255,71,0.08)" : "transparent",
            color: view === item.id ? "#E8FF47" : "#666",
            cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
            fontWeight: view === item.id ? 600 : 400,
            transition: "all 0.15s", marginBottom: 2,
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
            {view === item.id && <span style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:"#E8FF47" }} />}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: (user?.avatar_color || "#E8FF47") + "22",
            border: `2px solid ${(user?.avatar_color || "#E8FF47")}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: user?.avatar_color || "#E8FF47",
            fontFamily: "'Space Mono', monospace",
          }}>{user?.nombre?.charAt(0) || "?"}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc", lineHeight: 1.2 }}>{user?.nombre}</div>
            <div style={{ fontSize: 11, color: "#555" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
          color: "#555", fontSize: 13, padding: "8px", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.target.style.color="#FF6B6B"; e.target.style.borderColor="rgba(255,107,107,0.3)"; }}
          onMouseLeave={e => { e.target.style.color="#555"; e.target.style.borderColor="rgba(255,255,255,0.08)"; }}
        >Cerrar sesión</button>
      </div>
    </aside>
  );
}
