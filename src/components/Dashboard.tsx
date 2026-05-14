"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  MessageSquare, Clock, Users, TrendingUp, TrendingDown, Activity,
  ChevronDown, ChevronUp, User, Bot, Calendar, Search,
  BarChart3, ArrowRight, RefreshCw, Share2
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Session, Turn } from "@/lib/dynamo";

// ─── Types ───────────────────────────────────────────────────────
type DashboardProps = {
  data: {
    kpis: {
      totalSessions: number;
      totalMessages: number;
      avgResponseTime: number;
    };
    dailyStats: { date: string; interacciones: number }[];
    sessions: Session[];
  } | null;
};

// ─── Utils ───────────────────────────────────────────────────────
const formatTime = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ""; }
};

const formatDate = (str: string) => {
  try { return new Date(str).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }); }
  catch { return str; }
};

const formatNum = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString('es-ES');
};

// ─── KPI Card (cream) ────────────────────────────────────────────
function KPICard({
  icon: Icon, label, value, sub, trend, accent, delay
}: {
  icon: any; label: string; value: string; sub: string;
  trend?: { pct: number; up: boolean };
  accent: string; delay: string;
}) {
  const accentMap: Record<string, { bg: string; text: string }> = {
    coral:   { bg: 'rgba(204,120,92,0.1)',   text: '#cc785c' },
    teal:    { bg: 'rgba(93,184,166,0.1)',   text: '#5db8a6' },
    amber:   { bg: 'rgba(232,165,90,0.1)',   text: '#e8a55a' },
  };
  const a = accentMap[accent] || accentMap.coral;

  return (
    <div
      className="card-cream animate-fade-in"
      style={{ animationDelay: delay, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: a.bg }}
        >
          <Icon size={20} style={{ color: a.text }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 caption ${trend.up ? 'text-success' : 'text-[#c64545]'}`}>
            {trend.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.pct > 0 ? '+' : ''}{trend.pct}%
          </div>
        )}
      </div>
      <div className="display-md mb-1.5">{value}</div>
      <div className="body-sm" style={{ color: 'var(--color-muted)' }}>{label}</div>
      <div className="caption-uppercase" style={{ color: 'var(--color-muted-soft)', marginTop: '0.375rem' }}>{sub}</div>
    </div>
  );
}

// ─── Chart ───────────────────────────────────────────────────────
function ActivityChart({ data }: { data: { date: string; interacciones: number }[] }) {
  return (
    <div className="card-cream animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
      <div className="mb-7">
        <h3 className="display-sm mb-1">Actividad Diaria</h3>
        <p className="body-sm" style={{ color: 'var(--color-muted)' }}>
          Interacciones en los últimos 30 días
        </p>
      </div>

      <div className="h-72 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 24, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cc785c" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#cc785c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#cc785c" />
                  <stop offset="100%" stopColor="#e8a55a" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8e8b82"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => {
                  try { return new Date(v).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); }
                  catch { return v; }
                }}
                dy={12}
              />
              <YAxis
                stroke="#8e8b82"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-12}
                tickFormatter={(v: number) => formatNum(v)}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const d = payload[0].payload as { date: string; interacciones: number };
                    return (
                      <div
                        className="card-cream"
                        style={{ borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', minWidth: 160 }}
                      >
                        <div className="caption-uppercase" style={{ color: 'var(--color-muted-soft)', marginBottom: '0.375rem' }}>
                          {formatDate(d.date)}
                        </div>
                        <div className="display-sm">{d.interacciones}</div>
                        <div className="body-sm" style={{ color: 'var(--color-muted)' }}>interacciones</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="interacciones"
                stroke="url(#gradStroke)"
                strokeWidth={2.5}
                fill="url(#gradFill)"
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-muted-soft)]">
            <Activity size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
            <p className="body-sm">No hay datos de actividad disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Session Item ────────────────────────────────────────────────
function SessionItem({
  session, expanded, onToggle, index
}: {
  session: Session;
  expanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className="card-cream cursor-pointer animate-fade-in overflow-hidden"
      style={{ animationDelay: `${0.25 + index * 0.04}s`, opacity: 0 }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(204,120,92,0.08)' }}>
              <MessageSquare size={18} style={{ color: '#cc785c' }} />
            </div>
            <div>
              <div className="caption-uppercase" style={{ color: 'var(--color-muted-soft)' }}>
                {session.id.substring(0, 8)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="caption" style={{ color: 'var(--color-muted)' }}>
                  <Calendar size={10} className="inline mr-1" />
                  {formatDate(session.date)}
                </span>
                <span className="badge-pill" style={{ fontSize: '0.6875rem', padding: '0.2rem 0.6rem' }}>
                  {session.turns.length} turnos
                </span>
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--color-muted-soft)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-muted-soft)' }} />}
        </div>

        {!expanded && session.lastMessage && (
          <p className="body-sm mt-4 leading-relaxed" style={{ color: 'var(--color-body)' }}>
            {session.lastMessage}
          </p>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-0 pt-5" style={{ borderTop: '1px solid var(--color-hairline-soft)' }}>
          <div className="space-y-6">
            {session.turns.map((turn) => (
              <div key={turn.turn_id} className="space-y-4">
                {/* User */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.08)' }}>
                    <User size={13} style={{ color: '#60a5fa' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="caption" style={{ color: 'var(--color-muted)' }}>Usuario</span>
                      <span className="caption" style={{ color: 'var(--color-muted-soft)' }}>{formatTime(turn.timestamp)}</span>
                    </div>
                    <div
                      className="rounded-lg px-4 py-3"
                      style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)' }}
                    >
                      <p className="body-sm leading-relaxed">{turn.user_message}</p>
                    </div>
                  </div>
                </div>

                {/* Bot */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(204,120,92,0.08)' }}>
                    <Bot size={13} style={{ color: '#cc785c' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="caption" style={{ color: '#cc785c' }}>PymerIA</span>
                      <span className="caption" style={{ color: 'var(--color-muted-soft)' }}>{formatTime(turn.timestamp)}</span>
                      {turn.response_time_ms && (
                        <span className="caption" style={{ color: 'var(--color-muted-soft)' }}>
                          · {turn.response_time_ms < 1000 ? `${turn.response_time_ms}ms` : `${(turn.response_time_ms / 1000).toFixed(1)}s`}
                        </span>
                      )}
                    </div>
                    <div
                      className="rounded-lg px-4 py-3 prose prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-strong:text-[var(--color-ink)] prose-code:text-[#cc785c] prose-code:bg-[rgba(204,120,92,0.08)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                      style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-hairline-soft)' }}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          code: ({ children }) => <code className="text-[#cc785c] bg-[rgba(204,120,92,0.08)] px-1.5 py-0.5 rounded text-sm">{children}</code>,
                          strong: ({ children }) => <strong className="text-[var(--color-ink)]">{children}</strong>,
                        }}
                      >
                        {turn.bot_response}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────
export default function Dashboard({ data }: DashboardProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  const filtered = useMemo(() => {
    if (!data?.sessions) return [];
    if (!searchQuery.trim()) return data.sessions;
    const q = searchQuery.toLowerCase();
    return data.sessions.filter(s =>
      s.lastMessage?.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [data?.sessions, searchQuery]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-canvas)' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: 'var(--color-hairline-soft)',
          background: 'rgba(250,249,245,0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Anthropic-style spike mark */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-coral)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
                  <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
                </svg>
              </div>
              <div>
                <h1 className="display-sm" style={{ color: 'var(--color-ink)' }}>PymerIA Analytics</h1>
                <p className="caption" style={{ color: 'var(--color-muted-soft)' }}>
                  Panel de analíticas en tiempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" style={{ height: 36, padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                <RefreshCw size={14} />
                Actualizar
              </button>
              <button className="btn-secondary" style={{ height: 36, padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                <Share2 size={14} />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-8">
        {/* Empty state */}
        {!data || data.kpis.totalSessions === 0 ? (
          <div className="card-cream text-center" style={{ padding: '6rem 2rem', animationDelay: '0.1s', opacity: 0 }}>
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(204,120,92,0.08)' }}
            >
              <BarChart3 size={28} style={{ color: '#cc785c' }} />
            </div>
            <h2 className="display-md mb-3">Sin datos aún</h2>
            <p className="body-md max-w-md mx-auto leading-relaxed mb-8" style={{ color: 'var(--color-body)' }}>
              Cuando empiecen a llegar interacciones al chatbot, aquí podrás ver las métricas en tiempo real.
            </p>
            <button
              className="btn-primary mx-auto"
            >
              Configurar chatbot
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="space-y-12" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <KPICard
                icon={Users} label="Sesiones Totales" value={formatNum(data.kpis.totalSessions)}
                sub="Usuarios interactuando"
                trend={{ pct: 12, up: true }}
                accent="coral" delay="0.05s"
              />
              <KPICard
                icon={MessageSquare} label="Interacciones" value={formatNum(data.kpis.totalMessages)}
                sub="Mensajes intercambiados"
                trend={{ pct: 8, up: true }}
                accent="teal" delay="0.1s"
              />
              <KPICard
                icon={Clock}
                label="Tiempo de Respuesta"
                value={data.kpis.avgResponseTime > 1000
                  ? `${(data.kpis.avgResponseTime / 1000).toFixed(1)}s`
                  : `${data.kpis.avgResponseTime}ms`
                }
                sub="Latencia media de Gemini"
                trend={{ pct: -5, up: true }}
                accent="amber" delay="0.15s"
              />
            </div>

            {/* Chart */}
            <ActivityChart data={data.dailyStats} />

            {/* Sessions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="display-sm mb-1">Historial de Conversaciones</h2>
                  <p className="body-sm" style={{ color: 'var(--color-muted)' }}>
                    {filtered.length} de {data.sessions.length} sesiones
                  </p>
                </div>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-soft)' }} />
                  <input
                    type="text"
                    placeholder="Buscar sesiones..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-cream pl-10 pr-4 w-72"
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="card-cream p-14 text-center">
                  <Search size={48} className="mx-auto mb-3" style={{ opacity: 0.2 }} />
                  <p className="body-sm" style={{ color: 'var(--color-body)' }}>
                    {searchQuery ? 'No se encontraron sesiones con ese término' : 'Aún no hay conversaciones registradas'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((session, i) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      expanded={expandedSession === session.id}
                      onToggle={() => toggleSession(session.id)}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
