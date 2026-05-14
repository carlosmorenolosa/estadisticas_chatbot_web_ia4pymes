"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area
} from "recharts";
import {
  MessageSquare, Clock, Users, TrendingUp, TrendingDown, Activity,
  ChevronDown, ChevronUp, User, Bot, Calendar, Search, Filter,
  ArrowUpRight, ArrowDownRight, Zap, BarChart3, ChevronRight,
  Maximize2, RefreshCw, Share2, Download, Bell, Settings,
  Menu, X, Sparkles, ArrowRight
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Session, Turn } from "@/lib/dynamo";

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

// ─── Utility functions ─────────────────────────────────────────────
const formatTime = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "";
  };
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ─── KPI Card Component ────────────────────────────────────────────
function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  color,
  delay
}: {
  icon: any;
  label: string;
  value: string;
  subtext: string;
  trend?: { value: number; positive: boolean };
  color: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card p-6 animate-stagger"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
          <Icon size={20} className={color.replace('bg-', 'text-').replace('bg-opacity-10', '')} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold font-outfit tracking-tight mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
      <div className="text-xs text-text-muted mt-2">{subtext}</div>
    </div>
  );
}

// ─── Chart Component ───────────────────────────────────────────────
function ActivityChart({ data }: { data: { date: string; interacciones: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="glass-card p-6 animate-stagger" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-outfit">Actividad Diaria</h3>
          <p className="text-sm text-text-muted mt-0.5">Interacciones en los últimos 30 días</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Calendar size={14} />
            Últimos 30 días
          </button>
        </div>
      </div>
      
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBarStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) => {
                  try {
                    const d = new Date(value);
                    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                  } catch {
                    return value;
                  }
                }}
                dy={10}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload as typeof data[0];
                    return (
                      <div className="glass-card p-3 min-w-[140px]">
                        <div className="text-xs text-text-muted mb-1">{formatDate(data.date)}</div>
                        <div className="text-lg font-bold font-outfit">{data.interacciones} interacciones</div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              />
              <Area 
                type="monotone" 
                dataKey="interacciones" 
                stroke="url(#colorBarStroke)" 
                strokeWidth={2}
                fill="url(#colorBar)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state h-full">
            <Activity size={48} />
            <p>No hay datos de actividad disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Session Item Component ────────────────────────────────────────
function SessionItem({
  session,
  isExpanded,
  onToggle,
  index
}: {
  session: Session;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className="glass-card cursor-pointer animate-stagger"
      style={{ animationDelay: `${0.35 + index * 0.03}s` }}
      onClick={onToggle}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <MessageSquare size={14} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-mono text-text-muted">
                {session.id.substring(0, 8)}...
              </div>
              <div className="text-xs text-text-secondary flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(session.date)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary text-xs">
              {session.turns.length} turnos
            </span>
            {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
          </div>
        </div>
        
        {!isExpanded && (
          <div className="text-sm text-text-secondary line-clamp-2">
            {session.lastMessage || 'Sin mensajes'}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-border-subtle pt-4" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-4">
            {session.turns.map((turn) => (
              <div key={turn.turn_id} className="space-y-3">
                {/* User message */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={12} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-secondary">Usuario</span>
                      <span className="text-xs text-text-muted">{formatTime(turn.timestamp)}</span>
                    </div>
                    <div className="text-sm text-text-primary leading-relaxed bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                      {turn.user_message}
                    </div>
                  </div>
                </div>
                
                {/* Bot message */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-400">PymerIA</span>
                      <span className="text-xs text-text-muted">{formatTime(turn.timestamp)}</span>
                      {turn.response_time_ms && (
                        <span className="text-xs text-text-muted">• {turn.response_time_ms < 1000 ? `${turn.response_time_ms}ms` : `${(turn.response_time_ms / 1000).toFixed(1)}s`}</span>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed bg-white/5 border border-white/5 rounded-lg p-3">
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-strong:text-white prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
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

// ─── Main Dashboard Component ──────────────────────────────────────
export default function Dashboard({ data }: DashboardProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  const filteredSessions = useMemo(() => {
    if (!data?.sessions) return [];
    if (!searchQuery.trim()) return data.sessions;
    const query = searchQuery.toLowerCase();
    return data.sessions.filter(s => 
      s.lastMessage?.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
    );
  }, [data?.sessions, searchQuery]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b-0 rounded-none mx-4 mt-0 sm:mx-6 sm:rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-outfit gradient-text">PymerIA Analytics</h1>
                <p className="text-xs text-text-muted">Panel de analíticas en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary text-xs py-2 px-3">
                <RefreshCw size={14} />
                Actualizar
              </button>
              <button className="btn-secondary text-xs py-2 px-3">
                <Share2 size={14} />
                Compartir
              </button>
              <div className="w-px h-6 bg-border-subtle" />
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Bell size={18} className="text-text-secondary" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Settings size={18} className="text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!data || data.kpis.totalSessions === 0 ? (
          // Empty State
          <div className="glass-card p-12 text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-accent flex items-center justify-center">
              <BarChart3 size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold font-outfit mb-2">Sin datos aún</h2>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Cuando empiecen a llegar interacciones al chatbot, aquí podrás ver las métricas en tiempo real.
            </p>
            <button className="btn-primary">
              Configurar chatbot
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                icon={Users}
                label="Sesiones Totales"
                value={formatNumber(data.kpis.totalSessions)}
                subtext="Usuarios interactuando"
                trend={{ value: 12, positive: true }}
                color="bg-cyan-400 text-cyan-400"
                delay="0.05s"
              />
              <KPICard
                icon={MessageSquare}
                label="Interacciones"
                value={formatNumber(data.kpis.totalMessages)}
                subtext="Mensajes intercambiados"
                trend={{ value: 8, positive: true }}
                color="bg-purple-400 text-purple-400"
                delay="0.1s"
              />
              <KPICard
                icon={Clock}
                label="Tiempo de Respuesta"
                value={
                  data.kpis.avgResponseTime > 1000
                    ? `${(data.kpis.avgResponseTime / 1000).toFixed(1)}s`
                    : `${data.kpis.avgResponseTime}ms`
                }
                subtext="Latencia media de Gemini"
                trend={{ value: -5, positive: true }}
                color="bg-emerald-400 text-emerald-400"
                delay="0.15s"
              />
            </div>

            {/* Activity Chart */}
            <ActivityChart data={data.dailyStats} />

            {/* Sessions Section */}
            <div className="animate-stagger" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold font-outfit">Historial de Conversaciones</h2>
                  <p className="text-sm text-text-muted mt-0.5">
                    {filteredSessions.length} de {data.sessions.length} sesiones
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Buscar sesiones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-bg-tertiary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo w-64"
                    />
                  </div>
                  <button className="btn-secondary text-xs py-2 px-3">
                    <Filter size={14} />
                    Filtrar
                  </button>
                </div>
              </div>

              {filteredSessions.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Search size={48} className="mx-auto mb-4 opacity-25" />
                  <p className="text-text-secondary">
                    {searchQuery ? 'No se encontraron sesiones con ese término' : 'Aún no hay conversaciones registradas'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSessions.map((session, index) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isExpanded={expandedSession === session.id}
                      onToggle={() => toggleSession(session.id)}
                      index={index}
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
