import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Crown } from 'lucide-react';

export const CustomData = () => {
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Request Custom Data</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Our intelligence team builds custom datasets tailored to your precise use case.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-slate-200 mt-8 relative group bg-white">
          <div className="bg-slate-50 px-8 py-10 border-b border-slate-100 flex flex-col items-center text-center relative z-10">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-100 blur-[40px] rounded-full pointer-events-none" />
            
            <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm mb-6 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md">
              <Crown className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Can't find the dataset you need?</h2>
            <p className="text-base text-slate-600 leading-relaxed max-w-lg">
              We know the feeling. The <span className="font-bold text-slate-900">InFynd</span> data intelligence team will scout, compile, and build a bespoke dataset exclusively for you.
            </p>
          </div>
          
          <div className="px-8 py-8 bg-white space-y-6 relative z-10">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Entity or Industry Description</label>
              <Textarea 
                placeholder="e.g. 'I need a comprehensive list of high-risk fintech startups in Southeast Asia with regulatory fines in the last 5 years...'" 
                className="resize-none h-32 bg-slate-50 border-slate-200 focus-visible:ring-red-500 focus-visible:border-red-500 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-900 text-base"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Contact Email</label>
              <Input 
                placeholder="you@company.com" 
                className="bg-slate-50 border-slate-200 focus-visible:ring-red-500 focus-visible:border-red-500 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-900 h-12 text-base"
              />
            </div>
            <Button 
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-14 text-lg font-semibold transition-all group-hover:shadow-xl" 
              onClick={() => toast({ title: "Request Submitted to InFynd", description: "Our intelligence team will review your request and reach out within 24 hours." })}
            >
              Submit Intelligence Request
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
export default CustomData;
