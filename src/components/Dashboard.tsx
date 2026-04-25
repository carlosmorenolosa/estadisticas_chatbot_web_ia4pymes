"use client";

import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { MessageSquare, Clock, Users, ChevronDown, ChevronUp, User, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';
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

  // Format date/time
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header animate-stagger">
        <h1>PymerIA Analytics</h1>
      </header>

      {/* KPIs */}
      <div className="kpi-grid animate-stagger">
        <div className="card">
          <div className="kpi-title">
            <Users size={18} color="#22D3EE" />
            Total Sesiones
          </div>
          <div className="kpi-value font-outfit">{kpis.totalSessions}</div>
          <div className="kpi-subtext">Usuarios interactuando</div>
        </div>

        <div className="card">
          <div className="kpi-title">
            <MessageSquare size={18} color="#C084FC" />
            Interacciones Totales
          </div>
          <div className="kpi-value font-outfit">{kpis.totalMessages}</div>
          <div className="kpi-subtext">Mensajes intercambiados</div>
        </div>

        <div className="card">
          <div className="kpi-title">
            <Clock size={18} color="#34D399" />
            Tiempo Resp. Medio
          </div>
          <div className="kpi-value font-outfit">
            {kpis.avgResponseTime > 1000 
              ? (kpis.avgResponseTime / 1000).toFixed(1) + "s" 
              : kpis.avgResponseTime + "ms"}
          </div>
          <div className="kpi-subtext">Latencia de Gemini</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card chart-section animate-stagger" style={{ animationDelay: '0.3s' }}>
        <div className="kpi-title" style={{ marginBottom: "1rem" }}>Actividad por Día</div>
        <div className="chart-container">
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#C084FC" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717A" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#71717A" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 10, 14, 0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#22D3EE', fontWeight: 600 }}
                />
                <Bar dataKey="interacciones" radius={[6, 6, 0, 0]}>
                  {dailyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorBar)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="empty-state">No hay datos para mostrar el gráfico</div>
          )}
        </div>
      </div>

      {/* Histórico de Conversaciones */}
      <div className="history-section animate-stagger" style={{ animationDelay: '0.4s' }}>
        <h2 className="history-title">Historial de Conversaciones</h2>
        
        {sessions.length === 0 ? (
          <div className="card empty-state">
            <MessageSquare size={48} />
            <p style={{ marginTop: '1rem' }}>Aún no hay conversaciones registradas.</p>
          </div>
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <div key={session.id} className="card session-item" onClick={() => toggleSession(session.id)}>
                <div className="session-header">
                  <span className="session-id">
                    <span className="session-id-badge">ID</span>
                    {session.id.substring(0, 12)}...
                  </span>
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
                      <div key={turn.turn_id} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Mensaje Usuario */}
                        <div className="msg-wrapper user">
                          <div className="msg-header">
                            <span className="msg-time">{formatTime(turn.timestamp)}</span>
                            <span>Usuario</span>
                            <User size={14} />
                          </div>
                          <div className="msg-bubble">
                            {turn.user_message}
                          </div>
                        </div>

                        {/* Mensaje Bot */}
                        <div className="msg-wrapper bot">
                          <div className="msg-header">
                            <Bot size={14} color="#38bdf8" />
                            <span style={{ color: '#38bdf8' }}>PymerIA</span>
                            <span className="msg-time">{formatTime(turn.timestamp)}</span>
                          </div>
                          <div className="msg-bubble">
                            <ReactMarkdown>{turn.bot_response}</ReactMarkdown>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', opacity: 0.5 }}>
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
