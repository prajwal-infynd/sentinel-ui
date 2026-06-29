import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  totalRecords?: string;
}

export const DataPreviewModal = ({ isOpen, onClose, fileName, totalRecords = "15,420" }: DataPreviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="max-w-4xl bg-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Eye className="h-5 w-5 text-indigo-500" />
            Data Preview: {fileName}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-100/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">TransactionID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">RiskScore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-mono text-xs">
              {[1, 2, 3, 4, 5].map((num) => (
                <tr key={num} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">Sample TransactionID Data {num}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Sample Amount Data {num}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Sample RiskScore Data {num}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center text-xs font-medium text-slate-500">
            Showing 5 of {totalRecords} records
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold shadow-md shadow-blue-500/20">
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
