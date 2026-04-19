"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface OverviewTabProps {
  inquiry: any;
}

export const OverviewTab = ({ inquiry }: OverviewTabProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none bg-slate-50/50 dark:bg-zinc-800/30">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">발주 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>예상 MOQ</span>
              <span className="font-bold">{inquiry?.quantity?.toLocaleString()} EA</span>
            </div>
            <div className="flex justify-between">
              <span>목표 단가</span>
              <span className="font-bold text-blue-600">₩{inquiry?.target_price?.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none bg-slate-50/50 dark:bg-zinc-800/30">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">제품 스펙</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>용기 / 용량</span>
              <span className="font-bold">{inquiry?.container_type} / {inquiry?.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span>향 선호도</span>
              <span className="font-bold">{inquiry?.scent_pref}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">문진 상세 분석</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "민감성 진정", score: 85, color: "bg-emerald-500" },
              { label: "수분 보습", score: 92, color: "bg-blue-500" },
              { label: "텍스처 만족", score: 70, color: "bg-amber-500" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-bold">{item.score}%</span>
                </div>
                <Progress value={item.score} className="h-1.5" />
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-dashed text-sm text-muted-foreground">
            "20대 여성 타겟의 기능성 세럼으로, 자극 없는 진정 효과와 빠른 흡수력을 최우선 과제로 선정했습니다."
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
