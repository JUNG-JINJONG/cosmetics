"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  FileText,
  Package,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardData {
  projects: Record<string, number>;
  pending_quotations?: number; // Buyer only
  new_leads?: number;          // Manufacturer only
  financials: {
    paid?: number;      // Buyer
    pending?: number;   // Buyer/Manufacturer
    received?: number;  // Manufacturer
    expected?: number;  // Manufacturer
    currency: string;
  };
  recent_projects: Array<{
    project_id: number;
    brand_name: string;
    status_code: string;
    progress: number;
    updated_at: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("Client");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        // 사용자 정보에서 Role 먼저 파악 (간소화를 위해 임시 처리, 실제로는 Auth Context 활용 권장)
        const userRes = await fetch(`${API_BASE_URL}/api/v1/account/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const userData = await userRes.json();
        setUserRole(userData.role);

        const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/summary`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="p-8 h-screen flex items-center justify-center bg-slate-50/30">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">비즈니스 리포트를 생성하는 중입니다...</p>
      </div>
    </div>
  );

  const isManufacturer = userRole === "Manufacturer";

  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
      {/* 1. Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 border-b-4 border-blue-600 inline-block mb-2">
            {isManufacturer ? "Manufacturer Portal Dashboard" : "Buyer Portal Dashboard"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isManufacturer ? "실시간 수주 현황 및 생산 지표 리포트입니다." : "실시간 제품 개발 현황 및 정산 데이터 요약입니다."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-slate-900 text-white font-bold h-11 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-slate-200">
            <TrendingUp className="mr-2 h-4 w-4 text-emerald-400" /> 커스텀 분석 요청
          </Button>
          <Button variant="outline" className="h-11 px-6 rounded-xl font-bold bg-white shadow-sm border-slate-200">
            상세 리포트 출력
          </Button>
        </div>
      </div>

      {/* 2. Key KPI Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isManufacturer ? (
          <>
            <KPIItem 
              title="운영 중인 프로젝트" 
              value={`${Object.values(data?.projects || {}).reduce((a, b) => a + b, 0)}건`} 
              desc="현재 공정 가동 중" 
              icon={Briefcase} 
              color="blue"
            />
            <KPIItem 
              title="신규 수주 기회" 
              value={`${data?.new_leads || 0}건`} 
              desc="확인 대기 중인 의뢰" 
              icon={FileText} 
              color="amber"
              highlight={data && (data.new_leads || 0) > 0}
            />
            <KPIItem 
              title="확정 매출 (Receive)" 
              value={`${data?.financials.currency} ${(data?.financials.received || 0).toLocaleString()}`} 
              desc="정산 완료 수익" 
              icon={Wallet} 
              color="emerald"
            />
            <KPIItem 
              title="입금 예정액" 
              value={`${data?.financials.currency} ${(data?.financials.expected || 0).toLocaleString()}`} 
              desc="정산 대기 중" 
              icon={BarChart3} 
              color="rose"
            />
          </>
        ) : (
          <>
            <KPIItem 
              title="진행 중인 프로젝트" 
              value={`${Object.values(data?.projects || {}).reduce((a, b) => a + b, 0)}건`} 
              desc="활성 워크플로우" 
              icon={Briefcase} 
              color="blue"
            />
            <KPIItem 
              title="승인 대기 견적" 
              value={`${data?.pending_quotations || 0}건`} 
              desc="빠른 검토 필요" 
              icon={FileText} 
              color="amber"
              highlight={data && (data.pending_quotations || 0) > 0}
            />
            <KPIItem 
              title="누적 지불액" 
              value={`${data?.financials.currency} ${(data?.financials.paid || 0).toLocaleString()}`} 
              desc="정산 완료 매출" 
              icon={Wallet} 
              color="emerald"
            />
            <KPIItem 
              title="미정산 금액" 
              value={`${data?.financials.currency} ${(data?.financials.pending || 0).toLocaleString()}`} 
              desc="결제 예정" 
              icon={BarChart3} 
              color="rose"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Recent Projects Timeline */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-white">
          <CardHeader className="border-b pb-6 px-8 bg-white/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black">
                  {isManufacturer ? "공정 가동 및 수주 현황" : "제품 개발 마일스톤"}
                </CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">최근 업데이트된 5개 프로젝트</CardDescription>
              </div>
              <Button variant="ghost" className="text-blue-600 font-black text-xs h-8 px-3 hover:bg-blue-50">전체보기 <ChevronRight className="ml-1 h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {data?.recent_projects?.map((p) => (
                <div key={p.project_id} className="p-6 px-8 flex items-center gap-6 hover:bg-slate-50/80 transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-lg shadow-slate-200">
                    {p.project_id}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                       <h3 className="font-black text-sm text-slate-900">{p.brand_name}</h3>
                       <Badge variant="secondary" className="text-[10px] font-black h-5 bg-blue-50 text-blue-600 border-none px-2 rounded-lg">{p.status_code}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={p.progress} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-black text-slate-500 w-8">{p.progress}%</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Last Update</p>
                    <p className="text-xs font-black text-slate-700">{new Date(p.updated_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors ml-4" />
                </div>
              ))}
              {(!data?.recent_projects || data.recent_projects.length === 0) && (
                <div className="p-20 text-center text-slate-400 font-medium bg-slate-50/30 m-6 rounded-3xl border-2 border-dashed border-slate-200">
                  표시할 데이터가 아직 없습니다. <br/> {isManufacturer ? "신규 수주를 기다리고 있습니다." : "새로운 제품 개발을 시작해 보세요."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Extra Sidebar Info */}
        <div className="space-y-8">
           {/* AI Briefing Card */}
           <Card className="border-none shadow-2xl rounded-3xl bg-blue-600 text-white overflow-hidden relative group">
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Activity className="h-48 w-48" />
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                   <div className="p-1.5 bg-white/20 rounded-lg"><Activity className="h-4 w-4 text-white" /></div> 
                   COCO AI BRIEFING
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm font-medium leading-relaxed text-blue-50/90">
                  {isManufacturer ? (
                    `현재 **${data?.new_leads || 0}건의 새로운 의뢰**가 도착했습니다. 공정 가동률을 고려하여 빠른 견적 회신이 필요합니다. 예상 정산 금액은 총 $ ${data?.financials.expected?.toLocaleString()} 입니다.`
                  ) : (
                    `이번 주에는 **${data?.pending_quotations || 0}건의 미확인 견적**이 있습니다. 미정산액 규모는 $ ${data?.financials.pending?.toLocaleString()} 로 파악됩니다.`
                  )}
                </p>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-black text-xs rounded-2xl shadow-xl border-none h-12 transition-all active:scale-95">
                  AI 비즈니스 인사이트 레포트
                </Button>
              </CardContent>
           </Card>

           {/* Quick Actions (Buyer/Manufacturer shared with slight labels change) */}
           <Card className="border-none shadow-xl rounded-3xl bg-white border border-slate-100">
              <CardHeader>
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pb-8">
                <QuickActionButton icon={Package} label={isManufacturer ? "수주 관리" : "신규 의뢰"} />
                <QuickActionButton icon={Clock} label={isManufacturer ? "공정 기록" : "개발 기록"} />
                <QuickActionButton icon={CheckCircle2} label={isManufacturer ? "품질 검수" : "승인 관리"} />
                <QuickActionButton icon={FileText} label="정산 관리" />
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}


function KPIItem({ title, value, desc, icon: Icon, color, highlight = false }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <Card className={cn(
      "border-none shadow-lg rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl",
      highlight && "ring-2 ring-amber-400 ring-offset-2 scale-[1.02]"
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-2xl border", colorMap[color])}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
             LIVE DATA
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
          <p className="text-[10px] font-bold text-slate-500 italic flex items-center gap-1 opacity-70">
             {desc} <ArrowUpRight className="h-2.5 w-2.5" />
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon: Icon, label }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all gap-2 group border border-transparent hover:border-blue-100">
      <Icon className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
      <span className="text-[11px] font-black">{label}</span>
    </button>
  );
}


