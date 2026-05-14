"use client";

import { useState, useMemo, useEffect } from "react";
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

// ─── KPI Card ────────────────────────────────────────────────────
function KPICard({
  icon: Icon, label, value, sub, trend, delay
}: {
  icon: any; label: string; value: string; sub: string;
  trend?: { pct: number; up: boolean };
  delay: string;
}) {
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: delay, opacity: 0 }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            <Icon size={18} style={{ color: '#818cf8' }} />
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend.up ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend.pct > 0 ? '+' : ''}{trend.pct}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>
    </div>
  );
}

// ─── Chart ───────────────────────────────────────────────────────
function ActivityChart({ data }: { data: { date: string; interacciones: number }[] }) {
  return (
    <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
      <div className="mb-6">
        <h3 className="text-base font-semibold tracking-tight mb-0.5">Actividad</h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Interacciones últimas 2 semanas
        </p>
      </div>
      <div className="h-56 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
              <XAxis
                dataKey="date"
                stroke="#404058"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => {
                  try { return new Date(v).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); }
                  catch { return v; }
                }}
                dy={10}
              />
              <YAxis
                stroke="#404058"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const d = payload[0].payload as { date: string; interacciones: number };
                    return (
                      <div style={{
                        background: 'rgba(22,22,30,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        minWidth: 140,
                      }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(d.date)}
                        </div>
                        <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-sans)' }}>
                          {d.interacciones.toLocaleString('es-ES')}
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
                strokeWidth={2}
                fill="url(#gradFill)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state h-full">
            <Activity size={40} style={{ opacity: 0.15, marginBottom: '1rem' }} />
            <p className="text-xs">No hay datos de actividad</p>
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
      className="glass-card cursor-pointer overflow-hidden animate-slide-up"
      style={{ animationDelay: `${0.3 + index * 0.03}s`, opacity: 0 }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' }}>
              <MessageSquare size={16} style={{ color: '#818cf8' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {session.id.substring(0, 8)}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDate(session.date)}
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                  {session.turns.length} turnos
                </span>
              </div>
              {!expanded && session.lastMessage && (
                <p className="text-sm leading-relaxed truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {session.lastMessage}
                </p>
              )}
            </div>
          </div>
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-6 pb-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="pt-5 space-y-5">
            {session.turns.map((turn) => (
              <div key={turn.turn_id} className="space-y-2.5">
                {/* User */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <User size={11} style={{ color: '#60a5fa' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Usuario</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(turn.timestamp)}</span>
                    </div>
                    <div className="text-sm leading-relaxed rounded-lg px-3.5 py-2.5"
                      style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)' }}>
                      {turn.user_message}
                    </div>
                  </div>
                </div>

                {/* Bot */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <Bot size={11} style={{ color: '#818cf8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: '#818cf8' }}>PymerIA</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(turn.timestamp)}</span>
                      {turn.response_time_ms && (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          · {turn.response_time_ms < 1000 ? `${turn.response_time_ms}ms` : `${(turn.response_time_ms / 1000).toFixed(1)}s`}
                        </span>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed rounded-lg px-3.5 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          code: ({ children }) => <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded text-xs">{children}</code>,
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

// ─── Main Dashboard ──────────────────────────────────────────────
export default function Dashboard({ data }: DashboardProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleRefresh = async () => {
    setLoading(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: 'var(--color-border-subtle)',
          background: 'rgba(9,9,11,0.8)',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight" style={{
                  background: 'linear-gradient(135deg, #f0f0f5 0%, #8888a0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>PymerIA Analytics</h1>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Panel de analíticas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Actualizar
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
              >
                <Share2 size={13} />
              </button>
              <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border-subtle)' }} />
              <button className="p-2 rounded-lg transition-all" style={{ color: 'var(--color-text-secondary)' }}>
                <Bell size={15} />
              </button>
              <button className="p-2 rounded-lg transition-all" style={{ color: 'var(--color-text-secondary)' }}>
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Loading skeleton */}
        {!data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl skeleton" />
                    <div className="flex-1 skeleton h-4" />
                  </div>
                  <div className="skeleton h-8 w-24 mb-2" />
                  <div className="skeleton h-3 w-32" />
                </div>
              ))}
            </div>
            <div className="glass-card p-8">
              <div className="skeleton h-4 w-40 mb-2" />
              <div className="skeleton h-3 w-56 mb-6" />
              <div className="skeleton h-56 w-full" />
            </div>
          </div>
        ) : data.kpis.totalSessions === 0 ? (
          /* Empty state */
          <div className="glass-card p-14 text-center animate-scale-in">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' }}
            >
              <BarChart3 size={28} style={{ color: '#818cf8' }} />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Sin datos aún</h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Cuando empiecen a llegar interacciones al chatbot, aquí podrás ver las métricas en tiempo real.
            </p>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
            >
              Configurar chatbot
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* Dashboard */
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                icon={Users} label="Sesiones" value={formatNum(data.kpis.totalSessions)}
                sub="Total sesiones"
                trend={{ pct: 12, up: true }}
                delay="0.05s"
              />
              <KPICard
                icon={MessageSquare} label="Mensajes" value={formatNum(data.kpis.totalMessages)}
                sub="Interacciones"
                trend={{ pct: 8, up: true }}
                delay="0.1s"
              />
              <KPICard
                icon={Clock}
                label="Respuesta"
                value={data.kpis.avgResponseTime > 1000
                  ? `${(data.kpis.avgResponseTime / 1000).toFixed(1)}s`
                  : `${data.kpis.avgResponseTime}ms`
                }
                sub="Tiempo medio"
                trend={{ pct: -5, up: true }}
                delay="0.15s"
              />
            </div>

            {/* Chart */}
            <ActivityChart data={data.dailyStats} />

            {/* Sessions */}
            <div className="animate-slide-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold tracking-tight mb-0.5">Conversaciones</h2>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {filtered.length} de {data.sessions.length} sesiones
                  </p>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-lg text-xs w-56 transition-all focus:outline-none focus:ring-2"
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.06)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Search size={40} className="mx-auto mb-3" style={{ opacity: 0.15 }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {searchQuery ? 'Sin resultados' : 'Sin conversaciones aún'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
