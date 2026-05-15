import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import sbLogo from "../../assets/C_pia_de_PADR_O_SB_LAYOUT_ONEPAGES__1080_x_1080_px_.png";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { useAuth } from "../hooks/useAuth";
import { IconButton } from "../components/common/IconButton";

function formatCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />;

  const triggerShake = () => {
    setShake(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShake(true)));
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cpf.replace(/\D/g, "");
    if (!digits) { setError("Digite seu CPF"); triggerShake(); return; }
    if (!senha) { setError("Digite sua senha"); triggerShake(); return; }

    setLoading(true);
    setError(null);
    const errorMsg = await login(digits, senha);
    setLoading(false);

    if (errorMsg) {
      setError(errorMsg);
      triggerShake();
    } else {
      navigate(ROUTES.home);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.teal,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <div className="px-6 pt-3 pb-1"><div className="h-8" /></div>

      <div className="px-6 pt-2 pb-4 flex items-center gap-3">
        <IconButton onClick={() => navigate(ROUTES.splash)}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </IconButton>
        <div className="flex-1 text-center pr-9">
          <p className="text-white">Entrar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 flex flex-col">
        <div className="flex flex-col items-center mt-4">
          <img src={sbLogo} alt="SB" className="w-20 h-20 rounded-2xl" />
          <h1 className="text-white mt-3">Bem-vindo</h1>
          <p className="text-white/80 mt-1 text-center">
            Entre com seu CPF e senha para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-white/85">CPF</span>
            <input
              inputMode="numeric"
              autoComplete="username"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full rounded-2xl border border-white/70 bg-transparent px-4 py-3 text-white placeholder-white/50 outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/85">Senha</span>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-2xl border border-white/70 bg-transparent px-4 py-3 pr-12 text-white placeholder-white/50 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </label>

          {error && (
            <>
              <style>{`
                @keyframes sb-shake {
                  0%, 100% { transform: translateX(0); }
                  20% { transform: translateX(-6px); }
                  40% { transform: translateX(6px); }
                  60% { transform: translateX(-4px); }
                  80% { transform: translateX(4px); }
                }
              `}</style>
              <p
                className="text-center text-white"
                style={shake ? { animation: "sb-shake 0.45s ease" } : {}}
              >
                {error}
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-4 mt-2 disabled:opacity-60"
            style={{ color: COLORS.teal }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
