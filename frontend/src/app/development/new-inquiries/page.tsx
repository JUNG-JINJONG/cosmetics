"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  ChevronLeft,
  ArrowUpRight,
  TrendingUp,
  FlaskConical,
  Building2,
  Calendar,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles
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
import { useRouter } from "next/navigation";
import { AIConsultingReport } from "@/components/inquiry/AIConsultingReport";

import {
import { API_BASE_URL } from "@/lib/api-config";
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NewInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiReportOpen, setAiReportOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [applyingItem, setApplyingItem] = useState<any>(null);
  const router = useRouter();

  async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/workflow/inquiries`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("API response error");

      const data = await res.json();
      
      // '신규 의뢰' 필터링: 아직 제조사(company_id)가 배정되지 않은 건들
      // (백엔드에서 이미 제조사 권한일 때 본인 건 + 무배정 건을 주므로 여기선 무배정 건만 추출)
      const filtered = data
        .filter((inq: any) => inq.company_id === null)
        .map((inq: any) => ({
          id: `INQ-NEW-${String(inq.inquiry_id).padStart(3, "0")}`,
          realId: inq.inquiry_id,
          brand: inq.brand_name,
          product: inq.item_type || "N/A",
          title: `[${inq.brand_name}] ${inq.item_type || "N/A"} 개발 건`,
          category: inq.item_type || "General",
          quantity: inq.quantity || 0,
          budget: inq.target_price || "TBD",
          date: inq.created_at.split("T")[0],
          raw: inq
        }));

      setInquiries(filtered);
    } catch (error) {
      console.error("Failed to fetch new inquiries:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = inquiries.filter(item => 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-6 hover:bg-transparent -ml-1 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> 개발 제안으로 돌아가기
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              신규 의뢰 마켓플레이스
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" /> 실시간 신규 의뢰
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl mt-2">
            브랜드사에서 요청한 신규 프로젝트들을 검토하고 비즈니스 기회를 선점하세요. 
            AI가 분석한 시장성 데이터를 바탕으로 정밀한 제안이 가능합니다.
          </p>
        </div>
      </div>

      {/* Hero Banner Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-40 w-40" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" /> 이달의 Hot 카테고리
            </CardTitle>
            <CardDescription className="text-indigo-100/80">
              현재 바이어들이 가장 많이 찾는 제품군은 '비건 스킨케어' 입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-4">
              {['#비건인증', '#고함량CICA', '#환경친화적용기', '#저자극테스트'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-l-4 border-l-amber-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" /> 제안 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3 text-muted-foreground">
            <p>• 구체적인 <strong>타겟 단가</strong>와 <strong>MOQ</strong>를 포함할수록 채택률이 40% 이상 높아집니다.</p>
            <p>• AI 스마트 제안 기능을 사용하여 성분 분석표를 동시 제출하세요.</p>
            <Button variant="link" className="p-0 h-auto text-amber-600 font-bold">자세히 보기 <ArrowUpRight className="h-3 w-3 ml-1" /></Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & List Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="의뢰 내용, 브랜드 검색..." 
              className="pl-10 h-11 bg-white/50 dark:bg-zinc-950/50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">정렬:</span>
            <select className="bg-transparent text-sm font-bold focus:outline-none">
              <option>최신순</option>
              <option>수량순</option>
              <option>예산순</option>
            </select>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-100/50 dark:bg-zinc-800/50 border-b-none">
                <TableRow className="hover:bg-transparent border-b-none h-12">
                  <TableHead className="w-[140px] pl-6 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">ID / 등록일</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">프로젝트 정보</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground text-center">요청 수량</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground text-center">타겟 단가</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground text-center">상태</TableHead>
                  <TableHead className="w-[180px] pr-6 font-bold uppercase tracking-wider text-[11px] text-muted-foreground text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 animate-pulse">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-muted-foreground font-medium">신규 의뢰를 불러오는 중...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">새로운 의뢰가 없습니다.</p>
                          <p className="text-sm text-muted-foreground">현재 마켓플레이스에 대기 중인 의뢰가 없습니다.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-white dark:hover:bg-zinc-800/50 transition-all border-b border-slate-50 dark:border-zinc-800/50 h-20">
                      <TableCell className="pl-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[10px] font-bold text-primary">{item.id}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {item.date}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{item.product}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 dark:bg-zinc-800 border-none font-medium">
                              {item.category}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {item.brand}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{Number(item.quantity).toLocaleString()} 개</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">₩ {Number(item.budget).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 shadow-none hover:bg-emerald-100 font-bold">
                          공개 입찰 중
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedInquiry(item.raw);
                              setAiReportOpen(true);
                            }}
                          >
                            <FlaskConical className="h-4 w-4 text-violet-500" />
                          </Button>
                          <Button 
                            className="h-8 bg-slate-900 dark:bg-slate-50 text-xs px-4 rounded-lg font-bold hover:scale-105 transition-transform"
                            onClick={() => router.push(`/development/inquiries/${item.realId}`)}
                          >
                            상세 확인
                          </Button>
                          <Button 
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 rounded-lg font-bold hover:scale-105 transition-transform"
                            onClick={() => {
                              setApplyingItem(item);
                              setApplyDialogOpen(true);
                            }}
                          >
                            신청
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* AIConsultingReport Sidebar */}
      <AIConsultingReport 
        open={aiReportOpen} 
        onOpenChange={setAiReportOpen} 
        data={selectedInquiry} 
      />

      {/* Bottom Action */}
      <div className="flex justify-center pt-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Lock className="h-3 w-3" /> 모든 거래 데이터는 SSL 보안으로 암호화되어 관리됩니다.
        </p>
      </div>
      {/* Apply Confirmation Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" /> 개발 신청 확인
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-lg block mb-1">
                "{applyingItem?.title}"
              </span>
              해당 프로젝트 개발에 참여 신청 하시겠습니까? 세부 제안서는 다음 단계에서 작성하실 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:gap-0">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold" 
              onClick={async () => {
                if (!applyingItem) return;
                
                const token = localStorage.getItem("token");
                try {
                  const res = await fetch(`http://localhost:8000/api/v1/workflow/inquiries/accept?inquiry_id=${applyingItem.realId}`, {
                    method: "POST",
                    headers: { 
                      "Authorization": `Bearer ${token}` 
                    }
                  });

                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || "신청에 실패했습니다.");
                  }

                  setApplyDialogOpen(false);
                  alert(`${applyingItem.title} 신청이 성공적으로 접수되어 개발 진행이 확정되었습니다!`);
                  
                  // 목록 새로고침
                  fetchData();
                } catch (error: any) {
                  console.error("Apply error:", error);
                  alert(error.message || "서버 통신 중 오류가 발생했습니다.");
                }
              }}
            >
              신청하기
            </Button>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)} className="flex-1">
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
