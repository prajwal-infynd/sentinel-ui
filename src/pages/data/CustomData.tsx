import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Filter, Database, Info, UploadCloud, Type, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Heading1, Heading2, Loader2 } from 'lucide-react';

export const CustomData = () => {
  const { toast } = useToast();
  
  // Form State
  const [targetVolume, setTargetVolume] = useState("");
  const [requestCategory, setRequestCategory] = useState("order");
  const [audienceCriteria, setAudienceCriteria] = useState("");
  const [orderName, setOrderName] = useState("");
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!targetVolume || !orderName || !deliveryEmail) {
      toast({ title: "Validation Error", description: "Please fill in all required fields (*).", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/custom-data/order", {
        targetVolume,
        requestCategory,
        audienceCriteria,
        orderName,
        deliveryEmail,
        notes,
      });
      
      toast({ title: "Custom Order Submitted", description: "Our intelligence team has received your request and will reach out shortly." });
      
      // Reset form
      setTargetVolume("");
      setOrderName("");
      setDeliveryEmail("");
      setNotes("");
    } catch (error) {
      toast({ title: "Submission Failed", description: "There was an error submitting your request. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-[1200px] mx-auto bg-white min-h-screen">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Need a Precision-Built Prospect List?</h1>
            <p className="text-indigo-600 font-medium mt-1">Can't find what you're looking for? We'll build a custom list for you.</p>
          </div>
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm rounded-lg h-10 px-5">
            Back to Search
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Top Form Fields */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">Target Lead Volume <span className="text-indigo-600">*</span></label>
            <Input placeholder="0" value={targetVolume} onChange={e => setTargetVolume(e.target.value)} className="h-11 bg-white border-slate-200 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Request Category</label>
            <Select value={requestCategory} onValueChange={setRequestCategory}>
              <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="enrichment">Enrichment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Audience Criteria</label>
            <Select value={audienceCriteria} onValueChange={setAudienceCriteria}>
              <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm text-slate-500">
                <SelectValue placeholder="Select Criteria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icp">Ideal Customer Profile</SelectItem>
                <SelectItem value="custom">Custom Parameters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Search Criteria */}
        <div className="border border-slate-100 rounded-2xl p-8 bg-slate-50/50 flex flex-col items-center justify-center min-h-[200px]">
          <div className="flex w-full items-center gap-2 mb-6">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Current Search Criteria</span>
          </div>
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-500 max-w-md mx-auto">No filters selected. Add filters to help our team fulfill your custom data request.</p>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-semibold gap-2 rounded-xl">
              <Filter className="h-4 w-4" /> Click here to add filters
            </Button>
          </div>
        </div>

        {/* License & Attributes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Standard License */}
          <div className="border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Database className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Standard License</h3>
                <p className="text-sm text-slate-400 font-medium">Credit Policy</p>
              </div>
            </div>

            <div className="flex border-b border-slate-100 mb-6">
              <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-bold text-sm">Basic</button>
              <button className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-bold text-sm">Medium</button>
              <button className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-bold text-sm">Extended</button>
              <button className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-bold text-sm">Premium</button>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-indigo-600">1</span>
              <span className="text-sm font-bold text-slate-700">Credit <span className="text-slate-400 font-medium">/ Record</span></span>
            </div>
            <p className="text-xs text-slate-400">1 Credit per record with standard business data</p>
          </div>

          {/* Included Data Attributes */}
          <div className="border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-slate-400" />
                <h3 className="font-bold text-slate-900">Included Data Attributes</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Total Credits: 0 Credits</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">15 Fields</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {["Full Name", "Job Title", "Job Level", "Job Function", "Current Job Function", "Contact Email", "Contact Phone"].map((attr) => (
                <span key={attr} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-full shadow-sm">
                  {attr}
                </span>
              ))}
              <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold rounded-full shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors">
                +8 more
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2 border border-slate-100">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Need additional columns? Use <span className="font-bold text-slate-700">Additional Notes</span> to let the team know.
              </p>
            </div>
          </div>
        </div>

        {/* Upload & Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Upload Suppression/Criteria File</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group text-center min-h-[220px]">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm mb-4 group-hover:-translate-y-1 transition-transform">
                <UploadCloud className="h-5 w-5 text-slate-400" />
              </div>
              <p className="font-bold text-slate-700 mb-1">Click or drag files to this area to upload</p>
              <p className="text-xs text-slate-400">PDF, Word, CSV, Excel (Max 4 files, 25MB each)</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Contact Details</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">Order Name <span className="text-indigo-600">*</span></label>
              <Input placeholder="e.g. Q1 prospect segment" value={orderName} onChange={e => setOrderName(e.target.value)} className="h-11 bg-white border-slate-200 shadow-sm" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">Delivery Email <span className="text-indigo-600">*</span></label>
                <span className="text-[10px] font-bold text-indigo-600">0/5 Allowed</span>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Enter email address" value={deliveryEmail} onChange={e => setDeliveryEmail(e.target.value)} className="h-11 bg-white border-slate-200 shadow-sm flex-1" />
                <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm px-6">Add +</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Additional Notes</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow bg-white">
            <div className="bg-slate-50 border-b border-slate-200 px-2 py-2 flex items-center gap-1 flex-wrap">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><Bold className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><Italic className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><Underline className="h-4 w-4" /></Button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><List className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><ListOrdered className="h-4 w-4" /></Button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><Heading1 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><Heading2 className="h-4 w-4" /></Button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><AlignLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><AlignCenter className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><AlignRight className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-md"><AlignJustify className="h-4 w-4" /></Button>
            </div>
            <Textarea 
              placeholder="Enter specific instructions, detailed criteria, or notes for our data team..." 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[160px] border-0 focus-visible:ring-0 resize-none text-sm p-4 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-6">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 h-12 px-8 font-bold text-base rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : 'Submit Custom Order'}
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CustomData;
