"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  MessageSquare, Clock, Users, TrendingUp, TrendingDown, Activity,
  ChevronDown, ChevronUp, User, Bot, Calendar, Search,
  BarChart3, Sparkles, ArrowRight, RefreshCw, Share2, Bell, Settings
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Session, Turn } from "@/lib/dynamo";

// ─── Types ─────────────────────────────────────────────────────────
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

// ─── Utils ─────────────────────────────────────────────────────────
const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ""; }
};

const formatDate = (str: string) => {
  try {
    return new Date(str).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch { return str; }
};

const formatNum = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString('es-ES');
};

// ─── KPI Card ──────────────────────────────────────────────────────
function KPICard({
  icon: Icon, label, value, sub, trend, accent, delay
}: {
  icon: any; label: string; value: string; sub: string;
  trend?: { pct: number; up: boolean };
  accent: string; delay: string;
}) {
  const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
    indigo:  { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8', ring: 'rgba(99,102,241,0.2)' },
    purple:  { bg: 'rgba(139,92,246,0.12)',  text: '#a78bfa', ring: 'rgba(139,92,246,0.2)' },
    cyan:    { bg: 'rgba(34,211,238,0.12)',  text: '#22d3ee', ring: 'rgba(34,211,238,0.2)' },
    emerald: { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', ring: 'rgba(16,185,129,0.2)' },
    amber:   { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', ring: 'rgba(245,158,11,0.2)' },
    rose:    { bg: 'rgba(244,63,94,0.12)',   text: '#fb7185', ring: 'rgba(244,63,94,0.2)' },
  };
  const a = accentMap[accent] || accentMap.indigo;

  return (
    <div
      className="glass-card p-8 animate-stagger"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: a.bg }}
        >
          <Icon size={22} style={{ color: a.text }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 text-sm font-semibold ${trend.up ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trend.pct > 0 ? '+' : ''}{trend.pct}%
          </div>
        )}
      </div>
      <div className="text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
        {value}
      </div>
      <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>
    </div>
  );
}

// ─── Chart ─────────────────────────────────────────────────────────
function ActivityChart({ data }: { data: { date: string; interacciones: number }[] }) {
  return (
    <div className="glass-card p-10 animate-stagger" style={{ animationDelay: '0.25s' }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
            Actividad Diaria
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Interacciones en los últimos 30 días
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 24, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.025)" />
              <XAxis
                dataKey="date"
                stroke="#404058"
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
                stroke="#404058"
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
                        className="glass-card p-4 min-w-[160px]"
                        style={{ borderRadius: 16 }}
                      >
                        <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(d.date)}
                        </div>
                        <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                          {d.interacciones}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>interacciones</div>
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
          <div className="empty-state h-full">
            <Activity size={56} />
            <p>No hay datos de actividad disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Session Item ──────────────────────────────────────────────────
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
      className="glass-card cursor-pointer animate-stagger overflow-hidden"
      style={{ animationDelay: `${0.35 + index * 0.04}s` }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' }}>
              <MessageSquare size={18} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <div className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                {session.id.substring(0, 8)}
              </div>
              <div className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                <Calendar size={10} />
                {formatDate(session.date)}
                <span style={{ color: 'var(--color-text-muted)' }}>·</span>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                  {session.turns.length} turnos
                </span>
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />}
        </div>

        {!expanded && session.lastMessage && (
          <p className="text-sm mt-5 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {session.lastMessage}
          </p>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-8 pb-8 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="pt-6 space-y-6">
            {session.turns.map((turn) => (
              <div key={turn.turn_id} className="space-y-3">
                {/* User */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.12)' }}>
                    <User size={13} style={{ color: '#60a5fa' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Usuario</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(turn.timestamp)}</span>
                    </div>
                    <div
                      className="text-sm leading-relaxed rounded-xl px-4 py-3"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}
                    >
                      {turn.user_message}
                    </div>
                  </div>
                </div>

                {/* Bot */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <Bot size={13} style={{ color: '#818cf8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium" style={{ color: '#818cf8' }}>PymerIA</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(turn.timestamp)}</span>
                      {turn.response_time_ms && (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          · {turn.response_time_ms < 1000 ? `${turn.response_time_ms}ms` : `${(turn.response_time_ms / 1000).toFixed(1)}s`}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-sm leading-relaxed rounded-xl px-4 py-3 prose-invert prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-strong:text-white prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          code: ({ children }) => <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded-md text-sm">{children}</code>,
                          strong: ({ children }) => <strong className="text-white">{children}</strong>,
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

// ─── Main Dashboard ────────────────────────────────────────────────
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
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: 'var(--color-border-subtle)',
          background: 'rgba(5,5,8,0.8)',
        }}
      >
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight gradient-text" style={{ fontFamily: 'var(--font-outfit)' }}>
                  PymerIA Analytics
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Panel de analíticas en tiempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-glow)'; e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
              >
                <RefreshCw size={15} />
                Actualizar
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-glow)'; e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
              >
                <Share2 size={15} />
                Compartir
              </button>
              <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border-subtle)' }} />
              <button className="p-2.5 rounded-xl transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Bell size={17} />
              </button>
              <button className="p-2.5 rounded-xl transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Settings size={17} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Empty state */}
        {!data || data.kpis.totalSessions === 0 ? (
          <div className="glass-card p-16 text-center animate-scale-in">
            <div
              className="w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' }}
            >
              <BarChart3 size={36} style={{ color: '#818cf8' }} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>
              Sin datos aún
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Cuando empiecen a llegar interacciones al chatbot, aquí podrás ver las métricas en tiempo real.
            </p>
            <button
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Configurar chatbot
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard
                icon={Users} label="Sesiones Totales" value={formatNum(data.kpis.totalSessions)}
                sub="Usuarios interactuando"
                trend={{ pct: 12, up: true }}
                accent="indigo" delay="0.05s"
              />
              <KPICard
                icon={MessageSquare} label="Interacciones" value={formatNum(data.kpis.totalMessages)}
                sub="Mensajes intercambiados"
                trend={{ pct: 8, up: true }}
                accent="purple" delay="0.1s"
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
                accent="emerald" delay="0.15s"
              />
            </div>

            {/* Chart */}
            <ActivityChart data={data.dailyStats} />

            {/* Sessions */}
            <div className="animate-stagger" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Historial de Conversaciones
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {filtered.length} de {data.sessions.length} sesiones
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Buscar sesiones..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all w-72 focus:outline-none focus:ring-2"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="glass-card p-14 text-center">
                  <Search size={56} className="mx-auto mb-4" style={{ opacity: 0.2 }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
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
