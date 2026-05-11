import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { NetworkBackground } from '@/components/layout/NetworkBackground';
import { Bot, Mail, Lock } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setErrorMsg(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      setErrorMsg(error.message || 'Error al iniciar sesión. Comprueba tu conexión a internet o intenta abrir la aplicación en una pestaña nueva si tienes bloqueadores de anuncios.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingresa correo y contraseña.');
      return;
    }
    
    setAuthLoading(true);
    setErrorMsg(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      switch(error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setErrorMsg('Correo o contraseña incorrectos.');
          break;
        case 'auth/email-already-in-use':
          setErrorMsg('El correo ya está en uso. Intenta iniciar sesión.');
          break;
        case 'auth/weak-password':
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          break;
        default:
          setErrorMsg(error.message || 'Error en la autenticación. Es posible que el acceso por correo no esté habilitado en Firebase.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <NetworkBackground />
        <div className="z-10 animate-pulse text-cyan-500 flex flex-col items-center">
          <img src="/hd-logo.svg" alt="RHDreams Logo" className="w-12 h-12 mb-4 drop-shadow-md" />
          <p>Cargando perfil de usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <NetworkBackground />
        <div className="z-10 bg-slate-900/80 p-8 rounded-2xl border border-slate-700/50 glass-panel flex flex-col items-center max-w-sm w-full shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/30 p-2">
            <img src="/hd-logo.svg" alt="RHDreams Logo" className="w-full h-full drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">RHDreams</h2>
          <p className="text-slate-400 text-sm text-center mb-6">
            {isRegistering ? 'Crea tu cuenta para acceder a la plataforma.' : 'Inicia sesión para gestionar agentes de IA.'}
          </p>
          
          {errorMsg && (
            <div className="w-full bg-rose-500/10 border border-rose-500/50 text-rose-400 text-xs p-3 rounded-lg flex items-start gap-2 mb-6">
              <span className="shrink-0 pt-0.5">⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="ejemplo@correo.com"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {authLoading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsRegistering(!isRegistering);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>

          <div className="w-full flex items-center gap-3 mb-6">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">o continuar con</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          <button 
            onClick={signInWithGoogle}
            type="button"
            className="w-full bg-white text-slate-900 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-current">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
