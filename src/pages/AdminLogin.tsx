import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      console.log("Attempting sign up with:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("Sign up result:", { data, error });

      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (data.session) {
        toast({ title: "Sign up successful", description: "You are now logged in." });
        navigate("/admin");
      } else {
        toast({ title: "Sign up successful", description: "Please check your email to confirm your account." });
        setIsSignUp(false); // Switch back to login after successful signup
      }
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      navigate("/admin");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="mx-auto mb-2 h-10 w-10 text-primary" />
          <CardTitle className="text-2xl">{isSignUp ? "Admin Sign Up" : "Admin Login"}</CardTitle>
          <p className="text-sm text-muted-foreground">Phishing Simulation Dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? "Signing up..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
