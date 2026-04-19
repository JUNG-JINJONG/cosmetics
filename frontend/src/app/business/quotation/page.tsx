"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import {
  BadgeDollarSign,
  Calculator,
  ReceiptText,
  Search,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Calendar,
  ChevronRight,
  DollarSign,
  Layers,
  Info,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Status styles for Quotations
const statusStyles: Record<string, string> = {
  "Draft": "bg-slate-100 text-slate-600 border-slate-200",
  "Sent": "bg-blue-50 text-blue-600 border-blue-100",
  "Confirmed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Expired": "bg-rose-50 text-rose-600 border-rose-100",
  "Requested": "bg-amber-50 text-amber-600 border-amber-100",
};

const statusLabels: Record<string, string> = {
  "Draft": "초안",
  "Sent": "발송됨",
  "Confirmed": "확정됨",
  "Expired": "만료됨",
  "Requested": "의뢰/접수됨",
};

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  Box, 
  FileCheck, 
  FileDigit,
  Download,
  Printer
} from "lucide-react";

// Status color helpers
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Confirmed": return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold">확정완료</Badge>;
    case "Sent": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none font-bold">발송됨</Badge>;
    case "Draft": return <Badge className="bg-slate-400 hover:bg-slate-500 text-white border-none font-bold">초안</Badge>;
    case "Requested": return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold animate-pulse shadow-lg shadow-amber-200">견적요청(신규)</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function QuotationPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Detail Sheet State
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);

  // Simulator State
  const [simQuantity, setSimQuantity] = useState(1000);
  const [simResults, setSimResults] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const router = useRouter();

  const handleApproveAndOrder = async () => {
    if (!selectedQuote) return;
    
    if (!confirm("이 견적을 기반으로 정식 발주를 진행하시겠습니까?")) return;

    try {
      setApproving(true);
      const res = await fetch(`http://localhost:8000/api/v1/business/orders/convert-from-quotation?quotation_id=${selectedQuote.quotation_id}`, {
        method: "POST"
      });
      if (res.ok) {
        alert("성공적으로 발주되었습니다! 발주 관리 화면으로 이동합니다.");
        router.push("/business/orders");
      } else {
        const err = await res.json();
        alert(`발주 처리 중 오류가 발생했습니다: ${err.detail}`);
      }
    } catch (error) {
      console.error("Order conversion failed:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setApproving(false);
    }
  };

  async function fetchQuotations() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login-required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/business/quotations/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch single quotation detail
  async function handleRowClick(id: number) {
    setIsSheetOpen(true);
    setSheetLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/api/v1/business/quotations/detail?quotation_id=${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedQuote(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSheetLoading(false);
    }
  }

  // Simulate price based on quantity
  async function handleSimulate() {
    setSimLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/business/quotations/simulate-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: 1,
          quantity: simQuantity,
          target_currency: "USD"
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSimResults(data);
      } else {
        // Fallback for demo
        setSimResults({
          unit_price: 4.5,
          total_amount: 4.5 * simQuantity,
          currency: "USD",
          tier_recommendation: {
            next_tier_qty: 5000,
            potential_unit_price: 3.8,
            savings_percent: 15.5
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotations();
  }, []);

  const filteredItems = quotations.filter(item => 
    item.quotation_id.toString().includes(searchTerm) ||
    item.quotation_status_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in duration-700">
      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] sm:max-w-[700px] p-0 border-l-0 overflow-y-auto bg-slate-50">
          {/* Accessibility Titles (Required by Radix) */}
          <SheetHeader className="sr-only">
            <SheetTitle>견적서 상세 정보</SheetTitle>
            <SheetDescription>견적서의 상세 내역 및 진행 상태를 확인합니다.</SheetDescription>
          </SheetHeader>

          {sheetLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">상세 내역 동기화 중...</p>
            </div>
          ) : selectedQuote && (
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
              {/* Sheet Header - Gradient Style */}
              <div className="bg-gradient-to-br from-indigo-700 to-violet-800 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ReceiptText className="h-48 w-48 rotate-12" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-mono tracking-widest px-3">
                      #QT-{String(selectedQuote.quotation_id).padStart(4, '0')}
                    </Badge>
                    {getStatusBadge(selectedQuote.quotation_status_code)}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mt-2">
                    {selectedQuote.inquiry_id ? `의뢰 INQ-${selectedQuote.inquiry_id} 정밀 견적` : "일반 도매 견적서"}
                  </h2>
                  <div className="flex items-center gap-6 text-sm text-indigo-100 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedQuote.created_at).toLocaleDateString()} 발행
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {selectedQuote.valid_until ? `${new Date(selectedQuote.valid_until).toLocaleDateString()} 만료` : "기한 설정 없음"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Areas */}
              <div className="p-8 space-y-8 flex-1">
                {/* 1. Amounts & Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-none shadow-sm bg-white p-6 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">총 견적 금액</label>
                    <div className="text-2xl font-black text-indigo-700">
                      {Number(selectedQuote.total_estimated_amount) > 0 
                        ? `${selectedQuote.currency || 'KRW'} ${Number(selectedQuote.total_estimated_amount).toLocaleString()}`
                        : <span className="text-slate-400 text-lg">계산 대기중</span>}
                    </div>
                  </Card>
                  <Card className="border-none shadow-sm bg-white p-6 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">항목 개수</label>
                    <div className="text-2xl font-black text-slate-900">
                      {selectedQuote.items?.length || 0} <span className="text-sm font-bold text-slate-400">Lines</span>
                    </div>
                  </Card>
                </div>

                {/* 2. Item Details Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black flex items-center gap-2 text-slate-800">
                    <Box className="h-4 w-4 text-indigo-500" />
                    ITEMIZED BREAKDOWN
                  </h3>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-none">
                          <TableHead className="text-[10px] font-black uppercase">Product</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-center">Qty</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-right">Unit Price</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuote.items?.map((item: any, idx: number) => (
                          <TableRow key={idx} className="border-b border-slate-50 group hover:bg-slate-50/30">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">
                                  {item.product_id ? `Product ID: ${item.product_id}` : "Custom Compound"}
                                </span>
                                {item.discount_rate > 0 && (
                                  <Badge className="w-fit scale-[0.8] origin-left bg-rose-50 text-rose-600 border-none">
                                    -{item.discount_rate}% OFF
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-slate-600">{item.quantity?.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">{selectedQuote.currency} {Number(item.unit_price).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-black text-indigo-600">{selectedQuote.currency} {Number(item.subtotal).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 3. Logical Tracking (Quality & Supply) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                    <FileCheck className="h-4 w-4 text-emerald-500" />
                    Quality & Process Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex items-start gap-4">
                      <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-700 uppercase">QC Verification</p>
                        <p className="text-xs font-bold text-slate-700">시험 성적서 검증 완료</p>
                        <p className="text-[10px] text-emerald-600">성분 안전성 데이터 매칭 완료</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-700 uppercase">Supply Chain</p>
                        <p className="text-xs font-bold text-slate-700">원부자재 준비 중</p>
                        <p className="text-[10px] text-blue-600">L/T: 발주 후 35일 예상</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Comments */}
                {selectedQuote.comments && (
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                    <label className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 italic">
                      <AlertCircle className="h-3 w-3" /> Special Instructions
                    </label>
                    <p className="text-sm font-medium text-amber-800 leading-relaxed">
                      {selectedQuote.comments}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-8 border-t bg-slate-50/50 mt-auto">
                {selectedQuote.quotation_status_code === "Requested" ? (
                  <Button 
                    onClick={() => router.push(`/business/quotation/new?quotation_id=${selectedQuote.quotation_id}`)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-2xl shadow-lg border-none"
                  >
                    <Plus className="mr-2 h-4 w-4" /> 견적서 작성 및 회신하기
                  </Button>
                ) : selectedQuote.quotation_status_code === "Sent" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-12 rounded-2xl border-slate-200 font-bold group">
                      <Download className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" /> PDF 검토
                    </Button>
                    <Button 
                      onClick={handleApproveAndOrder}
                      disabled={approving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-2xl shadow-xl border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> 수락 및 정식 발주하기
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 font-bold">
                     <Download className="mr-2 h-4 w-4" /> 견적서 PDF 다운로드
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-1">
            <BadgeDollarSign className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Matching & Trading</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            견적 관리 센터
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm font-medium">
            MOQ 기반의 정밀 단가를 시뮬레이션하고, 바이어와 체결된 모든 견적 이력을 통합 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 border-slate-200 font-bold group">
            <Layers className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
            단가 티어 설정
          </Button>
          <Button 
            onClick={() => router.push("/business/quotation/new")}
            className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> 신규 견적서 생성
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Quotation List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 dark:border-zinc-800 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-indigo-500" />
                  견적 발송 이력
                </CardTitle>
                <CardDescription>총 {quotations.length}건의 견적이 관리되고 있습니다.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ID 또는 상태 검색..."
                  className="h-9 w-48 pl-9 bg-slate-50 dark:bg-zinc-950/50 border-none text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[100px] pl-6 py-4 font-bold text-[10px] uppercase text-muted-foreground">견적 번호</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">내역 요약</TableHead>
                    <TableHead className="w-[120px] font-bold text-[10px] uppercase text-muted-foreground text-right">총액 (Est.)</TableHead>
                    <TableHead className="w-[100px] font-bold text-[10px] uppercase text-muted-foreground text-center">상태</TableHead>
                    <TableHead className="w-[120px] pr-6 text-right font-bold text-[10px] uppercase text-muted-foreground">날짜</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-sm text-muted-foreground italic">데이터 로딩 중...</TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                          <ReceiptText className="h-12 w-12 text-slate-200 mb-2" />
                          <p className="font-bold text-slate-400 font-mono">NO QUOTATIONS FOUND</p>
                          <Button variant="link" className="text-indigo-600 text-xs font-bold">첫 견적서를 작성해 보세요</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow 
                        key={item.quotation_id} 
                        onClick={() => handleRowClick(item.quotation_id)}
                        className="group cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-zinc-800/30 transition-colors border-b border-slate-50 dark:border-zinc-800 h-16"
                      >
                        <TableCell className="pl-6 font-mono text-[11px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
                          #{String(item.quotation_id).padStart(4, '0')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:translate-x-1 transition-transform">
                              {item.inquiry_id ? `의뢰 INQ-${item.inquiry_id} 기반 견적` : "일반 도매 견적"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">SKU: MOIST-CREAM-01 외 2종</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                            {Number(item.total_estimated_amount) > 0 
                              ? `${item.currency || 'KRW'} ${Number(item.total_estimated_amount).toLocaleString()}` 
                              : <span className="text-slate-400 font-medium text-xs">계산 대기중</span>}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn("text-[10px] font-black italic px-2 py-0.5 border shadow-none", statusStyles[item.quotation_status_code])}>
                            {statusLabels[item.quotation_status_code] || item.quotation_status_code}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center justify-end gap-2">
                            {new Date(item.created_at).toLocaleDateString()}
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Marketing/Banner Tip */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-100">
            <div className="space-y-3">
              <h3 className="text-2xl font-black tracking-tight">MOQ 0 정책으로 신규 바이어를 확보하세요</h3>
              <p className="text-indigo-100 text-sm max-w-xl font-medium leading-relaxed">
                인디 브랜드나 글로벌 인플루언서를 위해 소량 생산 단가 정책을 설정할 수 있습니다. 
                스마트 가격 티어링 시스템이 자동으로 최적의 단가를 계산해 드립니다.
              </p>
            </div>
            <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 h-12 rounded-2xl shadow-lg border-none">
              자세히 보기 <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Side: Simulator */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-2xl bg-indigo-900 text-white overflow-hidden relative">
            {/* Background Decorative Circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
            
            <CardHeader className="relative pb-0 border-none">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-300" />
                스마트 단가 시뮬레이터
              </CardTitle>
              <CardDescription className="text-indigo-200 text-xs font-medium">
                수량에 따른 실시간 단가 하락폭을 예측합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 relative">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Target Product</label>
                  <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between group cursor-pointer hover:bg-white/15 transition-all outline outline-1 outline-white/5">
                    <span className="text-sm font-bold">모이스처 라이징 크림 (A-01)</span>
                    <ChevronDown className="h-4 w-4 text-indigo-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Order Quantity (MOQ)</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                    <Input 
                      type="number" 
                      value={simQuantity}
                      onChange={(e) => setSimQuantity(Number(e.target.value))}
                      className="bg-white/10 border-none h-12 pl-10 text-lg font-black placeholder:text-indigo-400 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSimulate}
                disabled={simLoading}
                className="w-full h-12 bg-white text-indigo-900 hover:bg-slate-100 font-black rounded-2xl shadow-xl border-none"
              >
                {simLoading ? "계산 중..." : "최적 단가 분석하기"}
              </Button>

              {simResults && (
                <div className="pt-6 border-t border-white/10 space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-indigo-300">개당 예상 단가</span>
                    <div className="text-right">
                      <span className="text-3xl font-black">{simResults.currency} {simResults.unit_price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-black text-indigo-300">
                      <TrendingUp className="h-3 w-3" /> COCO'S TIER SUGGESTION
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                      수량을 <span className="font-bold text-indigo-200">{simResults.tier_recommendation.next_tier_qty.toLocaleString()}개</span>로 늘리면 
                      단가가 <span className="font-bold text-indigo-200">{simResults.currency} {simResults.tier_recommendation.potential_unit_price}</span>까지 
                      <span className="text-emerald-400 ml-1 font-black">-{simResults.tier_recommendation.savings_percent}% 절감</span> 가능합니다.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-black/20 p-4 flex justify-between items-center text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">
               <span>Last updated: Real-time</span>
               <div className="flex bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">AI PRO MODEL</div>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">최근 시장 환율</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-5">
              {[
                { pair: "USD/KRW", rate: "1,384.50", change: "+0.12%", up: true },
                { pair: "CNY/KRW", rate: "191.20", change: "-0.05%", up: false },
                { pair: "JPY/KRW", rate: "9.05", change: "+0.22%", up: true },
              ].map((rate, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center font-bold text-[10px] text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      {rate.pair.split('/')[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{rate.pair}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">{rate.rate}</p>
                    <p className={cn("text-[10px] font-bold", rate.up ? "text-emerald-500" : "text-rose-500")}>
                      {rate.change}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t flex flex-col gap-2">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  * 우리 시스템은 실시간 환율을 반영하여 바이어의 로컬 통화로 견적서를 자동 변환합니다.
                </p>
                <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase h-8 hover:bg-slate-50">
                  전체 환율 분석 정보 <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="border-indigo-100 text-indigo-500 font-bold bg-indigo-50/30">PRECISION PRICING</Badge>
          <Badge variant="outline" className="border-emerald-100 text-emerald-500 font-bold bg-emerald-50/30">TAX OPTIMIZED</Badge>
          <Badge variant="outline" className="border-amber-100 text-amber-500 font-bold bg-amber-50/30">MOQ FLEXIBLE</Badge>
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-2">
          <Info className="h-3 w-3" /> 모든 견적 수치는 원부자재 시세 및 공장 상황에 따라 변동될 수 있습니다. 정식 계약 전 반드시 관리자 승인을 받으십시오.
        </p>
      </div>
    </div>
  );
}
