"use client";

import React from "react";
import { Sparkles, Zap, Beaker, CheckCircle2, FlaskConical, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AITab = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 h-24 w-24 text-indigo-200/40 dark:text-indigo-800/20 -rotate-12" />
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold">
            <Zap className="h-3 w-3" /> AI 추천 배합
          </div>
          <h3 className="text-2xl font-bold">인퓨전 진정 세럼 V1.2</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <Beaker className="h-4 w-4 text-indigo-600" /> 기대 효능
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 홍조 완화 및 장벽 강화
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 논코메도제닉 테스트 적합
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> EWG 그린 등급 원료 95%
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-indigo-600" /> 핵심 원료 배합 (Top 3)
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/60 dark:bg-zinc-900/40 p-3 rounded-lg border border-indigo-100/50">
                  <span className="font-medium">병풀추출물 (Cica)</span>
                  <span className="text-indigo-600 font-bold">35.0%</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 dark:bg-zinc-900/40 p-3 rounded-lg border border-indigo-100/50">
                  <span className="font-medium">판테놀 (B5)</span>
                  <span className="text-indigo-600 font-bold">5.0%</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 dark:bg-zinc-900/40 p-3 rounded-lg border border-indigo-100/50">
                  <span className="font-medium">세라마이드 NP</span>
                  <span className="text-indigo-600 font-bold">1.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6">
              제안서 상세 보기 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-xl border-indigo-200 bg-white/50">
              제조사에 메신저 문의
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
