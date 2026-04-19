"use client";

import React, { useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, X, CheckSquare, Award } from "lucide-react";

interface CoAModalProps {
  isOpen: boolean;
  onClose: () => void;
  coaData: any;
  projectInfo: any;
}

export const CoAModal = ({ isOpen, onClose, coaData, projectInfo }: CoAModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!coaData) return null;

  const handlePrint = () => {
    window.print();
  };

  const snapshot = coaData.snapshot;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-100/50 backdrop-blur-md">
        <DialogHeader className="p-6 bg-white border-b sticky top-0 z-10 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Certificate of Analysis 미리보기
            </DialogTitle>
            <DialogDescription>
              발행번호: {coaData.coa_no} | 발행일: {new Date(coaData.issued_at).toLocaleDateString()}
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 font-bold">
              <Printer className="h-4 w-4 mr-2" /> PDF 저장 / 인쇄
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>

        <div className="p-8 flex justify-center">
          {/* CoA Paper Sheet */}
          <div 
            ref={printRef}
            className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] text-slate-900 font-serif relative overflow-hidden print:shadow-none print:w-full print:p-0"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: "'Inter', 'Noto Sans KR', serif"
            }}
          >
            {/* Simple Watermark Logo Placeholder */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none select-none">
              <h1 className="text-[200px] font-black italic tracking-tighter">COSMAX</h1>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-slate-950 pb-6 mb-8">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-950 mb-1">CERTIFICATE OF ANALYSIS</h1>
                <p className="text-xs text-slate-500 font-sans tracking-[0.2em]">QUALITY ASSURANCE REPORT</p>
              </div>
              <div className="text-right">
                <div className="h-12 w-32 bg-slate-950 flex items-center justify-center text-white font-sans text-xs font-bold mb-1">COSMAX LOGO</div>
                <p className="text-[10px] text-slate-400 font-sans">www.cosmax.com</p>
              </div>
            </div>

            {/* Project Info Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-sm border-b pb-8">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-400 text-xs uppercase">Product Name</span>
                  <span className="font-bold text-slate-900">{projectInfo?.brand_name} - {projectInfo?.item_type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-400 text-xs uppercase">Lot Number</span>
                  <span className="font-bold text-slate-900 font-mono">L240413-A01</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-400 text-xs uppercase">Manufacturing Date</span>
                  <span className="font-bold text-slate-900 font-mono">2024. 04. 13</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-400 text-xs uppercase">Certificate No.</span>
                  <span className="font-bold text-primary font-mono">{coaData.coa_no}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-400 text-xs uppercase">Expiry Date</span>
                  <span className="font-bold text-slate-900 font-mono">2027. 04. 12</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-400 text-xs uppercase">Quantity</span>
                  <span className="font-bold text-slate-900">5,000 EA</span>
                </div>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="mb-10">
              <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                <div className="h-1 w-4 bg-primary"></div> TEST RESULTS
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y-2 border-slate-950">
                    <th className="py-3 px-4 text-left text-[11px] font-black uppercase text-slate-600">Test Parameter</th>
                    <th className="py-3 px-4 text-left text-[11px] font-black uppercase text-slate-600">Specifications</th>
                    <th className="py-3 px-4 text-left text-[11px] font-black uppercase text-slate-600">Results</th>
                    <th className="py-3 px-4 text-center text-[11px] font-black uppercase text-slate-600">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {snapshot?.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="text-xs">
                      <td className="py-4 px-4 font-bold text-slate-800">
                        {item.parameter === "2300000001" ? "pH" : 
                         item.parameter === "2300000002" ? "Viscosity" :
                         item.parameter === "2300000003" ? "Specific Gravity" :
                         item.parameter === "2300000004" ? "Appearance" :
                         item.parameter === "2300000005" ? "Odor" :
                         item.parameter === "2300000006" ? "Microbiological" : item.parameter}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-light italic">{item.spec}</td>
                      <td className="py-4 px-4 font-black text-slate-900">{item.result}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-600 tracking-tighter border border-emerald-200 px-2 py-0.5 rounded italic">PASSED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conclusion Section */}
            <div className="bg-slate-50 p-6 border-l-4 border-slate-950 mb-12">
              <h4 className="text-xs font-black mb-2 uppercase tracking-widest text-slate-400">General Conclusion</h4>
              <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                Based on the above test results, this batch complies with the quality requirements and is hereby approved for final release.
              </p>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between items-end mt-20 pr-10">
              <div className="text-xs space-y-1">
                <p className="text-slate-400 uppercase font-bold tracking-widest">Authorized By</p>
                <p className="text-lg font-black italic border-b-2 border-slate-100 pb-1 pr-12 text-slate-900">{snapshot?.inspector}</p>
                <p className="text-slate-500">Chief Quality Officer (CQO)</p>
              </div>
              <div className="relative">
                {/* Visual Seal Placeholder */}
                <div className="h-24 w-24 border-2 border-rose-300 rounded-full flex items-center justify-center border-dashed opacity-60">
                  <div className="h-20 w-20 border-4 border-rose-400 rounded-full flex items-center justify-center text-rose-500 font-bold text-[10px] text-center p-2 rotate-[-15deg]">
                    QUALITY<br/>ASSURANCE<br/>CERTIFIED
                  </div>
                </div>
                <div className="absolute inset-0 bg-white/10 filter blur-[1px]"></div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-auto pt-10 text-[9px] text-slate-400 text-center border-t border-slate-50 italic">
              * This is a computer-generated document. No actual signature is required. *
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
