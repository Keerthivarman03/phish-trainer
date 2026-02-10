import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Trash2, RefreshCw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Campaign = Tables<"campaigns"> & { attempt_count?: number };

const Campaigns = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    // If auth is still loading, wait. If no user, we can't fetch.
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      console.log("Fetching campaigns for user:", user.id);

      const { data: campaignData, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Campaign fetch error:", error);
        setErrorMsg(error.message);
        // Do NOT clear campaigns on error - keep stale data if possible
        // setCampaigns([]); 
        setLoading(false);
        return;
      }

      if (campaignData) {
        console.log("Campaigns fetched from DB:", campaignData.length);

        // Fetch counts for each campaign
        const withCounts = await Promise.all(
          campaignData.map(async (c) => {
            try {
              const { count } = await supabase
                .from("login_attempts")
                .select("*", { count: "exact", head: true })
                .eq("campaign_id", c.id);

              return { ...c, attempt_count: count ?? 0 };
            } catch (e) {
              console.error("Count fetch error", e);
              return { ...c, attempt_count: 0 };
            }
          })
        );

        setCampaigns(withCounts);
      }
    } catch (err: any) {
      console.error("Critical error in fetchCampaigns:", err);
      setErrorMsg(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when component mounts AND when user/authLoading changes
  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchCampaigns();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  const handleManualRefresh = () => {
    fetchCampaigns();
    toast({ title: "Refreshing..." });
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Optimistic UI could be added here, but let's stick to safe DB ops
    const { data: result, error } = await supabase.from("campaigns").insert({
      name,
      description,
      created_by: user.id,
    }).select();

    if (error) {
      console.error("Supabase error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setName("");
    setDescription("");
    setDialogOpen(false);
    // Add a small delay to ensure DB propagation before fetching
    setTimeout(() => {
      fetchCampaigns();
    }, 500);
    toast({ title: "Campaign created" });
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    fetchCampaigns();
    toast({ title: "Campaign deleted" });
  };

  const getPhishingUrl = (id: string) => `${window.location.origin}/login?c=${id}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground">Manage your phishing simulation campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleManualRefresh} title="Refresh List">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />New Campaign</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={createCampaign} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
                  </div>
                  <Button type="submit" className="w-full">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading && campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        ) : errorMsg ? (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-destructive">
              <p>Error: {errorMsg}</p>
              <Button variant="outline" onClick={fetchCampaigns}>Try Again</Button>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-muted-foreground">No campaigns yet. Create your first one!</p>
              <Button variant="outline" onClick={handleManualRefresh}>
                Refresh List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>{campaign.description}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteCampaign(campaign.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Attempts</span>
                    <span className="font-semibold text-foreground">{campaign.attempt_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/admin/campaign/${campaign.id}`}>View Logs</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(getPhishingUrl(campaign.id));
                        toast({ title: "Link copied!" });
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Campaigns;
