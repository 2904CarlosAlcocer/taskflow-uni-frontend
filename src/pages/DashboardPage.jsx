import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TareaCard from "../components/TareaCard";
import TareaModal from "../components/TareaModal";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";
import { useNotificaciones } from "../hooks/useNotificaciones";

export default function DashboardPage() {
  const { user } = useAuth();
  const [view, setView] = useState("mis-tareas");
  const [misTareas, setMisTareas] = useState([]);
  const [tareasAmigos, setTareasAmigos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [filterEstado, setFilterEstado] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarea, setEditTarea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { permiso, solicitarPermiso } = useNotificaciones();

useEffect(() => {
  if (permiso === "default") {
    solicitarPermiso();
  }
}, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mis, amigos, mats] = await Promise.all([
        api.get("/api/tareas/mias"),
        api.get("/api/tareas/amigos"),
        api.get("/api/materias"),
      ]);
      setMisTareas(mis.data);
      setTareasAmigos(amigos.data);
      setMaterias(mats.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar tarea?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#FF6B6B",
      cancelButtonColor: "#333",
    });
    if (!result.isConfirmed) return;
    await api.delete(`/api/tareas/${id}`);
    setMisTareas(prev => prev.filter(t => t.id !== id));
    Swal.fire({
      title: "¡Eliminada!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      background: "#111",
      color: "#fff",
    });
  };

  const handleStatusChange = async (tarea) => {
    const nextStatus = { pendiente: "en_progreso", en_progreso: "completada", completada: "pendiente" };
    const updated = { ...tarea, estado: nextStatus[tarea.estado] };
    await api.put(`/api/tareas/${tarea.id}`, updated);
    setMisTareas(prev => prev.map(t => t.id === tarea.id ? updated : t));
  };

  const handleSave = async (data) => {
    try {
      if (editTarea) {
        const { data: updated } = await api.put(`/api/tareas/${editTarea.id}`, data);
        setMisTareas(prev => prev.map(t => t.id === editTarea.id ? updated : t));
      } else {
        const { data: created } = await api.post("/api/tareas", data);
        setMisTareas(prev => [created, ...prev]);
      }
      setShowModal(false);
      setEditTarea(null);
      Swal.fire({
        title: editTarea ? "¡Tarea actualizada!" : "¡Tarea creada!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#111",
        color: "#fff",
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la tarea.",
        icon: "error",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#E8FF47",
      });
    }
  };

  const amigoGroups = tareasAmigos.reduce((acc, t) => {
    if (!acc[t.usuario_nombre]) acc[t.usuario_nombre] = { color: t.avatar_color, tareas: [] };
    acc[t.usuario_nombre].tareas.push(t);
    return acc;
  }, {});

  const filteredMias = filterEstado === "all" ? misTareas : misTareas.filter(t => t.estado === filterEstado);
  const pendientes  = misTareas.filter(t => t.estado === "pendiente").length;
  const enProgreso  = misTareas.filter(t => t.estado === "en_progreso").length;
  const completadas = misTareas.filter(t => t.estado === "completada").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0B", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar view={view} setView={setView} user={user} />

      <main style={{
        flex: 1,
        padding: isMobile ? "20px 16px 80px" : "32px 36px",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "center" : "flex-start",
          marginBottom: isMobile ? 20 : 32,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 4, letterSpacing: "0.1em" }}>
              {new Date().toLocaleDateString("es-CR", { weekday:"long", day:"numeric", month:"long" }).toUpperCase()}
            </div>
            <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
              {view === "mis-tareas" ? `Hola, ${user?.nombre?.split(" ")[0]} 👋` : "Tareas del grupo"}
            </h1>
          </div>
          {view === "mis-tareas" && (
            <button onClick={() => { setEditTarea(null); setShowModal(true); }} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#E8FF47", color: "#0A0A0B",
              border: "none", borderRadius: 10,
              padding: isMobile ? "9px 14px" : "10px 18px",
              fontSize: isMobile ? 13 : 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 0 24px rgba(232,255,71,0.2)",
              whiteSpace: "nowrap",
            }}>+ Nueva tarea</button>
          )}
        </div>

        {/* MIS TAREAS */}
        {view === "mis-tareas" && (
          <>
            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: isMobile ? 8 : 14,
              marginBottom: isMobile ? 16 : 28,
            }}>
              {[
                { label: "PENDIENTES",  val: pendientes,  color: "#888" },
                { label: "EN PROGRESO", val: enProgreso,  color: "#47FFD4" },
                { label: "COMPLETADAS", val: completadas, color: "#E8FF47" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: isMobile ? 10 : 14, padding: isMobile ? "12px 10px" : "18px 20px",
                }}>
                  <div style={{ fontSize: isMobile ? 9 : 11, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 6, letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{
              display: "flex", gap: 6, marginBottom: 16,
              overflowX: "auto", paddingBottom: 4,
              WebkitOverflowScrolling: "touch",
            }}>
              {[["all","Todas"],["pendiente","Pendientes"],["en_progreso","En progreso"],["completada","Completadas"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterEstado(v)} style={{
                  background: filterEstado === v ? "rgba(232,255,71,0.1)" : "transparent",
                  border: "1px solid", borderColor: filterEstado === v ? "rgba(232,255,71,0.3)" : "rgba(255,255,255,0.07)",
                  color: filterEstado === v ? "#E8FF47" : "#666",
                  borderRadius: 8, padding: isMobile ? "6px 12px" : "7px 14px",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: filterEstado === v ? 600 : 400, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>{l}</button>
              ))}
            </div>

            {loading ? (
              <div style={{ color: "#444", textAlign: "center", padding: 48, fontFamily: "'Space Mono', monospace" }}>CARGANDO...</div>
            ) : filteredMias.length === 0 ? (
              <div style={{ color: "#333", textAlign: "center", padding: 48, fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
                — SIN TAREAS —<br/>
                <span style={{ fontSize: 11, marginTop: 8, display: "block" }}>Agrega una con el botón de arriba</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredMias.map(t => (
                  <TareaCard key={t.id} tarea={t} editable
                    onEdit={() => { setEditTarea(t); setShowModal(true); }}
                    onDelete={() => handleDelete(t.id)}
                    onStatusChange={() => handleStatusChange(t)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* TAREAS DE AMIGOS */}
        {view === "amigos" && (
          <>
            {loading ? (
              <div style={{ color: "#444", textAlign: "center", padding: 48, fontFamily: "'Space Mono', monospace" }}>CARGANDO...</div>
            ) : Object.keys(amigoGroups).length === 0 ? (
              <div style={{ color: "#333", textAlign: "center", padding: 48, fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
                — TUS AMIGOS AÚN NO HAN AGREGADO TAREAS —
              </div>
            ) : (
              Object.entries(amigoGroups).map(([nombre, { color, tareas }]) => (
                <div key={nombre} style={{ marginBottom: 36 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: color + "22", border: `2px solid ${color}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color,
                      fontFamily: "'Space Mono', monospace",
                    }}>{nombre.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#ccc" }}>{nombre}</div>
                      <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace" }}>
                        {tareas.filter(t=>t.estado==="completada").length}/{tareas.length} completadas
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <span style={{
                        fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace",
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 6, padding: "4px 10px",
                      }}>👁 SOLO LECTURA</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8 }}>
                    {tareas.map(t => <TareaCard key={t.id} tarea={t} editable={false} />)}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>

      {showModal && (
        <TareaModal
          tarea={editTarea}
          materias={materias}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarea(null); }}
          onMateriaCreada={(m) => setMaterias(prev => [...prev, m])}
        />
      )}
    </div>
  );
}
