import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  FolderStar, ChevronDown, Upload, Trash2, Search, Info, CloudUpload, ChevronLeft, ChevronRight, List
} from "lucide-react";

interface DocumentVerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentVerificationDrawer: React.FC<DocumentVerificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const renderSidebar = () => (
    <div className="w-80 border-r bg-slate-50/50 p-6 flex flex-col h-full overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-slate-100 rounded-md">
            <FolderStar className="w-5 h-5 text-slate-700" />
          </div>
          <span className="font-bold text-slate-700">Total Files:</span>
        </div>
        <div className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm">
          0
        </div>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div className="bg-emerald-500 h-full w-[5%]"></div>
      </div>

      <div className="space-y-3">
        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
          <span className="font-bold text-slate-700">File Options</span>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full border border-slate-300">
              <Upload className="w-3 h-3 text-slate-600" />
            </div>
            <span className="font-bold text-slate-700">Upload Files</span>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-slate-600" />
            <span className="font-bold text-slate-700">Recycle Bin</span>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[95vw] sm:max-w-[1200px] p-0 flex flex-row gap-0 bg-[#F8FAFC] border-l border-slate-200"
      >
        {renderSidebar()}
        
        <ScrollArea className="flex-1 h-full bg-white">
          <div className="p-8 h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <List className="w-6 h-6 text-slate-500" />
                <h2 className="text-xl font-medium text-slate-700">View Files</h2>
              </div>
              <div className="p-2 bg-slate-50 rounded-full cursor-pointer hover:bg-slate-100">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="bg-[#F3F9EE] border border-[#E2EED9] rounded-xl p-4 flex gap-3 mb-8">
              <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                Available files are as per permission level. Confidential files are restricted from this view.
              </p>
            </div>

            <div className="bg-[#F3F9EE] rounded-3xl border border-[#E2EED9] overflow-hidden flex flex-col items-center justify-center py-20 px-4 mt-8">
              <CloudUpload className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-xl text-slate-700 mb-2">No files found!</h3>
              <p className="text-slate-400 text-sm mb-8">currently have no files or folders...</p>
              
              <Button className="w-full max-w-2xl bg-[#71A54F] hover:bg-[#5E8C41] text-white py-6 rounded-2xl text-lg shadow-sm">
                Upload new files
              </Button>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6 flex justify-between items-center text-slate-500 font-medium">
              <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                <ChevronLeft className="w-5 h-5" />
                First
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                Last
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
