"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Beaker, 
  FileText, 
  Sparkles,
  ArrowRight,
  FlaskConical,
  Zap,
  Save,
  Send,
  Calendar,
  DollarSign,
  Package,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function ProposalEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States for proposal form
  const [formulation, setFormulation] = useState("");
  const [mainIngredients, setMainIngredients] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [moq, setMoq] = useState("");
  const [totalEstimatedAmount, setTotalEstimatedAmount] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [comments, setComments] = useState("");

  const dbId = id ? (id as string).split("-").pop() : null;

  useEffect(() => {
    async function fetchDetail() {
      if (!dbId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/v1/workflow/inquiries/detail?inquiry_id=${parseInt(dbId)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInquiry(data);
          // Set default values from inquiry if needed
          setMoq(data.quantity || "");
          setUnitPrice(data.target_price || "");
        }
      } catch (error) {
        console.error("Failed to fetch inquiry detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [dbId]);

  const handleSubmit = async () => {
    if (!inquiry?.project?.project_id) {
      alert("프로젝트 정보를 찾을 수 없습니다.");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`http://localhost:8000/api/v1/workflow/projects/proposal?project_id=${inquiry.project.project_id}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project_id: inquiry.project.project_id,
          formulation_description: formulation,
          main_ingredients: mainIngredients,
          unit_price: Number(unitPrice),
          moq: Number(moq),
          expected_completion_date: expectedCompletionDate ? new Date(expectedCompletionDate).toISOString() : null,
          comments: comments
        })
      });

      if (res.ok) {
        alert("상세 제안서가 성공적으로 제출되었습니다!");
        router.push("/development/projects");
      } else {
        const err = await res.json();
        alert(`제안서 제출 중 오류가 발생했습니다: ${err.detail || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("Submit proposal error:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">정보를 불러오는 중...</div>;
  if (!inquiry) return <div className="p-8 text-center text-destructive">정보를 찾을 수 없습니다.</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1200px] space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-6 hover:bg-transparent -ml-1 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> 돌아가기
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              상세 제안서 작성
            </h1>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 font-bold">
              제안 대기 중
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            바이어의 의뢰 내용을 바탕으로 전문적인 처방 및 견적 제안을 입력해 주세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl">
            <Save className="mr-2 h-4 w-4" /> 임시 저장
          </Button>
          <Button 
            className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none font-bold"
            onClick={handleSubmit}
          >
            <Send className="mr-2 h-4 w-4" /> 제안서 제출하기
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Product Concept & Formula */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Beaker className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">처방 및 제형 제안</CardTitle>
                  <CardDescription>제품의 특징과 주요 성분을 입력합니다.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold">핵심 컨셉 및 제형 특징</Label>
                <Textarea 
                  placeholder="예: 민감성 피부를 위한 저자극 고농축 시카 제형으로, 끈적임 없는 실키한 마무리가 특징입니다."
                  className="min-h-[120px] bg-slate-50 border-none resize-none focus-visible:ring-indigo-500"
                  value={formulation}
                  onChange={(e) => setFormulation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">주요 성분 목록 (전성분 요약)</Label>
                <Input 
                  placeholder="병풀추출물, 판테놀, 세라마이드NP, 히알루론산 등"
                  className="bg-slate-50 border-none focus-visible:ring-indigo-500"
                  value={mainIngredients}
                  onChange={(e) => setMainIngredients(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">바이어가 요청한 컨셉 성분을 포함하여 작성해 주세요.</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Quotation */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">견적 제안 (Quotation)</CardTitle>
                  <CardDescription>수량에 따른 공급 단가 및 총액을 산출합니다.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">제안 단가 (단위당)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">￦</span>
                    <Input 
                      type="number"
                      className="pl-8 bg-slate-50 border-none font-bold text-lg text-emerald-600"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">최소 주문 수량 (MOQ)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      className="pr-10 bg-slate-50 border-none font-bold text-lg"
                      value={moq}
                      onChange={(e) => setMoq(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EA</span>
                  </div>
                </div>
                <div className="md:col-span-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-sm text-emerald-700 font-bold">총 예상 견적액 (VAT 별도)</span>
                    <p className="text-xs text-emerald-600/70">MOQ 기준 자동 산출</p>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 tracking-tight">
                    ￦ {(Number(unitPrice) * Number(moq)).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Schedule & Others */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">일정 및 기타 의견</CardTitle>
                  <CardDescription>예상 완료일 및 보충 설명을 작성합니다.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold">개발 완료 예정일 (Target Date)</Label>
                <Input 
                  type="date"
                  className="bg-slate-50 border-none w-full md:w-64"
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">기타 의견 및 특이사항</Label>
                <Textarea 
                  placeholder="추가적인 의견이나 바이어에게 전달할 메시지를 입력해 주세요."
                  className="min-h-[100px] bg-slate-50 border-none resize-none"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Inquiry Summary */}
        <div className="space-y-6">
          <Card className="border-none bg-slate-900 text-white shadow-2xl sticky top-24 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Info className="h-16 w-16" />
            </div>
            <CardHeader>
              <CardTitle className="text-white">바이어 의뢰 요약</CardTitle>
              <CardDescription className="text-slate-400">제안서 작성 시 참고하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm text-slate-400">브랜드</span>
                  <span className="font-bold">{inquiry.brand_name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm text-slate-400">품목</span>
                  <span className="font-bold">{inquiry.item_type}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm text-slate-400">요청수량</span>
                  <span className="font-bold text-amber-400">{inquiry.quantity?.toLocaleString()} EA</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm text-slate-400">희망단가</span>
                  <span className="font-bold text-blue-400">￦ {inquiry.target_price?.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" /> AI 컨설팅 방향
                </p>
                <p className="text-sm leading-relaxed">
                  고농축 기능성 성분(시카, 나이아신아마이드)을 포함한 저자극 세럼 제안을 추천합니다.
                </p>
              </div>

              <div className="pt-4">
                <Button variant="ghost" className="w-full text-white hover:bg-white/10 hover:text-white flex items-center justify-between font-bold">
                  의뢰 원본 보기 <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
