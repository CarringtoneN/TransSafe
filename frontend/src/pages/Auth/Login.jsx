import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, LogIn, ShieldCheck } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { ROLE_CONFIG } from "../../config/roles";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={ROLE_CONFIG[JSON.parse(localStorage.getItem("transsafe_user") || "{}")?.role]?.dashboard || "/"} replace />;

  async function submit(e) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try { const user = await login(email, password); navigate(location.state?.from?.pathname || ROLE_CONFIG[user.role]?.dashboard || "/", { replace: true }); }
    catch (err) { setError(err.response?.data?.message || "Unable to sign in. Check your credentials."); }
    finally { setSubmitting(false); }
  }

  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white"><ShieldCheck size={28} /></div><h1 className="text-3xl font-bold text-slate-900">TransSafe</h1><p className="mt-2 text-slate-500">Fleet Management System</p></div>
      <form onSubmit={submit} className="space-y-5">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div><label className="mb-2 block text-sm font-medium">Email</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={19}/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg border p-3 pl-10" placeholder="you@transsafe.com" /></div></div>
        <div><label className="mb-2 block text-sm font-medium">Password</label><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-slate-400" size={19}/><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg border p-3 pl-10" placeholder="••••••••" /></div></div>
        <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><LogIn size={18}/>{submitting ? "Signing in..." : "Sign in"}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-400">Accounts are created by an administrator.</p>
    </div>
  </div>;
}
export default Login;
