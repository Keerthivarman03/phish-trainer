import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Tables } from "@/integrations/supabase/types";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#8b5cf6"];

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<Tables<"login_attempts">[]>([]);
  const [campaigns, setCampaigns] = useState<Tables<"campaigns">[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // If no user is logged in, stop loading and return
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        console.log("Fetching analytics...");

        const { data: c, error: cError } = await supabase
          .from("campaigns")
          .select("*");

        if (cError) console.error("Analytics campaign error:", cError);
        if (c) setCampaigns(c);

        let query = supabase.from("login_attempts").select("*").order("created_at");
        if (selectedCampaign !== "all") {
          query = query.eq("campaign_id", selectedCampaign);
        }

        const { data, error: aError } = await query;

        if (aError) console.error("Analytics attempt error:", aError);
        if (data) setAttempts(data);

      } catch (err) {
        console.error("Critical error in Analytics fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when auth is ready
    if (!authLoading) {
      fetchData();
    }
  }, [selectedCampaign, authLoading, user?.id]); // ✅ Fix: Use user.id (stable) instead of user object

  // Attempts over time (by day)
  const timeData = attempts.reduce<Record<string, number>>((acc, a) => {
    const day = new Date(a.created_at).toLocaleDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const timeChart = Object.entries(timeData).map(([date, count]) => ({ date, count }));

  // Browser breakdown
  const browserData = attempts.reduce<Record<string, number>>((acc, a) => {
    const b = a.browser || "Unknown";
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});
  const browserChart = Object.entries(browserData).map(([name, value]) => ({ name, value }));

  // OS breakdown
  const osData = attempts.reduce<Record<string, number>>((acc, a) => {
    const o = a.os || "Unknown";
    acc[o] = (acc[o] || 0) + 1;
    return acc;
  }, {});
  const osChart = Object.entries(osData).map(([name, value]) => ({ name, value }));

  // Top locations
  const locData = attempts.reduce<Record<string, number>>((acc, a) => {
    const loc = [a.city, a.country].filter(Boolean).join(", ") || "Unknown";
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});
  const locChart = Object.entries(locData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Overview of phishing simulation results</p>
          </div>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : attempts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No attempt data yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Attempts Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Browser Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={browserChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {browserChart.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>OS Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={osChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {osChart.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Top Locations</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Analytics;
