import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Trash2, Globe, Clock, FileText, User, UserCheck, Shield, Activity, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface ArticlePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: any; // Using any for simplicity here, assuming it's the alert object
}

export function ArticlePreviewModal({ open, onOpenChange, alert }: ArticlePreviewModalProps) {
  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] h-[85vh] p-0 overflow-hidden flex flex-col bg-[#f8fafc] border-indigo-100 rounded-2xl">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6 shrink-0 shadow-sm z-10 relative flex flex-col gap-4">
          {/* Top action row */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => {
                onOpenChange(false);
                window.location.href = "/media";
              }}
              className="group flex items-center gap-2 w-fit text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Media Agent
            </button>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-full">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Title row */}
          <div>
            <DialogTitle className="text-2xl font-bold text-foreground mb-3 leading-tight tracking-tight">
              {alert.title}
            </DialogTitle>
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                <Globe className="h-3.5 w-3.5" /> Source
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {new Date(alert.generatedAt).toLocaleString()}
              </span>
              <span>en</span>
              <span className="flex items-center gap-1.5">
                Credibility: <span className="font-mono text-foreground font-black">90</span>
              </span>
              <Badge className="bg-success/10 text-success border border-success/20 hover:bg-success/20 shadow-none px-2 py-0.5 text-[10px]">LOW</Badge>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 md:p-8">
          
          {/* Left Pane - Article Content */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-border/50 shadow-sm p-6 overflow-y-auto">
            <h3 className="text-base font-bold flex items-center gap-2 mb-6 text-indigo-900 border-b pb-4">
              <FileText className="h-5 w-5 text-indigo-500" /> Article Content
            </h3>
            
            <div className="prose prose-sm max-w-none text-muted-foreground leading-loose">
              {/* Simulated highlighted article content. In a real app this would parse the actual text and highlight entities. */}
              US technology giant <mark className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">Oracle</mark> has partnered with the <mark className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">Uttar Pradesh State Skill Development Mission</mark> 
              (UPSDM) to train 300,000 students and working professionals across the state in artificial intelligence 
              (AI), cloud computing, cybersecurity and data science by 2029, as demand for digital talent accelerates 
              across industries. The programme, announced on Monday, will provide more than 300 hours of training 
              covering technologies such as <mark className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">Oracle Cloud Infrastructure (OCI)</mark>, OCI Enterprise AI, OCI Data Science, 
              Oracle APEX, OCI DevOps and Oracle Security.
              <br/><br/>
              The training will be delivered free of cost through <mark className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">Oracle MyLearn</mark>, the company's digital learning platform. 
              The initiative is aimed at enhancing employability and building a future-ready workforce to support Uttar Pradesh's 
              digital transformation and economic growth agenda. According to the state government, the programme will leverage 
              UPSDM's state-wide skilling infrastructure to expand access to industry-relevant digital training.
              <br/><br/>
              <mark className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">Pulkit Khare</mark>, mission director of the Uttar Pradesh Skill Development Mission, said the partnership would make 
              advanced digital skills training accessible to learners across Uttar Pradesh and help create a workforce 
              aligned with evolving industry requirements. 
              <br/><br/>
              "Oracle is committed to supporting India's ambition to become a global hub for AI and digital innovation," said <mark className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">Shailender Kumar</mark>, Senior Vice President and 
              Regional Managing Director for Oracle India and NetSuite JAPAC. He said the collaboration combines 
              Oracle's technology expertise with the state's training ecosystem to help learners acquire in-demand 
              digital skills and contribute to Uttar Pradesh's long-term economic development.
            </div>
          </div>

          {/* Right Pane - AI Analysis */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col overflow-hidden">
            <h3 className="text-base font-bold flex items-center gap-2 mb-6 text-indigo-900 border-b pb-4 shrink-0">
              <Shield className="h-5 w-5 text-indigo-500" /> AI Analysis
            </h3>

            <Tabs defaultValue="entities" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full bg-muted/30 p-1 rounded-xl mb-6 shrink-0 grid grid-cols-4 gap-1">
                <TabsTrigger value="entities" className="rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">Entities</TabsTrigger>
                <TabsTrigger value="risk" className="rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">Risk</TabsTrigger>
                <TabsTrigger value="summary" className="rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">Summary</TabsTrigger>
                <TabsTrigger value="trace" className="rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">Trace</TabsTrigger>
              </TabsList>

              <TabsContent value="entities" className="flex-1 overflow-y-auto m-0 pr-2 space-y-4 custom-scrollbar">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Extracted Entities</div>
                
                {[
                  { name: "Oracle", matched: true, type: "org" },
                  { name: "Uttar Pradesh State Skill Development Mission", matched: false, type: "org" },
                  { name: "UPSDM", matched: false, type: "org" },
                  { name: "Pulkit Khare", matched: false, type: "person" },
                  { name: "Shailender Kumar", matched: false, type: "person" },
                  { name: "Oracle Cloud Infrastructure", matched: false, type: "product" },
                  { name: "OCI", matched: false, type: "product" },
                  { name: "Oracle MyLearn", matched: false, type: "product" },
                ].map((entity, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {entity.type === "person" ? <User className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground">{entity.name}</span>
                    </div>
                    {entity.matched && (
                      <Badge variant="outline" className="bg-success/5 text-success border-success/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Matched
                      </Badge>
                    )}
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="risk" className="flex-1 overflow-y-auto m-0">
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm">Risk analysis is actively processing. Review entity matches while confidence scoring completes.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="summary" className="flex-1 overflow-y-auto m-0">
                <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
                  <p className="text-sm leading-relaxed text-muted-foreground">{alert.summary}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="trace" className="flex-1 overflow-y-auto m-0">
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm">Pipeline trace log available for this event.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
