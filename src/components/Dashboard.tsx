"use client";

import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { MessageSquare, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import type { Session } from "@/lib/dynamo";

type DashboardProps = {
  data: {
    kpis: {
      totalSessions: number;
      totalMessages: number;
      avgResponseTime: number;
    };
    dailyStats: { date: string; interacciones: number }[];
    sessions: Session[];
  }
};

export default function Dashboard({ data }: DashboardProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const toggleSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  const { kpis, dailyStats, sessions } = data;

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="header">
        <h1>PymerIA Dashboard</h1>
      </header>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-title">
            <Users size={18} />
            Total Sesiones
          </div>
          <div className="kpi-value">{kpis.totalSessions}</div>
          <div className="kpi-subtext">Usuarios interactuando</div>
        </div>

        <div className="card">
          <div className="kpi-title">
            <MessageSquare size={18} />
            Interacciones Totales
          </div>
          <div className="kpi-value">{kpis.totalMessages}</div>
          <div className="kpi-subtext">Mensajes intercambiados</div>
        </div>

        <div className="card">
          <div className="kpi-title">
            <Clock size={18} />
            Tiempo Resp. Medio
          </div>
          <div className="kpi-value">
            {kpis.avgResponseTime > 1000 
              ? (kpis.avgResponseTime / 1000).toFixed(1) + " s" 
              : kpis.avgResponseTime + " ms"}
          </div>
          <div className="kpi-subtext">Latencia de Gemini</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card chart-section">
        <div className="kpi-title" style={{ marginBottom: "1rem" }}>Actividad por Día</div>
        <div className="chart-container">
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#141b2d', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="interacciones" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="empty-state" style={{ padding: "2rem" }}>No hay datos para mostrar el gráfico</div>
          )}
        </div>
      </div>

      {/* Histórico de Conversaciones */}
      <div className="history-section">
        <h2 className="history-title">Historial de Conversaciones</h2>
        
        {sessions.length === 0 ? (
          <div className="card empty-state">
            <MessageSquare size={48} />
            <p>Aún no hay conversaciones registradas.</p>
          </div>
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <div key={session.id} className="card session-item" onClick={() => toggleSession(session.id)}>
                <div className="session-header">
                  <span className="session-id">{session.id.substring(0, 8)}...</span>
                  <span className="session-date">{new Date(session.date).toLocaleDateString()}</span>
                </div>
                
                {/* Resumen o Detalles expandidos */}
                {expandedSession !== session.id ? (
                  <div className="session-summary">
                    Último mensaje: <span style={{ opacity: 0.8 }}>{session.lastMessage}</span>
                  </div>
                ) : (
                  <div className="chat-log" onClick={(e) => e.stopPropagation()}>
                    {session.turns.map((turn) => (
                      <div key={turn.turn_id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Mensaje Usuario */}
                        <div className="msg user">
                          <div className="msg-header">Usuario</div>
                          {turn.user_message}
                        </div>

                        {/* Mensaje Bot */}
                        <div className="msg bot">
                          <div className="msg-header">PymerIA</div>
                          {turn.bot_response}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', opacity: 0.5 }}>
                  {expandedSession === session.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
