import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PhishingLogin = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("c");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("login_attempts").insert({
        campaign_id: campaignId,
        entered_email: email,
        entered_password: password,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        user_agent: navigator.userAgent,
        ip_address: null, // Client-side can't reliably get IP without a function, that's okay for now
      });

      if (error) {
        console.error("Error logging attempt:", error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (!campaignId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Invalid link.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <Shield className="mx-auto mb-4 h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">Security Awareness Notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>This was a simulated phishing test</AlertTitle>
              <AlertDescription>
                This login page was part of a cybersecurity awareness training exercise. No real account was compromised, but your credentials were captured to demonstrate the risks.
              </AlertDescription>
            </Alert>
            <div className="space-y-3 text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground">How to spot phishing attacks:</h3>
              <ul className="list-inside list-disc space-y-2">
                <li><CheckCircle className="mr-1 inline h-3 w-3 text-primary" />Always check the URL — legitimate sites use their official domain</li>
                <li><CheckCircle className="mr-1 inline h-3 w-3 text-primary" />Look for HTTPS and a valid security certificate</li>
                <li><CheckCircle className="mr-1 inline h-3 w-3 text-primary" />Be suspicious of urgent or unexpected login requests</li>
                <li><CheckCircle className="mr-1 inline h-3 w-3 text-primary" />Never enter credentials from links in emails or messages</li>
                <li><CheckCircle className="mr-1 inline h-3 w-3 text-primary" />Enable two-factor authentication wherever possible</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhishingLogin;
