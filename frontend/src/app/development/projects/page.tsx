"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  FlaskConical,
  Building2,
  Calendar,
  Lock,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-config";

const statusStyles: Record<string, string> = {
  "1300000011": "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800", // 제조사 수락
  "1300000012": "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800", // 제안서 제출
  "1300000004": "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800", // 샘플 테스트
  "1300000005": "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800", // 견적 및 계약
  "1300000007": "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800", // 생산 중
  "1300000008": "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800", // 품질 관리
  "1300000009": "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800", // 출고/배송
  "1300000010": "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800", // 완료
  "Canceled": "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
};

const statusLabels: Record<string, string> = {
  "1300000001": "기획 및 의뢰",
  "1300000011": "제안서 작성 대기",
  "1300000012": "제안서 검토 중",
  "1300000004": "샘플 테스트",
  "1300000005": "견적 및 계약",
  "1300000007": "생산 중",
  "1300000008": "품질 관리",
  "1300000009": "출고 및 배송",
  "1300000010": "완료",
  "Canceled": "취소됨",
};

export default function DevelopmentProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      setLoading(true);
      const [inqRes, projRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/workflow/inquiries`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/v1/workflow/projects`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (!inqRes.ok || !projRes.ok) throw new Error("API response error");

      const inqData = await inqRes.ok ? await inqRes.json() : [];
      const projData = await projRes.ok ? await projRes.json() : [];

      // 제조사가 배정된 프로젝트만 필터링 (신청한 건들)
      const combined = projData.map((proj: any) => {
        const inq = inqData.find((i: any) => i.inquiry_id === proj.inquiry_id);
        if (!inq) return null;
        
        return {
          id: `PROJ-${String(proj.project_id).padStart(4, "0")}`,
          realId: proj.project_id,
          inquiryId: inq.inquiry_id,
          displayInquiryId: `INQ-2026-${String(inq.inquiry_id).padStart(3, "0")}`,
          brand: inq.brand_name,
          product: inq.item_type || "N/A",
          title: `[${inq.brand_name}] ${inq.item_type || "N/A"}`,
          status: proj.status_code || "Pending",
          progress: proj.current_phase_percent || 0,
          date: inq.created_at.split("T")[0],
          targetDate: proj.expected_completion_at ? proj.expected_completion_at.split("T")[0] : "TBD"
        };
      }).filter(Boolean);

      setProjects(combined);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = projects.filter(item => 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Activity className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Project Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            개발 진행 현황
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            수락된 프로젝트의 제조 공정 및 R&D 진행 상태를 실시간으로 관리하고 업데이트합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 border-slate-200" onClick={() => fetchData()}>
            새로고침
          </Button>
          <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]">
            <TrendingUp className="mr-2 h-4 w-4" /> 통합 보고서 보기
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "총 프로젝트", value: projects.length, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "실행 중", value: projects.filter(p => p.status === "Processing").length, icon: Activity, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "QC 대기", value: "0", icon: FlaskConical, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "이번달 완료", value: projects.filter(p => p.status === "Completed").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md bg-white dark:bg-zinc-900/50">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Area */}
      <Card className="border-none shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-50 dark:border-zinc-800 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">프로젝트 리스트</CardTitle>
            <CardDescription>진행 중인 모든 개발 건의 상세 상태입니다.</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="브랜드, 제품명 검색..."
                className="h-10 w-64 pl-10 bg-slate-50 dark:bg-zinc-950/50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
              <TableRow className="hover:bg-transparent border-none h-14">
                <TableHead className="w-[150px] pl-6 font-bold text-xs uppercase text-muted-foreground">프로젝트 ID</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground">제품 정보</TableHead>
                <TableHead className="w-[200px] font-bold text-xs uppercase text-muted-foreground">현재 진행률</TableHead>
                <TableHead className="w-[140px] font-bold text-xs uppercase text-muted-foreground text-center">상태</TableHead>
                <TableHead className="w-[140px] font-bold text-xs uppercase text-muted-foreground text-center">완료 예정일</TableHead>
                <TableHead className="w-[120px] pr-6 text-right font-bold text-xs uppercase text-muted-foreground">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">데이터를 분석 중입니다...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 py-12">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                        <Activity className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="font-bold text-lg">진행 중인 프로젝트가 없습니다.</p>
                      <p className="text-sm text-muted-foreground">마켓플레이스에서 새로운 의뢰를 신청해 보세요.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors border-b border-slate-50 dark:border-zinc-800 h-20">
                    <TableCell className="pl-6 font-mono text-[11px] font-bold text-slate-500">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{item.product}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Building2 className="h-3 w-3" /> {item.brand}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold">{item.progress}%</span>
                          <span className="text-muted-foreground">Phase 3/5</span>
                        </div>
                        <Progress value={item.progress} className="h-1.5 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${statusStyles[item.status]} font-bold px-3 py-1 border-none shadow-none`}>
                        {statusLabels[item.status] || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-bold">{item.targetDate}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">D-14</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "font-bold group",
                          item.status === "1300000011" ? "text-amber-600 hover:bg-amber-50" : "text-primary hover:bg-primary/5"
                        )}
                        onClick={() => {
                          if (item.status === "1300000011") {
                            router.push(`/development/inquiries/${item.displayInquiryId}/proposal`);
                          } else {
                            router.push(`/development/inquiries/${item.displayInquiryId}`);
                          }
                        }}
                      >
                        {item.status === "1300000011" ? "제안서 작성" : "상세보기"} 
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Footer */}
      <div className="flex justify-center pt-8">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-slate-50 dark:bg-zinc-900/50 px-4 py-2 rounded-full border">
          <Lock className="h-3 w-3" /> 모든 개발 공정 데이터는 256-bit 엔드 투 엔드 암호화로 보호됩니다.
        </div>
      </div>
    </div>
  );
}
