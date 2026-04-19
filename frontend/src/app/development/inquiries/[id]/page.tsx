"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  FileText, 
  Sparkles,
  Printer,
  Share2,
  Trash2,
  Package,
  Truck,
  ClipboardCheck,
  Settings,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Modularized Tab Components
import { OverviewTab } from "@/components/development/project-detail/OverviewTab";
import { ProposalTab } from "@/components/development/project-detail/ProposalTab";
import { AITab } from "@/components/development/project-detail/AITab";
import { SamplingTab } from "@/components/development/project-detail/SamplingTab";
import { ProductionTab } from "@/components/development/project-detail/ProductionTab";
import { QualityControlTab } from "@/components/development/project-detail/QualityControlTab";
import { OutboundTab } from "@/components/development/project-detail/OutboundTab";
import { ProjectSidebar } from "@/components/development/project-detail/ProjectSidebar";

export default function InquiryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [inquiry, setInquiry] = useState<any>(null);
  const [quotation, setQuotation] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [samples, setSamples] = useState<any[]>([]);
  
  // UI Display States
  const [showSampleForm, setShowSampleForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);

  const dbId = id ? (id as string).split("-").pop() : null;

  useEffect(() => {
    async function fetchData() {
      if (!dbId) return;
      try {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("user_type");
        
        // 1. User Profile
        const userUrl = userType === "company_user" 
          ? `${API_BASE_URL}/api/v1/account/company-users/me`
          : `${API_BASE_URL}/api/v1/account/me`;
        
        const uRes = await fetch(userUrl, { headers: { "Authorization": `Bearer ${token}` } });
        if (uRes.ok) setCurrentUser(await uRes.json());

        // 2. Inquiry & Quotation
        const res = await fetch(`http://localhost:8000/api/v1/workflow/inquiries/detail?inquiry_id=${parseInt(dbId)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInquiry(data);
          
          const qRes = await fetch(`http://localhost:8000/api/v1/business/quotations/?inquiry_id=${parseInt(dbId)}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (qRes.ok) {
            const qData = await qRes.json();
            if (qData.length > 0) setQuotation(qData[0]);
          }

          // 3. Samples
          if (data.project?.project_id) {
            const sRes = await fetch(`http://localhost:8000/api/v1/workflow/samples/project-list?project_id=${data.project.project_id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (sRes.ok) setSamples(await sRes.json());
          }
        }
      } catch (error) {
        console.error("Data fetching error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dbId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">데이터 로드 중...</div>;
  if (!inquiry) return <div className="p-8 text-center text-destructive">의뢰 정보를 찾을 수 없습니다.</div>;

  const status = inquiry.project?.status_code || "Pending";
  const progress = inquiry.project?.current_phase_percent || 0;
  const isBuyer = currentUser?.role === "Client";
  const isPendingApproval = status === "1300000012";

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-6 animate-in fade-in duration-700">
      {/* Top Actions */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-slate-100 -ml-2 text-muted-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" /> 목록으로 돌아가기
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" /> 인쇄</Button>
          <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" /> 공유</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" /> 삭제</Button>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-zinc-900 border rounded-3xl p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none font-bold">
              {id}
            </Badge>
            <StatusBadge status={status} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {inquiry.brand_name} {inquiry.item_type} <span className="text-slate-400 font-light">개발 의뢰</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span>접수일: {new Date(inquiry.created_at).toLocaleDateString()}</span>
            <span>작성자: Buyer #{inquiry.buyer_id}</span>
          </div>
        </div>

        <div className="lg:w-80 space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span>프로젝트 진행률</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {getStatusMessage(status)}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-slate-100 p-1 dark:bg-zinc-800 rounded-xl mb-6 overflow-x-auto flex-nowrap w-full justify-start md:justify-center">
              <TabsTrigger value="overview" className="rounded-lg">개요</TabsTrigger>
              <TabsTrigger value="proposal" className="rounded-lg border-2 border-transparent data-[state=active]:border-primary/20">
                <FileText className="h-3.5 w-3.5 mr-2 text-primary" /> 제조사 제안서
              </TabsTrigger>
              <TabsTrigger value="ai" className="rounded-lg flex gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI 컨설팅
              </TabsTrigger>
              <TabsTrigger value="sampling" className="rounded-lg flex gap-2">
                <Package className="h-3.5 w-3.5" /> 샘플링
              </TabsTrigger>
              <TabsTrigger value="production" className="rounded-lg flex gap-2">
                <Settings className="h-3.5 w-3.5" /> 생산 관리
              </TabsTrigger>
              <TabsTrigger value="qc" className="rounded-lg flex gap-2">
                <ClipboardCheck className="h-3.5 w-3.5" /> 품질관리
              </TabsTrigger>
              <TabsTrigger value="outbound" className="rounded-lg flex gap-2">
                <Truck className="h-3.5 w-3.5" /> 출하/물류
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg">히스토리</TabsTrigger>
              <TabsTrigger value="qna" className="rounded-lg">Q&A</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><OverviewTab inquiry={inquiry} /></TabsContent>
            
            <TabsContent value="proposal">
              <ProposalTab quotation={quotation} inquiry={inquiry} isBuyer={isBuyer} isPendingApproval={isPendingApproval} />
            </TabsContent>
            
            <TabsContent value="ai"><AITab /></TabsContent>
            
            <TabsContent value="sampling">
              <SamplingTab 
                samples={samples} 
                inquiry={inquiry} 
                isBuyer={isBuyer} 
                showSampleForm={showSampleForm} 
                setShowSampleForm={setShowSampleForm}
                showReviewForm={showReviewForm}
                setShowReviewForm={setShowReviewForm}
              />
            </TabsContent>

              <TabsContent value="production">
                <ProductionTab 
                  projectId={inquiry.project.project_id} 
                  isBuyer={isBuyer} 
                />
              </TabsContent>

              <TabsContent value="qc">
                <QualityControlTab 
                  projectId={inquiry.project.project_id}
                  isBuyer={isBuyer}
                />
              </TabsContent>

              <TabsContent value="outbound">
                <OutboundTab 
                  projectId={inquiry.project.project_id}
                  isBuyer={isBuyer}
                />
              </TabsContent>

            <TabsContent value="history" className="p-12 text-center text-muted-foreground">업데이트 대기 중...</TabsContent>
            <TabsContent value="qna" className="p-12 text-center text-muted-foreground">Q&A 채널 준비 중...</TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Column */}
        <ProjectSidebar inquiry={inquiry} />
      </div>
    </div>
  );
}

// Sub-components for cleaner Main Page
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string, color: string }> = {
    "1300000001": { label: "의뢰 접수", color: "bg-orange-100 text-orange-700" },
    "1300000011": { label: "제안서 작성 대기", color: "bg-amber-100 text-amber-700" },
    "1300000012": { label: "제안 검토 중", color: "bg-blue-100 text-blue-700" },
    "1300000004": { label: "샘플 테스트", color: "bg-pink-100 text-pink-700" },
    "1300000005": { label: "견적 및 계약", color: "bg-indigo-100 text-indigo-700" },
    "1300000007": { label: "생산 중", color: "bg-sky-100 text-sky-700" },
    "1300000008": { label: "품질 관리", color: "bg-violet-100 text-violet-700" },
    "1300000009": { label: "출고 및 배송", color: "bg-orange-100 text-orange-700" },
    "1300000010": { label: "개발 완료", color: "bg-emerald-100 text-emerald-700" },
  };
  const config = configs[status] || { label: "진행 중", color: "bg-slate-100 text-slate-700" };
  return <Badge className={`${config.color} border-none`}>{config.label}</Badge>;
};

const getStatusMessage = (status: string) => {
  if (status === "1300000001") return "제조사 매칭 및 처방 검토 중입니다.";
  if (status === "1300000011") return "제조사에서 제안서를 준비하고 있습니다.";
  if (status === "1300000012") return "제조사의 제안서가 도착했습니다. 검토해 주세요.";
  if (status === "1300000004") return "제형 샘플링 및 품평 진행 단계입니다.";
  if (status === "1300000005") return "최종 견적 협의 및 생산 계약 단계입니다.";
  if (status === "1300000007") return "제조 공장에서 제품 생산을 진행 중입니다.";
  if (status === "1300000008") return "생산 완료 후 최종 품질 검사가 진행 중입니다.";
  if (status === "1300000009") return "품질 검사 합격 후 제품이 출하 진행 중입니다.";
  if (status === "1300000010") return "제품 개발 및 배송이 모두 완료되었습니다.";
  return "현재 공정 및 적합 테스트 단계 진행 중";
};
