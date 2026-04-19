"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Settings, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Box,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductionTabProps {
  projectId: number;
  isBuyer: boolean;
}

export const ProductionTab = ({ projectId, isBuyer }: ProductionTabProps) => {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [projectId]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/progress/detail?project_id=${projectId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setProgress(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (field: string, code: string) => {
    if (isBuyer) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/progress/update?progress_id=${progress.progress_id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ [field]: code })
      });
      if (res.ok) fetchProgress();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">생산 데이터 로드 중...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Milestone Timeline */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-zinc-800 -translate-y-1/2 z-0" />
        <div className="flex justify-between relative z-10 px-4">
          {[
            { label: "자재 준비", code: "2200000001", active: true },
            { label: "생산 공정", code: "2200000002", active: progress?.production_status_code >= "2200000002" },
            { label: "품질 검사", code: "2200000003", active: progress?.production_status_code >= "2200000003" },
            { label: "출고 완료", code: "2200000004", active: progress?.production_status_code === "2200000004" },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-3 bg-white dark:bg-zinc-950 px-4">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                step.active ? "bg-primary border-primary/20 text-white" : "bg-white border-slate-100 text-slate-300"
              )}>
                {step.active ? <CheckCircle2 className="h-5 w-5" /> : <span>{i+1}</span>}
              </div>
              <span className={cn("text-xs font-bold", step.active ? "text-primary" : "text-slate-400")}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm border-2 border-emerald-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                  <Box className="h-4 w-4" /> 원료 수급 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black">{getStatusName(progress?.raw_material_status_code)}</span>
                  {!isBuyer && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus("raw_material_status_code", "2000000004")} className="text-emerald-700 hover:bg-emerald-100">입고완료 처리</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-blue-50/30 dark:bg-blue-950/10 shadow-sm border-2 border-blue-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 부자재(용기/라벨) 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black">{getStatusName(progress?.packaging_status_code)}</span>
                  {!isBuyer && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus("packaging_status_code", "2100000004")} className="text-blue-700 hover:bg-blue-100">입고완료 처리</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            {/* 
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> 생산 실행 계획
              </CardTitle>
              <CardDescription>공장 가동 및 품질 검사 일정입니다. (제조사 수시 업데이트)</CardDescription>
            </CardHeader>
            */}
            <CardContent className="p-8">
              {/* 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-orange-100 text-orange-600"><Calendar className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">생산 착수 예정일</p>
                      <p className="text-xl font-black mt-1">{progress?.planned_start_date ? new Date(progress.planned_start_date).toLocaleDateString() : '미정 (자재 준비 중)'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Clock className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">최종 납기 예정일</p>
                      <p className="text-xl font-black mt-1 text-primary">{progress?.planned_end_date ? new Date(progress.planned_end_date).toLocaleDateString() : '협의 중'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl border border-dashed">
                  <h6 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" /> 제조사 코멘트
                  </h6>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{progress?.remarks || "현재 생산을 위한 원부자재 수급이 차질 없이 진행 중입니다. 입고 완료 시 즉시 생산 공정에 착수하겠습니다."}"
                  </p>
                </div>
              </div>
              */}

              {!isBuyer && (
                <div className="flex justify-end gap-3">
                  {/* <Button variant="outline" className="rounded-xl">일정 수정</Button> */}
                  <Button onClick={() => updateStatus("production_status_code", "2200000002")} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20 h-12">
                    생산 시작 (공정 착수)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Truck className="h-5 w-5" /> 바이어 필독 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-900 leading-relaxed space-y-3">
              <p>• 자재가 모두 입고된 후 실제 생산은 보통 5~7영업일이 소요됩니다.</p>
              <p>• 생산 종료 후 진행되는 품질 검사(QC) 기간은 약 3일입니다.</p>
              <p>• 최종 출고 전 정산 절차가 완료되어야 배송이 시작됩니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const getStatusName = (code: string) => {
  const names: Record<string, string> = {
    "2000000001": "발주 전", "2000000002": "발주 완료", "2000000003": "입고 중", "2000000004": "입고 완료",
    "2100000001": "발주 전", "2100000002": "발주 완료", "2100000003": "입고 중", "2100000004": "입고 완료",
    "2200000001": "준비 중", "2200000002": "생산 중", "2200000003": "검수 중", "2200000004": "출고 완료",
  };
  return names[code] || "관리 대기";
};
