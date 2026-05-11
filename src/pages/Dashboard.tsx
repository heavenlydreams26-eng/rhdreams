import { useState, useEffect } from "react";
import { Users, UserPlus, Briefcase, Clock, Activity, Cpu, AlertCircle, X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, PieChart, Pie, Cell, Line, ComposedChart } from "recharts";
import { FUNNEL_DATA, PERFORMANCE_DATA, CANDIDATES_PER_JOB_DATA, CRM_STAGES } from "@/data/mockData";
import { useNotifications } from "@/contexts/NotificationContext";
import { dbService } from "@/services/db";
import { subDays, isAfter } from "date-fns";

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

const getAlertColors = (type: string) => {
  switch (type) {
    case 'success': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', icon: CheckCircle2, gradient: 'from-emerald-500/5' };
    case 'warning': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', icon: AlertTriangle, gradient: 'from-amber-500/5' };
    case 'error': return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-500', icon: AlertCircle, gradient: 'from-rose-500/5' };
    case 'info':
    default: return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-500', icon: Info, gradient: 'from-cyan-500/5' };
  }
};

export function Dashboard() {
  const { notifications, markAsRead } = useNotifications();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const unsubCandidates = dbService.subscribeToUserCollection(dbService.CANDIDATES, setCandidates);
    const unsubJobs = dbService.subscribeToUserCollection(dbService.JOBS, setJobs);
    return () => {
      unsubCandidates();
      unsubJobs();
    };
  }, []);

  const unreadAlerts = notifications.filter(n => !n.read).slice(0, 3);

  // Calculate real-time stats
  const totalCandidates = candidates.length;
  const sevenDaysAgo = subDays(new Date(), 7);
  const newApplications = candidates.filter(c => c.createdAt && isAfter(c.createdAt, sevenDaysAgo)).length;
  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const avgCandidatesPerJob = activeJobs > 0 ? (totalCandidates / activeJobs).toFixed(1) : "0";

  // Dynamic Funnel Data
  const dynamicFunnelData = CRM_STAGES.map(stage => {
    const count = candidates.filter(c => c.stage === stage).length;
    return {
      stage,
      count,
      conversion: totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
    };
  });

  // Dynamic Pie Data
  const dynamicJobData = jobs.slice(0, 5).map(job => ({
    name: job.title,
    count: candidates.filter(c => c.role === job.title).length || 1 // fallback for visual
  }));

  return (
    <div className="flex flex-col gap-6 w-full min-h-full pb-8">
      {unreadAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {unreadAlerts.map(alert => {
            const { bg, border, text, icon: Icon, gradient } = getAlertColors(alert.type);
            return (
              <div key={alert.id} className={`${bg} border ${border} p-3 rounded-xl flex items-start justify-between relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="flex gap-3 relative z-10 w-full pr-8">
                  <Icon className={`w-5 h-5 ${text} shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${text}`}>{alert.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                  </div>
                </div>
                <button onClick={() => markAsRead(alert.id)} className="text-slate-400 hover:text-white transition-colors relative z-10 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-white flex items-center gap-3">
             <Cpu className="w-8 h-8 text-cyan-400 shrink-0" />
             HEAVENLY DREAMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold ml-1">METRICS</span>
          </h1>
          <p className="text-slate-400 mt-2 font-semibold tracking-widest text-[10px] opacity-80 uppercase">Autonomous matching and conversion analysis</p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 glass-panel rounded-full text-xs font-semibold uppercase tracking-widest text-emerald-400 border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          System Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Candidatos", value: totalCandidates.toString(), subtitle: "+12% mes anterior", icon: Users, color: 'cyan' as const },
          { title: "Nuevas Aplicaciones", value: newApplications.toString(), subtitle: "Últimos 7 días", icon: Activity, color: 'purple' as const },
          { title: "Ofertas Activas", value: activeJobs.toString(), subtitle: `${avgCandidatesPerJob} candidatos por oferta`, icon: Briefcase, color: 'emerald' as const },
          { title: "Tiempo Contract", value: "19.5d", subtitle: "-3 días vs prom", icon: Clock, color: 'rose' as const },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const styles = {
            cyan: { text: "text-cyan-400", bgLine: "via-cyan-500/40", shadow: "group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]", dot: "bg-cyan-400", hoverBorder: "hover:border-cyan-500/50" },
            purple: { text: "text-purple-400", bgLine: "via-purple-500/40", shadow: "group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]", dot: "bg-purple-400", hoverBorder: "hover:border-purple-500/50" },
            emerald: { text: "text-emerald-400", bgLine: "via-emerald-500/40", shadow: "group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]", dot: "bg-emerald-400", hoverBorder: "hover:border-emerald-500/50" },
            rose: { text: "text-rose-400", bgLine: "via-rose-500/40", shadow: "group-hover:drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]", dot: "bg-rose-400", hoverBorder: "hover:border-rose-500/50" },
          }[stat.color];

          return (
            <div key={i} className={`glass-panel p-6 rounded-2xl flex flex-col relative overflow-hidden group ${styles.hoverBorder} transition-all duration-300`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${styles.bgLine} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="absolute -inset-20 bg-slate-900/0 group-hover:bg-slate-800/20 transition-colors pointer-events-none"></div>
              
              <div className="flex items-center justify-between pb-4 relative z-10">
                <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">{stat.title}</p>
                <Icon className={`w-5 h-5 opacity-70 group-hover:opacity-100 transition-all ${styles.text} ${styles.shadow}`} />
              </div>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold text-white tracking-tight font-mono">{stat.value}</div>
                <p className={`text-[10px] mt-3 font-semibold uppercase tracking-widest flex items-center gap-2 ${styles.text} opacity-80`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} /> {stat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <div className="glass-panel p-8 rounded-2xl flex flex-col relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <h2 className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-cyan-400 rounded-sm shadow-[0_0_8px_#22d3ee]"></span> Embudo y Tasa de Conversión (%)
          </h2>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dynamicFunnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(6,182,212,0.3)', backgroundColor: 'rgba(15, 17, 21, 0.9)', color: '#e2e8f0', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(12px)', fontFamily: 'Inter', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="url(#cyanGradient)" radius={[0, 4, 4, 0]} barSize={24} name="Candidatos">
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </Bar>
                <Line type="monotone" dataKey="conversion" stroke="#a855f7" strokeWidth={3} dot={{ r: 5, fill: '#0F172A', strokeWidth: 2, stroke: '#a855f7' }} activeDot={{ r: 7, fill: '#a855f7', strokeWidth: 0, className: "drop-shadow-[0_0_12px_#a855f7]" }} name="Conversión %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl flex flex-col relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <h2 className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-indigo-400 rounded-sm shadow-[0_0_8px_#818cf8]"></span> Candidatos por Oferta Activa
          </h2>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicJobData.length > 0 ? dynamicJobData : CANDIDATES_PER_JOB_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={10}
                  dataKey="count"
                  stroke="none"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(dynamicJobData.length > 0 ? dynamicJobData : CANDIDATES_PER_JOB_DATA).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer hover:opacity-90 transition-opacity" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  itemStyle={{ color: '#e2e8f0', fontWeight: 600, fontFamily: 'Inter', fontSize: '12px' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)', backgroundColor: 'rgba(15, 17, 21, 0.9)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(12px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl flex flex-col lg:col-span-2 relative overflow-hidden group hover:border-sky-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <h2 className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-sky-400 rounded-sm shadow-[0_0_8px_#38bdf8]"></span> Rendimiento de Contratación (y Tiempo al Contratar)
          </h2>
          <div className="h-[340px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }} dy={15} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(14,165,233,0.3)', backgroundColor: 'rgba(15, 17, 21, 0.9)', color: '#e2e8f0', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(12px)', fontFamily: 'Inter', fontSize: '12px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="hires" name="Contrataciones" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorHires)" activeDot={{ r: 6, fill: '#0ea5e9', strokeWidth: 0, className: "drop-shadow-[0_0_12px_#0ea5e9]" }} />
                <Line yAxisId="right" type="monotone" dataKey="timeToHire" name="Tiempo (días)" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#0F172A', strokeWidth: 2, stroke: '#8B5CF6' }} activeDot={{ r: 7, fill: '#8B5CF6', strokeWidth: 0, className: "drop-shadow-[0_0_12px_#8B5CF6]" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
