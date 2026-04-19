"use client";

import React, { useState } from "react";
import {
  FilePlus2,
  Search,
  Filter,
  ChevronRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  FlaskConical,
  Layers,
  Building2,
  Activity
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { InquiryWizard } from "@/components/workflow/InquiryWizard";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

// Mock Data
const mockInquiries = [
  {
    id: "INQ-2026-001",
    brand: "Glow Theory",
    product: "Cica Calming Serum",
    category: "Skincare",
    status: "Processing",
    progress: 65,
    date: "2026-04-10",
    manager: "김철수 연구원",
  },
  {
    id: "INQ-2026-002",
    brand: "Urban Muse",
    product: "Velvet Matte Lipstick",
    category: "Makeup",
    status: "Pending",
    progress: 10,
    date: "2026-04-09",
    manager: "이영희 선임",
  },
  {
    id: "INQ-2026-003",
    brand: "Skin Rhythm",
    product: "Barrier Repair Cream",
    category: "Skincare",
    status: "Completed",
    progress: 100,
    date: "2026-04-05",
    manager: "박지수 팀장",
  },
  {
    id: "INQ-2026-004",
    brand: "Pure Bloom",
    product: "AHA Brightening Toner",
    category: "Skincare",
    status: "Canceled",
    progress: 0,
    date: "2026-04-01",
    manager: "-",
  },
];

const statusStyles: Record<string, string> = {
  "1300000001": "bg-slate-50 text-slate-600 border-slate-100",  // 기획
  "1300000011": "bg-amber-50 text-amber-600 border-amber-100", // 수락
  "1300000012": "bg-blue-50 text-blue-600 border-blue-100",   // 제안제출
  "1300000004": "bg-pink-50 text-pink-600 border-pink-100",    // 샘플 테스트
  "1300000005": "bg-indigo-50 text-indigo-600 border-indigo-100", // 견적
  "1300000007": "bg-sky-50 text-sky-600 border-sky-100",       // 생산 중
  "1300000008": "bg-violet-50 text-violet-600 border-violet-100", // 품질 관리
  "1300000009": "bg-orange-50 text-orange-600 border-orange-100", // 출고/배송
  "1300000010": "bg-emerald-50 text-emerald-600 border-emerald-100", // 완료
  "Canceled": "bg-rose-50 text-rose-600 border-rose-100",
};

const statusLabels: Record<string, string> = {
  "1300000001": "기획 및 의뢰",
  "1300000011": "제조사 수락",
  "1300000012": "제안 검토 중",
  "1300000004": "샘플 테스트",
  "1300000005": "견적 협의",
  "1300000007": "생산 중",
  "1300000008": "품질 관리",
  "1300000009": "출고 및 배송",
  "1300000010": "완료",
  "Canceled": "취소됨",
};

import { AIConsultingReport } from "@/components/inquiry/AIConsultingReport";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [aiReportOpen, setAiReportOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const router = useRouter();

  const [userType, setUserType] = useState<string | null>(null);

  async function fetchData() {
    const token = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("user_type");
    setUserType(storedUserType);
    
    if (!token) {
      setLoading(false);
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

      const inqData = await inqRes.json();
      const projData = await projRes.json();

      const combined = inqData.map((inq: any) => {
        const proj = projData.find((p: any) => p.inquiry_id === inq.inquiry_id);
        return {
          id: `INQ-2026-${String(inq.inquiry_id).padStart(3, "0")}`,
          brand: inq.brand_name,
          product: inq.item_type || "N/A",
          category: inq.item_type || "General",
          status: proj?.status_code || "Pending",
          progress: proj?.current_phase_percent || 0,
          date: inq.created_at.split("T")[0],
          manager: "시스템 관리자"
        };
      });

      combined.sort((a: any, b: any) => b.id.localeCompare(a.id));
      setInquiries(combined);
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            개발 제안
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            브랜드사의 새로운 화장품 개발 의뢰를 관리하고 실시간 진행 상태를 모니터링합니다.
            AI 컨설팅 결과와 연동하여 최적의 제안을 구성할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 border-slate-200">
            <TrendingUp className="mr-2 h-4 w-4" /> 리포트 다운로드
          </Button>
          <Button 
            onClick={() => {
              if (userType === 'company_user') {
                router.push("/development/new-inquiries");
              } else {
                setWizardOpen(true);
              }
            }}
            className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FilePlus2 className="mr-2 h-4 w-4" /> {userType === 'company_user' ? '신규 의뢰 목록' : '신규 의뢰 작성'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "전체 의뢰", value: inquiries.length.toString(), icon: Layers, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "진행 중", value: inquiries.filter(i => i.status === "Processing").length.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "완료 프로젝트", value: inquiries.filter(i => i.status === "Completed").length.toString(), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "대기/보충 필요", value: inquiries.filter(i => i.status === "Pending").length.toString(), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
  <Card className="border-none shadow-xl shadow-slate-100 dark:shadow-none overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-slate-100/50 dark:bg-zinc-800/50 p-1">
                <TabsTrigger value="all" className="px-6">전체 목록</TabsTrigger>
                <TabsTrigger value="skincare" className="px-6">스킨케어</TabsTrigger>
                <TabsTrigger value="makeup" className="px-6">메이크업</TabsTrigger>
                <TabsTrigger value="completed" className="px-6">완료</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search brand or product..."
                    className="h-9 w-[240px] pl-9 bg-white/50 dark:bg-zinc-950/50 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border border-slate-100 dark:border-zinc-800">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[120px] font-semibold text-slate-700 dark:text-slate-300">의뢰번호</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">브랜드 / 제품명</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">카테고리</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">상태 / 진행률</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">등록일</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground animate-pulse">
                          데이터를 불러오는 중입니다...
                        </TableCell>
                      </TableRow>
                    ) : inquiries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                          등록된 의뢰 내역이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) :
                      inquiries.map((inq) => (
                        <TableRow 
                          key={inq.id} 
                          className="group hover:bg-slate-50/10 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                          onClick={() => router.push(`/development/inquiries/${inq.id}`)}
                        >
                        <TableCell className="font-mono text-xs text-muted-foreground font-medium">
                          {inq.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{inq.product}</span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Building2 className="mr-1 h-3 w-3" /> {inq.brand}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{inq.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <Badge variant="outline" className={cn("font-medium", statusStyles[inq.status])}>
                              {statusLabels[inq.status] || inq.status}
                            </Badge>
                            <div className="w-24 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-1000"
                                style={{ width: `${inq.progress}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {inq.date}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-800">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem 
                                className="flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/development/inquiries/${inq.id}`);
                                }}
                              >
                                <ArrowUpRight className="mr-2 h-4 w-4" /> 상세 보기
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInquiry(inq);
                                  setAiReportOpen(true);
                                }}
                              >
                                <FlaskConical className="mr-2 h-4 w-4" /> AI 스마트 컨설팅
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* AIConsultingReport Sidebar */}
      <AIConsultingReport 
        open={aiReportOpen} 
        onOpenChange={setAiReportOpen} 
        data={selectedInquiry} 
      />

      {/* Quick Action Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="group border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl">AI 스마트 개발 제안</CardTitle>
            <CardDescription className="text-slate-300">
              최신 마켓 트렌드와 원료 분석을 기반으로<br />
              고객에게 최적화된 상품 기획안을 자동 생성합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm">
              AI 리포트 생성하기 <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-400 text-xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> 최근 완료된 프로젝트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Vita-C Glow Ampoule</span>
              <span className="text-muted-foreground text-xs font-mono">2026-04-05</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Hydro-Pure Cleansing oil</span>
              <span className="text-muted-foreground text-xs font-mono">2026-04-02</span>
            </div>
            <Button variant="link" className="text-emerald-600 dark:text-emerald-400 p-0 h-auto">
              완료 목록 전체보기 <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <InquiryWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen} 
        onSuccess={fetchData} 
      />
    </div>
  );
}

