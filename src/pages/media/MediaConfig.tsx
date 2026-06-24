import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Target, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "@/components/ui/use-toast";

export default function MediaConfig() {
  const [trustedOnly, setTrustedOnly] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState([75]);
  const [severityThreshold, setSeverityThreshold] = useState([60]);
  const [matchingSensitivity, setMatchingSensitivity] = useState("balanced");

  const sourceToggles = [
    { label: "Global News Sources", enabled: true },
    { label: "Financial Press", enabled: true },
    { label: "Regulatory Announcements", enabled: true },
    { label: "Blog & Opinion Sources", enabled: false },
    { label: "Social Media Feeds", enabled: false },
    { label: "Local News (non-English)", enabled: true },
  ];

  const regionToggles = [
    { label: "North America", enabled: true },
    { label: "Europe", enabled: true },
    { label: "Middle East", enabled: true },
    { label: "Asia-Pacific", enabled: true },
    { label: "Latin America", enabled: true },
    { label: "Africa", enabled: false },
  ];

  const riskCategories = [
    { label: "Fraud", enabled: true },
    { label: "Money Laundering", enabled: true },
    { label: "Corruption", enabled: true },
    { label: "Sanctions Exposure", enabled: true },
    { label: "PEP Association", enabled: true },
    { label: "Tax Evasion", enabled: true },
    { label: "Terrorism Financing", enabled: true },
    { label: "Environmental Crime", enabled: false },
  ];

  const [sources, setSources] = useState(sourceToggles);
  const [regions, setRegions] = useState(regionToggles);
  const [risks, setRisks] = useState(riskCategories);

  const toggle = (arr: typeof sources, setArr: typeof setSources, i: number) => {
    const next = [...arr];
    next[i] = { ...next[i], enabled: !next[i].enabled };
    setArr(next);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Media Agent Configuration</h1>
              <p className="text-sm text-muted-foreground mt-1">Control source intelligence, risk detection, and alert behaviour</p>
            </div>
            <Button size="sm" onClick={() => toast({ title: "Configuration Saved", description: "Media agent configurations have been successfully updated." })}>Save Configuration</Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Controls */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-primary" /> Source Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-xs font-medium">Trusted Sources Only</p>
                    <p className="text-[10px] text-muted-foreground">Only ingest from verified high-credibility sources</p>
                  </div>
                  <Switch checked={trustedOnly} onCheckedChange={setTrustedOnly} />
                </div>
                {sources.map((s, i) => (
                  <div key={s.label} className="flex items-center justify-between py-1.5">
                    <span className="text-xs">{s.label}</span>
                    <Switch checked={s.enabled} onCheckedChange={() => toggle(sources, setSources, i)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Region Controls */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-accent" /> Region Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {regions.map((r, i) => (
                  <div key={r.label} className="flex items-center justify-between py-1.5">
                    <span className="text-xs">{r.label}</span>
                    <Switch checked={r.enabled} onCheckedChange={() => toggle(regions, setRegions, i)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Detection */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Target className="h-3.5 w-3.5 text-destructive" /> Risk Detection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Confidence Threshold</span>
                    <span className="text-xs font-mono font-bold">{confidenceThreshold[0]}%</span>
                  </div>
                  <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} max={100} min={50} step={5} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Severity Threshold</span>
                    <span className="text-xs font-mono font-bold">{severityThreshold[0]}</span>
                  </div>
                  <Slider value={severityThreshold} onValueChange={setSeverityThreshold} max={100} min={0} step={5} />
                </div>
                <div>
                  <div className="text-xs font-medium mb-2">Risk Categories</div>
                  <div className="space-y-2">
                    {risks.map((r, i) => (
                      <div key={r.label} className="flex items-center justify-between py-1">
                        <span className="text-xs">{r.label}</span>
                        <Switch checked={r.enabled} onCheckedChange={() => toggle(risks, setRisks, i)} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Matching & Alerts */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-warning" /> Matching & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs font-medium mb-2">Matching Sensitivity</div>
                  <Select value={matchingSensitivity} onValueChange={setMatchingSensitivity}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict — Exact matches only</SelectItem>
                      <SelectItem value="balanced">Balanced — Recommended</SelectItem>
                      <SelectItem value="aggressive">Aggressive — Catch more, higher FP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="text-xs font-medium mb-2">Alert Triggers</div>
                  <div className="space-y-2">
                    {[
                      { label: "Immediate Alert", desc: "Notify on each high-risk detection", enabled: true },
                      { label: "Batch Digest", desc: "Aggregate alerts into periodic digests", enabled: true },
                      { label: "Threshold-Based", desc: "Alert when risk score exceeds threshold", enabled: false },
                    ].map((trigger, i) => (
                      <div key={trigger.label} className="flex items-center justify-between rounded-lg border p-2.5">
                        <div>
                          <p className="text-xs font-medium">{trigger.label}</p>
                          <p className="text-[10px] text-muted-foreground">{trigger.desc}</p>
                        </div>
                        <Switch defaultChecked={trigger.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
