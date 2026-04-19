"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface ProjectSidebarProps {
  inquiry: any;
}

export const ProjectSidebar = ({ inquiry }: ProjectSidebarProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-slate-100 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">담당 제조사</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <span className="font-bold text-orange-600">CX</span>
            </div>
            <div>
              <div className="font-bold">코스맥스 (COSMAX)</div>
              <div className="text-xs text-muted-foreground">R&D Lab 3팀 배정 예정</div>
            </div>
          </div>
          <Button variant="outline" className="w-full rounded-xl">업체 포트폴리오 보기</Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MessageSquare className="h-16 w-16" />
        </div>
        <CardHeader>
          <CardTitle className="text-white text-lg">AI 코파일럿 컨설팅</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            현재 타겟 단가 ₩{inquiry?.target_price?.toLocaleString()}은 시장 평균 대비 약 12% 높게 책정되어 있습니다. 용기 스펙을 펌프형에서 튜브형으로 변경하신다면 단가를 8% 절감할 수 있을 것으로 예상됩니다.
          </p>
          <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold">
            컨설팅 리포트 전체 보기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
