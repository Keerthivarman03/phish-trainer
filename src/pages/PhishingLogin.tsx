import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle, CheckCircle, ArrowRight, Eye, EyeOff, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PhishingLogin = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("c");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;
    setLoading(true);

    try {
      await supabase.from("login_attempts").insert({
        campaign_id: campaignId,
        entered_email: email,
        entered_password: password,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        user_agent: navigator.userAgent,
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitted(true);
      setTimeout(() => setShowWarning(true), 500);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!campaignId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4 font-sans">
        <p className="text-muted-foreground">Invalid access link.</p>
      </div>
    );
  }

  if (submitted && showWarning) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-600 font-sans"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-center text-white max-w-2xl"
        >
          <AlertTriangle className="h-24 w-24 mx-auto mb-6 text-white drop-shadow-md" />
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">PHISHING SIMULATION</h1>
          <p className="text-xl opacity-90 mb-12 font-light">
            Don't panic. This was a training exercise authorized by your organization.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-left border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6" />
              Security Breakdown
            </h3>
            <ul className="space-y-4">
              {[
                "The URL was not the official service domain.",
                "The login page lacked branding verification.",
                "The request arrived unexpectedly.",
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  className="flex items-start gap-4 text-lg"
                >
                  <CheckCircle className="h-6 w-6 text-green-300 shrink-0 mt-0.5" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      {/* Left Split - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-[#F3F5F9] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 mix-blend-multiply" />

        {/* Brand Logo - Top Left */}
        <div className="relative z-10 flex items-center gap-2 font-bold text-xl text-blue-900">
          <Cloud className="h-8 w-8 text-blue-600 fill-blue-600" />
          <span>CloudSecure</span>
        </div>

        {/* Dynamic Graphic Center */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-[400px] h-[300px] bg-blue-600 rounded-2xl shadow-2xl flex items-center justify-center transform rotate-[-6deg] z-20 relative">
              <div className="text-white text-6xl font-bold tracking-tighter">DATA<br />VAULT</div>
            </div>
            <div className="absolute top-10 left-10 w-[400px] h-[300px] bg-blue-200 rounded-2xl -z-10 transform rotate-[3deg]" />
          </motion.div>
        </div>

        {/* Footer Text */}
        <div className="relative z-10 text-slate-500 text-sm">
          &copy; 2026 CloudSecure Inc. All rights reserved.
        </div>
      </div>

      {/* Right Split - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-blue-900 mb-8 justify-center">
              <Cloud className="h-8 w-8 text-blue-600 fill-blue-600" />
              <span>CloudSecure</span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-500">to continue to your secure file storage</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-slate-300 focus:border-blue-600 focus:ring-blue-600 rounded-lg text-base"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-slate-300 focus:border-blue-600 focus:ring-blue-600 rounded-lg text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button type="submit" className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" disabled={loading}>
                {loading ? "Verifying..." : "Sign In"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </motion.div>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-slate-400 text-sm">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <Button variant="outline" type="button" className="w-full h-12 font-medium border-slate-300 text-slate-700 hover:bg-slate-50">
              Sign in with SSO
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PhishingLogin;
