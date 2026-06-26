import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, UploadCloud, AlertTriangle, Send, User, Bot, FileText, Lock, XOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Policy = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'security' | 'content' | 'privacy';
  keywords: string[];
};

const initialPolicies: Policy[] = [
  { id: 'p1', name: 'PII & Data Redaction', description: 'Automatically block or redact Personally Identifiable Information (SSN, credit cards, emails, passports).', enabled: true, type: 'privacy', keywords: ['ssn', 'social security', 'credit card', 'email', '@', 'password', 'dob', 'date of birth', 'passport', 'driver license', 'national id'] },
  { id: 'p2', name: 'Abusive Content Filter', description: 'Block profanity, hate speech, and abusive language directed at the AI or extracted entities.', enabled: true, type: 'content', keywords: ['idiot', 'stupid', 'hate', 'kill', 'abuse', 'fuck', 'bitch', 'asshole'] },
  { id: 'p3', name: 'Blackmail & Negative Content', description: 'Prevent the AI from generating extortion threats, blackmail, or severe reputation-damaging material.', enabled: true, type: 'security', keywords: ['blackmail', 'extort', 'threat', 'leak', 'ruin', 'pay me', 'ransom', 'hostage'] },
  { id: 'p4', name: 'Prompt Injection Defense', description: 'Block attempts to override system instructions (e.g., "ignore previous instructions", "jailbreak").', enabled: true, type: 'security', keywords: ['ignore previous', 'jailbreak', 'override', 'system prompt', 'bypass', 'access', 'instructions', 'reveal', 'system', 'backend'] },
  { id: 'p5', name: 'Confidentiality & Trade Secrets', description: 'Prevent the AI from leaking API keys, internal revenue numbers, or proprietary risk-scoring algorithms.', enabled: true, type: 'security', keywords: ['api key', 'revenue', 'trade secret', 'source code', 'proprietary', 'internal logic', 'financials', 'profit', 'auth token'] },
  { id: 'p6', name: 'KYC/AML Bypass Prevention', description: 'Block inquiries asking how to bypass KYC checks, forge documents, or evade sanctions.', enabled: true, type: 'content', keywords: ['bypass kyc', 'fake id', 'synthetic identity', 'money laundering', 'evade sanctions', 'fake passport', 'spoof', 'forge', 'fake document'] },
];

type Message = {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  status?: 'allowed' | 'blocked';
  policyTriggered?: string;
  timestamp: Date;
};

