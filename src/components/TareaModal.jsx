import { useState, useEffect } from "react";
import api from "../api/axios";

const COLORES = ["#47FFD4","#E8FF47","#FF6B6B","#B47FFF","#FF9F47","#47B4FF"];

export default function TareaModal({ tarea, materias, onSave, onClose, onMateriaCreada }) {
  const [form, setForm] = useState({
    titulo: "", descripcion: "", materia_id: "",
    prioridad: "media", estado: "pendiente", fecha_entrega: "",
  });
  const [nuevaMateria, setNuevaMateria] = useState({ nombre: "", codigo: "", color: "#47FFD4" });
  const [showNuevaMateria, setShowNuevaMateria] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tarea) {
      setForm({
        titulo: tarea.titulo || "",
        descripcion: tarea.descripcion || "",
        materia_id: tarea.materia_id || "",
        prioridad: tarea.prioridad || "media",
        estado: tarea.estado || "pendiente",
        fecha_entrega: tarea.fecha_entrega ? tarea.fecha_entrega.split("T")[0] : "",
      });
    }
  }, [tarea]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCrearMateria = async () => {
    if (!nuevaMateria.nombre.trim()) return;
    try {
      const { data } = await api.post("/api/materias", nuevaMateria);
      onMateriaCreada(data);
      setForm(f => ({ ...f, materia_id: data.id }));
      setNuevaMateria({ nombre: "", codigo: "", color: "#47FFD4" });
      setShowNuevaMateria(false);
    } catch {
      setError("Error al crear la materia");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) { setError("El título es obligatorio"); return; }
    setLoading(true);
    setError("");
    try {
      await onSave({ ...form, materia_id: form.materia_id || null });
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20, backdropFilter: "blur(6px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#111113", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: "28px", width: "100%", maxWidth: 480,
        fontFamily: "'DM Sans', sans-serif", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>
            {tarea ? "Editar tarea" : "Nueva tarea"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={submit}>
          {/* Título */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>TÍTULO *</label>
            <input name="titulo" value={form.titulo} onChange={handle}
              placeholder="Ej: Entrega de proyecto final..."
              style={inputStyle}
              onFocus={e => e.target.style.borderColor="rgba(232,255,71,0.4)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>DESCRIPCIÓN</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle}
              placeholder="Detalles adicionales..." rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor="rgba(232,255,71,0.4)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Materia */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={labelStyle}>MATERIA</label>
              <button type="button" onClick={() => setShowNuevaMateria(!showNuevaMateria)} style={{
                background: "none", border: "none", color: "#E8FF47",
                fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace",
              }}>+ Nueva</button>
            </div>
            <select name="materia_id" value={form.materia_id} onChange={handle} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Sin materia</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}{m.codigo ? ` (${m.codigo})` : ""}</option>
              ))}
            </select>

            {showNuevaMateria && (
              <div style={{
                background: "rgba(71,255,212,0.05)", border: "1px solid rgba(71,255,212,0.2)",
                borderRadius: 10, padding: 14, marginTop: 10,
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input placeholder="Nombre materia *"
                    value={nuevaMateria.nombre}
                    onChange={e => setNuevaMateria(n => ({...n, nombre: e.target.value}))}
                    style={{ ...inputStyle, flex: 2 }}
                  />
                  <input placeholder="Código"
                    value={nuevaMateria.codigo}
                    onChange={e => setNuevaMateria(n => ({...n, codigo: e.target.value}))}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  {COLORES.map(c => (
                    <button type="button" key={c} onClick={() => setNuevaMateria(n => ({...n, color: c}))} style={{
                      width: 24, height: 24, borderRadius: "50%", background: c,
                      border: nuevaMateria.color === c ? "2px solid #fff" : "2px solid transparent",
                      cursor: "pointer",
                    }} />
                  ))}
                </div>
                <button type="button" onClick={handleCrearMateria} style={{
                  background: "#47FFD4", color: "#0A0A0B", border: "none",
                  borderRadius: 8, padding: "7px 14px", fontSize: 13,
                  fontWeight: 700, cursor: "pointer",
                }}>Crear materia</button>
              </div>
            )}
          </div>

          {/* Prioridad y Estado */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>PRIORIDAD</label>
              <select name="prioridad" value={form.prioridad} onChange={handle} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>ESTADO</label>
              <select name="estado" value={form.estado} onChange={handle} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>FECHA DE ENTREGA</label>
            <input type="date" name="fecha_entrega" value={form.fecha_entrega} onChange={handle}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,51,51,0.1)", border: "1px solid rgba(255,51,51,0.3)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 18,
              color: "#FF6B6B", fontSize: 13,
            }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 10,
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "#666", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: "12px", borderRadius: 10,
              background: "linear-gradient(135deg, #E8FF47, #C8DF00)",
              border: "none", color: "#0A0A0B", fontSize: 14,
              fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>{loading ? "Guardando..." : tarea ? "Guardar cambios" : "Crear tarea"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, color: "#666",
  fontFamily: "'Space Mono', monospace", marginBottom: 8, letterSpacing: "0.06em",
};

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
  padding: "10px 14px", color: "#eee", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", outline: "none",
  boxSizing: "border-box", transition: "border 0.15s",
};
