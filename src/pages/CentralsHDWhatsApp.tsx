import { useState, useEffect } from "react";
import { Activity, ShieldCheck, Link2, Key, Webhook, RefreshCcw, Smartphone, MessageCircle, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CentralsHDWhatsApp() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [apiKey, setApiKey] = useState("chd_live_xxxxxxxxxxxxxxxxxxxx");
  const [webhookUrl, setWebhookUrl] = useState("https://mi-empresa.rhdreams.com/api/webhooks/centrals-hd");
  
  const [logs, setLogs] = useState([
    { id: 1, time: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(), type: 'info', message: 'Conexión establecida con App Externa (v2.1.0)' },
    { id: 2, time: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(), type: 'message', message: 'Nuevo mensaje recibido de +52 55 1234 5678' },
    { id: 3, time: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString(), type: 'sync', message: 'Sincronización de contactos completada (45/45)' }
  ]);

  const [metrics, setMetrics] = useState({
    messagesSent: 1542,
    messagesReceived: 984,
    activeSessions: 3,
    errorRate: "0.02%"
  });

  const simulateSync = () => {
    setIsConnected(false);
    setTimeout(() => {
      setIsConnected(true);
      setLastSync(new Date().toLocaleTimeString());
      setLogs([{ id: Date.now(), time: new Date().toLocaleTimeString(), type: 'sync', message: 'Sincronización manual completada con éxito' }, ...logs]);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Podríamos mostrar un toast de éxito aquí
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-white mt-2 uppercase">CENTRALS HD WHATSAPP</h1>
          <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-widest mt-1">Panel de integración y monitoreo para tu aplicación externa de WhatsApp.</p>
        </div>
        <button 
          onClick={simulateSync}
          disabled={!isConnected}
          className={cn(
            "px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] uppercase tracking-wide",
            isConnected 
              ? "bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/40 text-cyan-50 hover:text-white"
              : "bg-slate-800/50 border border-slate-700/50 text-slate-500 cursor-not-allowed"
          )}>
          <RefreshCcw className={cn("w-4 h-4", !isConnected && "animate-spin")} />
          {isConnected ? 'Sincronizar Ahora' : 'Sincronizando...'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Estado de Integración
            </h2>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border",
              isConnected 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            )}>
              {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {isConnected ? "En Línea" : "Conectando"}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Mensajes Entrantes</p>
              <p className="text-2xl font-bold text-white font-mono">{metrics.messagesReceived}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Mensajes Salientes</p>
              <p className="text-2xl font-bold text-white font-mono">{metrics.messagesSent}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Sesiones Activas</p>
              <p className="text-2xl font-bold text-white font-mono">{metrics.activeSessions}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Tasa de Error</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">{metrics.errorRate}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-cyan-100">Aplicación Externa Segura</h3>
              <p className="text-xs text-cyan-500/80 mt-1 leading-relaxed">
                El entorno de Monitoreo Centrals HD está actualmente escuchando peticiones de tu app externa. 
                Último heartbeat detectado a las <strong>{lastSync}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-purple-400" /> Credenciales API
          </h2>

          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">API Key</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={apiKey} 
                  readOnly 
                  className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(apiKey)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Copiar API Key"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Endpoint Webhook</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={webhookUrl} 
                  readOnly 
                  className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none overflow-hidden"
                />
                <button 
                  onClick={() => copyToClipboard(webhookUrl)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Copiar Webhook URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-800">
               <button className="w-full text-xs text-center text-purple-400 hover:text-purple-300 font-medium py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                 Regenerar Credenciales
               </button>
            </div>
          </div>
        </div>
        
        {/* Logger Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 lg:col-span-3">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
             <h2 className="text-lg font-semibold text-white flex items-center gap-2">
               <Webhook className="w-5 h-5 text-emerald-400" /> Registro de Actividad
             </h2>
             <div className="flex gap-2">
               <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                 <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Websocket Activo
               </span>
             </div>
          </div>
          
          <div className="bg-[#0c1015] border border-slate-800 rounded-xl max-h-64 overflow-y-auto styled-scrollbar p-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-800/80 sticky top-0 bg-[#0c1015] z-10">
                  <th className="font-semibold p-3 w-32">Tiempo</th>
                  <th className="font-semibold p-3 w-32">Tipo</th>
                  <th className="font-semibold p-3">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/30 text-slate-300 hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-slate-500 font-mono text-xs">{log.time}</td>
                    <td className="p-3">
                      <span className={cn(
                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                        log.type === "message" ? "bg-cyan-500/10 text-cyan-400" :
                        log.type === "info" ? "bg-slate-500/20 text-slate-300" :
                        "bg-emerald-500/10 text-emerald-400"
                      )}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 max-w-[400px] sm:max-w-md lg:max-w-2xl truncate">
                        {log.type === 'message' && <MessageCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                        {log.type === 'sync' && <RefreshCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                        {log.type === 'info' && <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                        <span className="truncate" title={log.message}>{log.message}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
