"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  ClipboardList,
  ExternalLink,
  History,
  FileText,
  AlertCircle,
  TrendingUp
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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const orderStatusStyles: Record<string, string> = {
  "1600000001": "bg-amber-50 text-amber-600 border-amber-100",
  "1600000002": "bg-blue-50 text-blue-600 border-blue-100",
  "1600000003": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "1600000004": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "1600000005": "bg-rose-50 text-rose-600 border-rose-100",
};

const orderStatusLabels: Record<string, string> = {
  "1600000001": "발주 대기",
  "1600000002": "생산/준비 중",
  "1600000003": "배송 중",
  "1600000004": "배송 완료",
  "1600000005": "발주 취소",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  
  // Shipping Form State
  const [shippingMethod, setShippingMethod] = useState("CJ대한통운");
  const [trackingNum, setTrackingNum] = useState("");

  const router = useRouter();

  const isManufacturer = currentUser?.role === "Manufacturer" || currentUser?.role === "Admin";

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login-required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch User Profile
      const userRes = await fetch(`${API_BASE_URL}/api/v1/account/company-users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (userRes.ok) {
        setCurrentUser(await userRes.json());
      } else {
        // Fallback for different user table
        const buyerRes = await fetch(`${API_BASE_URL}/api/v1/account/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (buyerRes.ok) setCurrentUser(await buyerRes.json());
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/business/orders/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRowClick = (order: any) => {
    setSelectedOrder(order);
    setTrackingNum(order.tracking_num || "");
    setShippingMethod(order.shipping_method || "CJ대한통운");
    setIsDetailOpen(true);
  };

  const handleUpdateShipping = async () => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/business/orders/${selectedOrder.order_id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          order_status_code: "1600000004", // 배송 완료(정산 확정 연동)
          shipping_method: shippingMethod,
          tracking_num: trackingNum
        })
      });

      if (res.ok) {
        alert("배송 처리가 완료되었습니다.");
        setIsDetailOpen(false);
        fetchOrders(); // Refresh list
      } else {
        const err = await res.json();
        alert(`처리 실패: ${err.detail}`);
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_id.toString().includes(searchTerm) ||
    (o.order_status_code && o.order_status_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8 border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <ClipboardList className="h-4 w-4" /> Order Management
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            정식 발주서(PO) 관리
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            승인된 견적을 바탕으로 생성된 정식 발주 목록 및 생산 현황을 트래킹합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold border-slate-200" onClick={() => fetchOrders()}>
            <History className="mr-2 h-4 w-4" /> 히스토리 검색
          </Button>
          <Button className="font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
            발주 요약 리포트 <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "누적 발주", value: orders.length, icon: Package, color: "text-slate-600", bg: "bg-slate-50" },
          { label: "진행 중", value: orders.filter(o => o.order_status_code === "1600000002" || o.order_status_code === "1600000001").length, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "배송 중", value: orders.filter(o => o.order_status_code === "1600000003").length, icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "완료 건", value: orders.filter(o => o.order_status_code === "1600000004").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</p>
                  <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Area */}
      <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">발주 현황 리스트</CardTitle>
            <CardDescription>목록을 클릭하면 상세 주문 정보 및 트래킹 정보를 확인하실 수 있습니다.</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="발주 번호 또는 상태 검색..."
              className="pl-9 h-10 w-72 bg-slate-50/50 border-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[140px] pl-8 font-black text-[10px] uppercase text-slate-400">발주 번호 / 일자</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-slate-400">주문 개요</TableHead>
                <TableHead className="w-[180px] text-right font-black text-[10px] uppercase text-slate-400">발주 총액</TableHead>
                <TableHead className="w-[150px] text-center font-black text-[10px] uppercase text-slate-400">진행 상태</TableHead>
                <TableHead className="w-[120px] pr-8 text-right font-black text-[10px] uppercase text-slate-400">상세 보기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-sm text-slate-400 italic">데이터를 불러오는 중입니다...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                      <ClipboardList className="h-12 w-12 mb-2 opacity-20" />
                      <p className="text-sm font-bold">표시할 발주 내역이 없습니다.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow 
                    key={order.order_id} 
                    className="group cursor-pointer hover:bg-slate-50/50 transition-all border-b border-slate-50 h-20"
                    onClick={() => handleRowClick(order)}
                  >
                    <TableCell className="pl-8">
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 group-hover:text-primary transition-colors">PO-{String(order.order_id).padStart(6, '0')}</div>
                        <div className="text-[11px] font-bold text-slate-400">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {order.items?.length || 0}개 품목 외
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">배송방법: {order.shipping_method || "협의 중"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-base font-black text-slate-900">
                        {order.currency} {Number(order.total_amount).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-[10px] font-black px-3 py-1 border-none shadow-none rounded-md", orderStatusStyles[order.order_status_code || "Pending"])}>
                        {orderStatusLabels[order.order_status_code || "Pending"]}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="h-4 w-4 text-slate-300" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto p-0 border-l-0 shadow-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>발주서 상세</SheetTitle>
            <SheetDescription>Order Details</SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="flex flex-col h-full bg-white">
              {/* Header */}
              <div className="p-8 bg-slate-50 border-b">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="outline" className="font-mono text-[11px] font-black border-slate-200 uppercase tracking-widest px-3">
                    Formal Purchase Order
                  </Badge>
                  <Badge className={cn("font-black text-xs px-4 py-1 border-none shadow-none", orderStatusStyles[selectedOrder.order_status_code || "Pending"])}>
                    {orderStatusLabels[selectedOrder.order_status_code || "Pending"]}
                  </Badge>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
                  PO-{String(selectedOrder.order_id).padStart(6, '0')}
                </h2>
                <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 발주일: {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> 선적방식: {selectedOrder.shipping_method || "Pending"}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">발주 품목 내역 (Order Items)</h3>
                  <div className="border rounded-2xl overflow-hidden border-slate-100">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="font-bold text-[10px] text-slate-400">품목 정보</TableHead>
                          <TableHead className="w-[100px] text-center font-bold text-[10px] text-slate-400">수량</TableHead>
                          <TableHead className="w-[120px] text-right font-bold text-[10px] text-slate-400">단가</TableHead>
                          <TableHead className="w-[120px] text-right font-bold text-[10px] text-slate-400">소계</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedOrder.items && selectedOrder.items.length > 0) ? (
                          selectedOrder.items.map((item: any, i: number) => (
                            <TableRow key={i} className="border-b border-slate-50">
                              <TableCell className="font-bold text-sm text-slate-700">Product #{item.product_id}</TableCell>
                              <TableCell className="text-center font-mono font-bold text-slate-600">{item.quantity.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-bold text-slate-600">{Number(item.unit_price_at_order).toLocaleString()}</TableCell>
                              <TableCell className="text-right font-black text-slate-900">{Number(item.subtotal).toLocaleString()}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-20 text-center text-xs text-slate-400 italic">품목 정보가 없습니다.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">총 발주 금액 (TOTAL DUE)</span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">결제 대기</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-4xl font-black">
                      {selectedOrder.currency} {Number(selectedOrder.total_amount).toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 text-right opacity-60">
                      정산 단계에서 상세 비용(VAT, 수수료) 확인 가능합니다.
                    </p>
                  </div>
                </div>

                {/* 4. Shipping Info (Summary - Shown for all once shipped) */}
                {(selectedOrder.tracking_num || selectedOrder.shipping_method) && (
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100/50 space-y-2">
                    <label className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 italic">
                      <Truck className="h-3 w-3" /> Shipping Information
                    </label>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-700">{selectedOrder.shipping_method}</span>
                      <span className="font-mono text-blue-700 font-black">{selectedOrder.tracking_num}</span>
                    </div>
                  </div>
                )}

                {/* 5. Manufacturer Actions (Quick Complete) */}
                {isManufacturer && selectedOrder.order_status_code !== "1600000004" && (
                  <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-6 shadow-2xl border border-white/5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        발주 완료 처리
                      </h3>
                      <p className="text-xs text-slate-400">완료 버튼을 누르면 즉시 배송 완료 및 정산 확정 상태로 전환됩니다.</p>
                    </div>

                    <Button 
                      onClick={handleUpdateShipping}
                      disabled={updating}
                      className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg border-none transition-all active:scale-95"
                    >
                      {updating ? "처리 중..." : "위 내용으로 발주 완료 확정"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-8 border-t mt-auto grid grid-cols-2 gap-4 bg-slate-50/50">
                <Button variant="outline" className="h-12 border-slate-200 font-bold">
                  PDF 발주서 다운로드
                </Button>
                {selectedOrder.order_status_code !== "1600000004" ? (
                  <Button 
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    onClick={handleUpdateShipping}
                  >
                    발주완료(배송완료) <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={() => router.push("/business/settlement")}
                  >
                    정산 내역 확인 <ExternalLink className="ml-2 h-4 w-4" />
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
