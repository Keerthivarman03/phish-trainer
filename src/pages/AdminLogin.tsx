import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Terminal, Lock } from "lucide-react";
import { motion } from "framer-motion";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  // Clear any existing session on mount to ensure clean login
  useEffect(() => {
    supabase.auth.signOut();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        // LOGIN
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (session) navigate("/admin");
      } else {
        // SIGN UP
        const { data: { session }, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (session) {
          navigate("/admin");
        } else {
          // If session is null, email confirmation is likely required (unless disabled in dashboard)
          setErrorMsg("Account created! If not redirected, check email or disable verification in Supabase.");
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden font-sans">
      {/* Background Matrix-like effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-zinc-950 to-zinc-950" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4">
            <ShieldAlert className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PhishTrainer Command</h1>
          <p className="text-zinc-400 mt-2">{isLogin ? "Authorized Access Only" : "Initialize New Operator"}</p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">{isLogin ? "System Login" : "Create Identity"}</CardTitle>
            <CardDescription className="text-zinc-500">
              {isLogin ? "Enter your administrative credentials" : "Register a new administrator account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {errorMsg && (
                <Alert variant={errorMsg.includes("Account created") ? "default" : "destructive"} className={errorMsg.includes("Account created") ? "bg-green-900/20 border-green-900/50 text-green-200" : "bg-red-900/20 border-red-900/50 text-red-200"}>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Admin Email</Label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@system.local"
                    className="pl-9 bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9 bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white" disabled={loading}>
                {loading ? "Processing..." : (isLogin ? "Establish Session" : "Register System")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-zinc-800 py-4">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
              className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              {isLogin ? "Need a new account? Initialize Identity" : "Already registered? Establish Session"}
            </button>
            <span className="text-xs text-zinc-600">Secure Environment v1.0.4</span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
