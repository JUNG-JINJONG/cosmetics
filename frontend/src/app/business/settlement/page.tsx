"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
  Search,
  ArrowUpRight,
  Landmark,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const statusStyles: Record<string, string> = {
  "Pending": "bg-amber-50 text-amber-600 border-amber-100",
  "1500000002": "bg-amber-50 text-amber-600 border-amber-100", // 정산 대기
  "1500000003": "bg-blue-50 text-blue-600 border-blue-100",   // 정산 확정
  "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "1500000005": "bg-emerald-50 text-emerald-600 border-emerald-100", // 정산 완료
  "Refunded": "bg-rose-50 text-rose-600 border-rose-100",
};

const statusLabels: Record<string, string> = {
  "Pending": "결제 대기",
  "1500000002": "정산 대기",
  "1500000003": "정산 확정",
  "Completed": "결제 완료",
  "1500000005": "정산 완료",
  "Refunded": "환불됨",
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
    case "1500000005": return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold">정산 완료</Badge>;
    case "Pending":
    case "1500000002": return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold animate-pulse shadow-lg shadow-amber-200">정산 대기</Badge>;
    case "1500000003": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none font-bold shadow-lg shadow-blue-100">정산 확정</Badge>;
    case "Refunded": return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none font-bold">환불됨</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function SettlementPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Payment UI State
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSettlements = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login-required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/business/settlements/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettlements(data);
      }
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleRowClick = (item: any) => {
    setSelectedSettlement(item);
    setIsPaymentSheetOpen(true);
  };

  const processPayment = async () => {
    if (!selectedSettlement) return;
    setIsProcessing(true);
    const token = localStorage.getItem("token");

    try {
      // Simulate Payment Gateway Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch(`${API_BASE_URL}/api/v1/business/settlements/update?settlement_id=${selectedSettlement.settlement_id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          settlement_status_code: "1500000005", // 정산 완료
          paid_at: new Date().toISOString()
        })
      });

      if (res.ok) {
        alert("결제가 성공적으로 승인되었습니다! (T/T 송금 / 신용장 매입 완료)");
        fetchSettlements(); // Refresh list
        setIsPaymentSheetOpen(false);
      } else {
        alert("결제 처리 중 서버 에러가 발생했습니다.");
      }
    } catch (err: any) {
      alert("오류 발생: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = settlements.filter(item => 
    item.settlement_id.toString().includes(searchTerm) ||
    item.order_id?.toString().includes(searchTerm) ||
    (item.settlement_status_code && item.settlement_status_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPending = settlements
    .filter(s => s.settlement_status_code === "Pending" || s.settlement_status_code === "1500000002" || s.settlement_status_code === "1500000003")
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  const totalCompleted = settlements
    .filter(s => s.settlement_status_code === "Completed" || s.settlement_status_code === "1500000005")
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Landmark className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Financial & Settlement</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            정산 및 대금 결제 센터
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm font-medium">
            국가별 환율 리스크를 최소화하고 글로벌 결제(T/T, L/C, 카드)를 통합 지원하는 시스템입니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 border-slate-200 font-bold group">
            <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" />
            환율 모니터링
          </Button>
          <Button 
            className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all font-bold"
            onClick={() => fetchSettlements()}
          >
            새로고침
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-black text-indigo-100 uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4" /> 결제 대기 금액 (Pending)
              </p>
              <div className="text-3xl font-black">
                $ {totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-indigo-200 mt-2 font-medium bg-white/10 w-fit px-2 py-1 rounded">
                신속한 송금이 권장됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 누적 정산 완료 (Completed)
              </p>
              <div className="text-3xl font-black text-slate-800 dark:text-slate-100">
                $ {totalCompleted.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" /> 예상 부가세 / 수수료
              </p>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-200">
                $ {(totalPending * 0.1).toLocaleString()} <span className="text-sm font-medium text-slate-400">Est.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="space-y-2 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-rose-500" /> 현재 기준 환율 (USD/KRW)
                </p>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                  ₩ 1,382.50
                </div>
                <p className="text-[10px] text-rose-500 font-bold mt-1">▼ 0.2% (전일 대비)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Segment */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 dark:border-zinc-800 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-500" />
                인보이스 및 대금 청구서 내역
              </CardTitle>
              <CardDescription>총 {settlements.length}건의 정산 내역이 기록되어 있습니다. 결제를 진행할 항목을 선택해 주세요.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="인보이스 / 주문 번호 검색..."
                className="h-10 w-64 pl-9 bg-slate-50 dark:bg-zinc-950/50 border-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[120px] pl-6 py-4 font-bold text-[10px] uppercase text-muted-foreground">ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">인보이스 정보</TableHead>
                  <TableHead className="w-[120px] font-bold text-[10px] uppercase text-muted-foreground text-right">총 결제액</TableHead>
                  <TableHead className="w-[100px] font-bold text-[10px] uppercase text-muted-foreground text-right">세금(10%)</TableHead>
                  <TableHead className="w-[100px] font-bold text-[10px] uppercase text-muted-foreground text-right">수수료(5%)</TableHead>
                  <TableHead className="w-[120px] font-bold text-[10px] uppercase text-muted-foreground text-right">순 지급액(Net)</TableHead>
                  <TableHead className="w-[110px] font-bold text-[10px] uppercase text-muted-foreground text-center">결제 상태</TableHead>
                  <TableHead className="w-[140px] pr-6 text-right font-bold text-[10px] uppercase text-muted-foreground">날짜</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-sm text-muted-foreground italic">결제 데이터를 안전하게 불려오는 중입니다...</TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 py-12">
                        <Wallet className="h-12 w-12 text-slate-200 mb-2" />
                        <p className="font-bold text-slate-400 font-mono">NO INVOICES YET</p>
                        <p className="text-xs text-muted-foreground">진행 중인 정산 내역이 없습니다.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow 
                      key={item.settlement_id} 
                      onClick={() => handleRowClick(item)}
                      className="group cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-zinc-800/30 transition-colors border-b border-slate-50 dark:border-zinc-800 h-16"
                    >
                      <TableCell className="pl-6 font-mono text-[12px] font-bold text-indigo-600">
                        INV-{String(item.settlement_id).padStart(6, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            Order #{item.order_id} 
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">B2B Trade Invoice</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {Number(item.total_amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-slate-500">
                          {Number(item.tax_amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-slate-500 font-medium">
                          {Number(item.fee_amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">
                          {Number(item.net_amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("text-[10px] font-black px-3 py-1 shadow-none rounded-md", statusStyles[item.settlement_status_code || "Pending"])}>
                          {statusLabels[item.settlement_status_code || "Pending"] || item.settlement_status_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right space-y-1">
                        <div className="text-[11px] font-bold text-slate-500">{new Date(item.created_at).toLocaleDateString()}</div>
                        {item.paid_at && (
                          <div className="text-[9px] font-black tracking-tighter text-emerald-600 bg-emerald-50 px-1 inline-block rounded">
                            PAID: {new Date(item.paid_at).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateway Sheet / Modal */}
      <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
        <SheetContent className="w-[500px] sm:max-w-[600px] p-0 border-l-0 bg-slate-50 overflow-y-auto">
          <SheetHeader className="sr-only">
            <SheetTitle>결제 진행 레이어</SheetTitle>
            <SheetDescription>인보이스 결제를 위한 가상 결제창</SheetDescription>
          </SheetHeader>

          {selectedSettlement && (
            <div className="flex flex-col h-full bg-white">
              {/* Payment Header */}
              <div className="p-8 bg-slate-900 text-white">
                <div className="flex items-center gap-3 text-emerald-400 mb-4">
                  <CreditCard className="h-6 w-6" />
                  <span className="font-bold tracking-widest text-sm uppercase">Secure Payment Gateway</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-1">인보이스 결제</h2>
                <p className="text-slate-400 text-sm">Order #{selectedSettlement.order_id} 에 대한 B2B 대금 청구서입니다.</p>
                
                <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-inner">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">결제할 총 금액 (Total Due)</p>
                  <div className="text-4xl font-black text-white flex items-center justify-between">
                    <span>{selectedSettlement.currency || "USD"} {Number(selectedSettlement.total_amount).toLocaleString()}</span>
                    <Badge className="bg-emerald-500 text-white font-bold border-none text-xs">확정 금액</Badge>
                  </div>
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="p-8 space-y-6 flex-1">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">요금 상세 내역 (Breakdown)</h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                      <span>순 공급가 (Net Amount)</span>
                      <span>{selectedSettlement.currency} {Number(selectedSettlement.net_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                      <span>부가가치세 (VAT / Tax)</span>
                      <span>{selectedSettlement.currency} {Number(selectedSettlement.tax_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-600 border-b pb-3">
                      <span>플랫폼 거래 수수료 (Fees)</span>
                      <span>{selectedSettlement.currency} {Number(selectedSettlement.fee_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="font-black text-slate-900">Total</span>
                      <span className="font-black text-indigo-700 text-lg">{selectedSettlement.currency} {Number(selectedSettlement.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">결제 수단 선택 (Payment Method)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-16 border-indigo-600 bg-indigo-50 flex flex-col items-center justify-center gap-1 shadow-none cursor-default hover:bg-indigo-50">
                      <Landmark className="h-5 w-5 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-800">T/T (은행 송금)</span>
                    </Button>
                    <Button variant="outline" className="h-16 text-slate-400 flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                      <CreditCard className="h-5 w-5" />
                      <span className="text-xs font-bold">법인 신용카드 (준비중)</span>
                    </Button>
                    <Button variant="outline" className="h-16 text-slate-400 flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                      <FileText className="h-5 w-5" />
                      <span className="text-xs font-bold">L/C (신용장)</span>
                    </Button>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3 mt-4">
                    <InfoIcon className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                      송금이 완료되면 저희 시스템에서 입금 내역을 자동 대사합니다. 이 데모 시스템에서는 안전하게 가상 결제가 즉시 처리됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-8 border-t bg-slate-50">
                {(selectedSettlement.settlement_status_code === "Completed" || selectedSettlement.settlement_status_code === "1500000005") ? (
                  <Button className="w-full h-14 text-base font-bold bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed border-none">
                    <CheckCircle2 className="mr-2 h-5 w-5" /> 이미 정산이 완료된 청구서입니다
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
                    onClick={processPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        보안 결제망 통신 및 처리 중...
                      </div>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-5 w-5" /> 안전하게 대금 송금 진행하기
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}

function InfoIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
