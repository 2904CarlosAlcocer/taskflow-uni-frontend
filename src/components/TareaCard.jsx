import { useState } from "react";

const prioridadConfig = {
  critica: { label: "CRÍTICA", color: "#FF3333", bg: "rgba(255,51,51,0.12)" },
  alta:    { label: "ALTA",    color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
  media:   { label: "MEDIA",   color: "#E8FF47", bg: "rgba(232,255,71,0.12)" },
  baja:    { label: "BAJA",    color: "#555",    bg: "rgba(136,136,136,0.08)" },
};

const estadoIcon  = { pendiente: "○", en_progreso: "◑", completada: "●" };
const estadoColor = { pendiente: "#444", en_progreso: "#47FFD4", completada: "#E8FF47" };

export default function TareaCard({ tarea, editable, onEdit, onDelete, onStatusChange }) {
  const [hovered, setHovered] = useState(false);
  const prio  = prioridadConfig[tarea.prioridad] || prioridadConfig.media;
  const isDone = tarea.estado === "completada";

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("es-CR", { day: "numeric", month: "short" });
  };

  const isOverdue = tarea.fecha_entrega && new Date(tarea.fecha_entrega) < new Date() && !isDone;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: "1px solid",
        borderColor: isOverdue ? "rgba(255,51,51,0.25)" : hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        borderRadius: 12, padding: "14px 16px",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-1px)" : "none",
        opacity: isDone ? 0.6 : 1,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Status toggle */}
        <button
          onClick={editable ? onStatusChange : undefined}
          disabled={!editable}
          style={{
            background: "none", border: "none",
            cursor: editable ? "pointer" : "default",
            fontSize: 20, color: estadoColor[tarea.estado],
            padding: 0, marginTop: 1, transition: "color 0.2s", flexShrink: 0,
          }}
        >{estadoIcon[tarea.estado]}</button>

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 8,
            color: isDone ? "#555" : "#ddd",
            textDecoration: isDone ? "line-through" : "none",
          }}>{tarea.titulo}</div>

          {tarea.descripcion && (
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8, lineHeight: 1.5 }}>
              {tarea.descripcion}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10, fontFamily: "'Space Mono', monospace",
              color: prio.color, background: prio.bg,
              border: `1px solid ${prio.color}33`,
              borderRadius: 4, padding: "2px 7px",
            }}>{prio.label}</span>

            {tarea.materia_nombre && (
              <span style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: (tarea.materia_color || "#47FFD4") + "cc",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: tarea.materia_color || "#47FFD4", display: "inline-block" }} />
                {tarea.materia_nombre}
              </span>
            )}

            {tarea.fecha_entrega && (
              <span style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: isOverdue ? "#FF6B6B" : "#555",
              }}>
                {isOverdue ? "⚠ " : "📅 "}{formatDate(tarea.fecha_entrega)}
              </span>
            )}
          </div>
        </div>

        {/* Acciones (solo si es editable) */}
        {editable && hovered && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={onEdit} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 7, padding: "5px 10px", color: "#888",
              fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
              onMouseEnter={e => { e.target.style.color="#E8FF47"; e.target.style.borderColor="rgba(232,255,71,0.3)"; }}
              onMouseLeave={e => { e.target.style.color="#888"; e.target.style.borderColor="rgba(255,255,255,0.1)"; }}
            >Editar</button>
            <button onClick={onDelete} style={{
              background: "rgba(255,51,51,0.05)", border: "1px solid rgba(255,51,51,0.15)",
              borderRadius: 7, padding: "5px 10px", color: "#FF6B6B",
              fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>Eliminar</button>
          </div>
        )}

        {/* Solo lectura */}
        {!editable && (
          <span style={{ fontSize: 10, color: "#333", fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>👁</span>
        )}
      </div>
    </div>
  );
}
