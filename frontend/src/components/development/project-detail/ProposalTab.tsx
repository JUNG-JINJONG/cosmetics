"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Beaker, Sparkles, CheckCircle2, FileText } from "lucide-react";

interface ProposalTabProps {
  quotation: any;
  inquiry: any;
  isBuyer: boolean;
  isPendingApproval: boolean;
}

export const ProposalTab = ({ quotation, inquiry, isBuyer, isPendingApproval }: ProposalTabProps) => {
  if (!quotation) return null;

  const handleApprove = async () => {
    if (!confirm("제조사의 제안을 최종 승인하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/projects/confirm?project_id=${inquiry.project.project_id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("제안이 최종 승인되었습니다! 계약 및 개발 단계로 진입합니다.");
        window.location.reload();
      } else {
        const err = await res.json();
        alert(`승인 실패: ${err.detail || "알 수 없는 오류"}`);
      }
    } catch (e) {
      console.error(e);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">제조사 처방 및 제형 제안</CardTitle>
                </div>
                <Badge variant="outline" className="bg-white">
                  제출일: {new Date(quotation.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" /> 핵심 컨셉 제안
                </h4>
                <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {quotation.comments}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-emerald-50/50 border-emerald-100 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-emerald-700">제안 공급 단가</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-emerald-700">
                      ₩{quotation.items?.[0]?.unit_price?.toLocaleString()} / EA
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50/50 border-blue-100 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-700">최소 주문 수량 (MOQ)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-blue-700">
                      {quotation.items?.[0]?.quantity?.toLocaleString()} EA
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="max-w-full md:max-w-[60%]">
                  <p className="text-sm font-bold">이 제안이 마음에 드시나요?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPendingApproval 
                      ? "승인이 완료되면 즉시 공식 계약 절차 및 제형 개발 공정이 시작됩니다."
                      : "이미 승인이 완료되었거나 다음 단계로 진행 중인 제안서입니다."}
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  {isBuyer && isPendingApproval && (
                    <>
                      <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-12 px-6">보완 요청</Button>
                      <Button 
                        className="flex-1 md:flex-none rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                        onClick={handleApprove}
                      >
                        제안 최종 승인하기
                      </Button>
                    </>
                  )}
                  {!isPendingApproval && (
                    <Button variant="outline" disabled className="flex-1 md:flex-none rounded-xl h-12 px-6 bg-slate-50">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> 승인 완료된 제안
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle2 className="h-20 w-20" />
            </div>
            <CardHeader>
              <CardTitle className="text-white">견적 총합계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-4xl font-black text-amber-400">
                  ₩{quotation.total_estimated_amount?.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400">VAT 별도 / 물류비 포함</p>
              </div>
              
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-sm">EWG 그린 등급 원료 지향</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-sm">특허 성분 3종 포함</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