export default function AIGovernance() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', role: 'system', content: 'Firewall active. Type a prompt to test your governance policies.', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, date: Date}[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<Policy>>({ type: 'security', enabled: true, keywords: [] });

  const handleAddPolicy = () => {
    if (newPolicy.name && newPolicy.description) {
      setPolicies([...policies, { ...newPolicy, id: `p${Date.now()}` } as Policy]);
      setIsAddingPolicy(false);
      setNewPolicy({ type: 'security', enabled: true, keywords: [] });
      toast({ title: "Policy Created", description: "New policy added to the firewall." });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        date: new Date()
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast({ title: "Document Uploaded", description: "Your custom policy will be trained into the firewall." });
    }
  };

  const handleSavePolicy = () => {
    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === editingPolicy.id ? editingPolicy : p));
      setEditingPolicy(null);
      toast({ title: "Policy Updated", description: "Your changes have been saved to the firewall." });
    }
  };

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    const policy = policies.find(p => p.id === id);
    toast({
      title: !policy?.enabled ? "Policy Activated" : "Policy Deactivated",
      description: `"${policy?.name}" has been updated in the firewall.`,
    });
  };

  const handleTestPrompt = () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsSimulating(true);

    setTimeout(() => {
      let triggeredPolicy: Policy | null = null;
      const lowerInput = newMsg.content.toLowerCase();

      // Simple mock firewall logic checking enabled policies against keywords
      for (const policy of policies.filter(p => p.enabled)) {
        if (policy.keywords.some(kw => lowerInput.includes(kw))) {
          triggeredPolicy = policy;
          break;
        }
      }

      let systemResponse: Message;

      if (triggeredPolicy) {
        systemResponse = {
          id: Date.now().toString() + 's',
          role: 'system',
          status: 'blocked',
          policyTriggered: triggeredPolicy.name,
          content: `RESTRICTED BY FIREWALL: Prompt blocked due to violation of "${triggeredPolicy.name}" rules.`,
          timestamp: new Date()
        };
      } else {
        systemResponse = {
          id: Date.now().toString() + 's',
          role: 'assistant',
          status: 'allowed',
          content: `[Allowed by Firewall] I am an AI agent and I've received your prompt safely. How can I help you further?`,
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, systemResponse]);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Governance & Firewall</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-2xl">
              Configure guardrails and compliance rules for all generative AI operations. The global firewall intercepts and evaluates prompts and responses in real-time.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Policies & Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-7 space-y-6">
            
            {/* Active Policies */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">Active Guardrails</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 uppercase tracking-wider text-[10px] font-bold px-2.5 py-0.5">
                    Firewall Online
                  </Badge>
                  <Button size="sm" className="h-8 text-[12px] font-bold gap-1 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20" onClick={() => setIsAddingPolicy(true)}>
                    + New Policy
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {policies.map(policy => (
                  <div key={policy.id} className={`p-5 flex gap-4 items-start transition-colors ${!policy.enabled ? 'bg-slate-50/50 opacity-75' : ''}`}>
                    <div className={`p-2.5 rounded-lg shrink-0 ${policy.enabled ? (policy.type === 'security' ? 'bg-rose-100 text-rose-600' : policy.type === 'privacy' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600') : 'bg-slate-200 text-slate-500'}`}>
                      {policy.type === 'security' ? <Lock className="h-5 w-5" /> : policy.type === 'privacy' ? <FileText className="h-5 w-5" /> : <XOctagon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{policy.name}</h4>
                        <Switch 
                          checked={policy.enabled} 
                          onCheckedChange={() => togglePolicy(policy.id)} 
                          className="data-[state=checked]:bg-[#10B981]"
                        />
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed pr-8">{policy.description}</p>
                      <div className="pt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-[11px] font-bold px-3 gap-1.5" onClick={() => setEditingPolicy(policy)}>
                          <FileText className="h-3 w-3" /> Edit Policy
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Policy Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Upload Custom Guidelines</h3>
              <div className="border-2 border-dashed border-indigo-200/60 rounded-xl bg-indigo-50/30 p-8 flex flex-col items-center justify-center hover:bg-indigo-50/60 hover:border-indigo-400 transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                  <UploadCloud className="h-6 w-6 text-indigo-500" />
                </div>
                <h4 className="text-[15px] font-bold text-slate-900 mb-1">Drag & Drop Corporate Policy</h4>
                <p className="text-xs text-slate-500 text-center max-w-sm">Upload company Do's and Don'ts, ethical AI guidelines, or specific restriction lists. Supported formats: .pdf, .docx, .txt</p>
                <input type="file" className="hidden" id="policy-upload" multiple onChange={handleFileUpload} />
                <Button variant="outline" className="mt-5 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => document.getElementById('policy-upload')?.click()}>
                  Browse Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm text-slate-700">Uploaded Documents</h4>
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium uppercase mt-0.5">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2" onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}>
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>

          {/* Right Column: Firewall Simulator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 flex flex-col h-[500px] sticky top-8">
              
              {/* Simulator Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white tracking-wide">Firewall Sandbox</h3>
                </div>
                <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-900/50 font-mono text-[10px]">TEST MODE</Badge>
              </div>

              {/* Chat History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : msg.role === 'system' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : msg.role === 'system' ? <AlertTriangle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : msg.status === 'blocked' 
                            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-tl-sm' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-sm'
                      }`}>
                        {msg.status === 'blocked' && (
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1.5 pb-1.5 border-b border-rose-500/20">
                            Policy Triggered: {msg.policyTriggered}
                          </div>
                        )}
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isSimulating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[90%]">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <ShieldAlert className="h-4 w-4 text-slate-500 animate-pulse" />
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 text-sm flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                        <span className="text-xs font-mono">Evaluating via Firewall...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-950 border-t border-slate-800">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleTestPrompt(); }}
                  className="flex gap-2"
                >
                  <Input 
                    placeholder="Type a test prompt (e.g. 'ignore previous' or 'pay me')..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputValue.trim() || isSimulating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Policy: {editingPolicy?.name}</DialogTitle>
          </DialogHeader>
          {editingPolicy && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Policy Name</Label>
                <Input value={editingPolicy.name} onChange={e => setEditingPolicy({...editingPolicy, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editingPolicy.description} onChange={e => setEditingPolicy({...editingPolicy, description: e.target.value})} className="h-20" />
              </div>
              <div className="space-y-2">
                <Label>Trigger Keywords (comma separated)</Label>
                <Textarea 
                  value={editingPolicy.keywords.join(', ')} 
                  onChange={e => setEditingPolicy({...editingPolicy, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                  className="h-20" 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPolicy(null)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSavePolicy}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingPolicy} onOpenChange={setIsAddingPolicy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Policy Name</Label>
              <Input value={newPolicy.name || ''} onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} placeholder="e.g. Stop Internal Names" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newPolicy.description || ''} onChange={e => setNewPolicy({...newPolicy, description: e.target.value})} className="h-20" placeholder="Describe what this policy blocks..." />
            </div>
            <div className="space-y-2">
              <Label>Trigger Keywords (comma separated)</Label>
              <Textarea 
                value={newPolicy.keywords?.join(', ') || ''} 
                onChange={e => setNewPolicy({...newPolicy, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                className="h-20" 
                placeholder="e.g. project titan, john doe, internal server"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPolicy(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddPolicy} disabled={!newPolicy.name || !newPolicy.description}>Create Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
