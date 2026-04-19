"use client";

import React from "react";
import { 
  Sparkles, 
  Target, 
  Zap, 
  Beaker, 
  FlaskConical, 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  TrendingDown,
  Activity,
  CheckCircle2
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AIConsultingReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any; // Inquiry data
}

export function AIConsultingReport({ open, onOpenChange, data }: AIConsultingReportProps) {
  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl overflow-y-auto w-full p-0 border-none bg-slate-50 dark:bg-zinc-950">
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 text-white relative overflow-hidden">
          <Sparkles className="absolute -top-4 -right-4 h-32 w-32 text-white/10 rotate-12" />
          
          <SheetHeader className="relative z-10">
            <Badge className="w-fit bg-indigo-500/30 text-indigo-100 border-indigo-400/30 backdrop-blur-md mb-2">
              AI Smart Consulting Report
            </Badge>
            <SheetTitle className="text-3xl font-extrabold text-white leading-tight">
              {data.brand} <br />
              <span className="text-indigo-300">{data.product}</span> 분석 결과
            </SheetTitle>
            <SheetDescription className="text-indigo-100/70 pt-2">
              {data.id} • AI 엔진 v2.5 기반 실시간 제형 매칭 분석
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-8 pb-12">
          {/* Match Score */}
          <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <Target className="h-5 w-5 text-indigo-500" /> 시장 컨셉 적합도
              </div>
              <span className="text-3xl font-black text-indigo-600">94<span className="text-sm">점</span></span>
            </div>
            <Progress value={94} className="h-2 bg-slate-100" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              본 제형은 현재 2030 여성들의 "클린 뷰티" 및 "배리어 리페어" 키워드 검색 트렌드와 94% 일치합니다.
            </p>
          </section>

          {/* Formulation Base */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Beaker className="h-4 w-4" /> Recommended Formulation Base
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: "병풀추출물 (Centella Asiatica)", ratio: 45, desc: "진정 및 재생 핵심 원료" },
                { name: "판테놀 (Vitamin B5)", ratio: 5, desc: "장벽 강화 및 보습" },
                { name: "세라마이드 NP", ratio: 1.2, desc: "고함량 캡슐화 배합 추천" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                  </div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">{item.ratio}%</div>
                </div>
              ))}
            </div>
          </section>

          {/* Price Analysis */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-3xl p-6 border border-amber-100 dark:border-amber-900/50 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <TrendingDown className="h-4 w-4" /> 원가 최적화 제안
            </h3>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold">₩{data.price || "8,500"}</div>
              <div className="text-xs text-amber-600 font-medium mb-1 flex items-center">
                <TrendingDown className="h-3 w-3 mr-0.5" /> 12% 절감 가능
              </div>
            </div>
            <p className="text-xs text-amber-800/70 dark:text-amber-300/60 leading-relaxed">
              용기를 에어리스 펌프에서 일반 펌프로 변경하고 단상자 코팅을 무광 코팅으로 대체 시 개당 약 ₩1,020의 원가 절감이 예측됩니다.
            </p>
          </section>

          {/* AI Insights Tags */}
          <div className="flex flex-wrap gap-2">
            {["High Potency", "EWG Green", "Vegan Friendly", "Micro-formulation"].map(tag => (
              <Badge key={tag} variant="secondary" className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 text-[10px] font-bold">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="pt-6">
            <Button className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl">
              제조사에 AI 리포트 전달하기 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
