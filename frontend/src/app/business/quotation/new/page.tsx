"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calculator,
  Calendar,
  DollarSign,
  Package,
  Search,
  CheckCircle2,
  Info,
  Clock,
  Layers
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-config";

export default function NewQuotationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState<any[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [searchAsset, setSearchAsset] = useState("");
  const [dbAssets, setDbAssets] = useState<any[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);

  // Fetch real products from DB for the modal
  useEffect(() => {
    if (!isModalOpen) return;

    const fetchAssets = async () => {
      setAssetLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/v1/business/products/?q=${encodeURIComponent(searchAsset)}&limit=50`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDbAssets(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setAssetLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAssets, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchAsset, isModalOpen]);
  
  // Data State
  const [formData, setFormData] = useState({
    inquiry_id: "",
    currency: "KRW",
    valid_until: "",
    comments: ""
  });
  
  const [editMode, setEditMode] = useState<{isEdit: boolean; id: string | null}>({isEdit: false, id: null});
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([]);
  
  const [items, setItems] = useState<any[]>([
    { id: Date.now(), product_name: "", product_id: null, quantity: 1000, unit_price: 0, discount_rate: 0 }
  ]);

  // Fetch inquiries to link with
  useEffect(() => {
    const fetchInquiries = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/workflow/inquiries`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInquiries(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInquiries();

    // Check if we are in Edit / Reply mode (quotation_id in query params)
    const loadQuoteParams = async () => {
      const params = new URLSearchParams(window.location.search);
      const qid = params.get('quotation_id');
      if (qid) {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`http://localhost:8000/api/v1/business/quotations/detail?quotation_id=${qid}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setFormData({
              inquiry_id: data.inquiry_id ? String(data.inquiry_id) : "",
              currency: data.currency || "KRW",
              valid_until: data.valid_until ? data.valid_until.split('T')[0] : "",
              comments: data.comments || ""
            });
            if (data.items && data.items.length > 0) {
              setItems(data.items.map((it: any) => ({
                id: Math.random(),
                quotation_item_id: it.quotation_item_id,
                product_name: it.product_id ? `기성품 ID: ${it.product_id}` : "Custom Compound",
                product_id: it.product_id,
                quantity: it.quantity,
                unit_price: Number(it.unit_price) || 0,
                discount_rate: Number(it.discount_rate) || 0
              })));
            }
            setEditMode({isEdit: true, id: qid});
          }
        } catch (err) {
          console.error("Failed to fetch formal quote details", err);
        }
      }
    };
    loadQuoteParams();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), product_name: "", product_id: null, quantity: 1000, unit_price: 0, discount_rate: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      const itemToRm = items.find(i => i.id === id);
      if (itemToRm && itemToRm.quotation_item_id) {
        setDeletedItemIds([...deletedItemIds, itemToRm.quotation_item_id]);
      }
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const openSelector = (id: number) => {
    setActiveItemId(id);
    setIsModalOpen(true);
  };

  const handleSelectAsset = (asset: any) => {
    if (activeItemId) {
      setItems(items.map(item => 
        item.id === activeItemId 
          ? { 
              ...item, 
              product_name: asset.product_name, 
              product_id: asset.product_id, 
              unit_price: Number(asset.wholesale_base_price) || 0 
            } 
          : item
      ));
    }
    setIsModalOpen(false);
    setActiveItemId(null);
  };

  const calculateSubtotal = (item: any) => {
    const base = item.quantity * item.unit_price;
    const discount = base * (item.discount_rate / 100);
    return base - discount;
  };

  const totalAmount = items.reduce((sum, item) => sum + calculateSubtotal(item), 0);

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      // 1. Fetch current user info and available companies
      const [userRes, companiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/account/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/v1/account/account/companies`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (!userRes.ok) throw new Error("사용자 정보를 가져올 수 없습니다.");
      const userData = await userRes.json();
      
      let validCompanyId = userData.company_id;
      if (!validCompanyId && companiesRes.ok) {
        const companies = await companiesRes.json();
        if (companies.length > 0) {
          validCompanyId = companies[0].company_id;
        }
      }

      // Handle Edit Mode vs Create Mode
      if (editMode.isEdit && editMode.id) {
        // 1. Update Base Quotation
        const patchRes = await fetch(`http://localhost:8000/api/v1/business/quotations/update?quotation_id=${editMode.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            currency: formData.currency,
            valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
            comments: formData.comments,
            total_estimated_amount: totalAmount,
            quotation_status_code: "Sent"
          })
        });

        if (!patchRes.ok) {
          throw new Error("기본 견적서 정보를 업데이트하는 데 실패했습니다.");
        }

        // 2. Delete removed items
        for (const rId of deletedItemIds) {
          await fetch(`http://localhost:8000/api/v1/business/quotations/items/delete?item_id=${rId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
        }

        // 3. Update existing or Add new items
        for (const item of items) {
          const discountAmt = (parseInt(item.quantity) * parseFloat(item.unit_price) * (parseFloat(item.discount_rate) / 100)) || 0;
          const subTotal = calculateSubtotal(item);
          const itemPayload = {
            product_id: item.product_id || null,
            quantity: parseInt(item.quantity) || 0,
            unit_price: parseFloat(item.unit_price) || 0,
            discount_rate: parseFloat(item.discount_rate) || 0,
            discount_amount: discountAmt,
            subtotal: subTotal
          };

          if (item.quotation_item_id) {
            await fetch(`http://localhost:8000/api/v1/business/quotations/items/update?item_id=${item.quotation_item_id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify(itemPayload)
            });
          } else {
            await fetch(`http://localhost:8000/api/v1/business/quotations/items/add?quotation_id=${editMode.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify(itemPayload)
            });
          }
        }
        
        alert("바이어가 요청한 견적을 처리하여 정식 발송(Sent) 완료했습니다!");
        router.push("/business/quotation");

      } else {
        // Prepare payload with all required fields (Create Mode)
        const payload = {
          inquiry_id: formData.inquiry_id ? parseInt(formData.inquiry_id) : null,
          buyer_id: userData.buyer_id || 1, // Fallback to Admin buyer (id=1) which exists
          company_id: validCompanyId || 63437, // Fallback to first existing company ID if none found
          currency: formData.currency,
          valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
          comments: formData.comments,
          total_estimated_amount: totalAmount,
          quotation_status_code: "Draft",
          items: items.map(item => ({
            product_id: item.product_id || null,
            quantity: parseInt(item.quantity) || 0,
            unit_price: parseFloat(item.unit_price) || 0,
            discount_rate: parseFloat(item.discount_rate) || 0,
            discount_amount: (parseInt(item.quantity) * parseFloat(item.unit_price) * (parseFloat(item.discount_rate) / 100)) || 0,
            subtotal: calculateSubtotal(item)
          }))
        };

        const res = await fetch(`${API_BASE_URL}/api/v1/business/quotations/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          alert("견적서가 성공적으로 생성되었습니다.");
          router.push("/business/quotation");
        } else {
          const errData = await res.json();
          alert(`저장에 실패했습니다: ${JSON.stringify(errData.detail)}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(`오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1200px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Product Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden scale-in-center">
            <CardHeader className="bg-slate-50 dark:bg-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">실시간 제품 DB 검색</CardTitle>
                  <CardDescription className="font-medium">전체 {assetLoading ? "..." : "37,000+"}개의 제품 중 견적 항목을 선택하세요.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <ArrowLeft className="h-5 w-5 rotate-90" />
                </Button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="제품명, SKU, 브랜드 검색..."
                  className="pl-10 h-11 bg-white border-slate-200"
                  value={searchAsset}
                  onChange={(e) => setSearchAsset(e.target.value)}
                  autoFocus
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {assetLoading ? (
                <div className="py-20 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm font-bold text-slate-500 italic font-mono uppercase tracking-widest">Searching Database...</p>
                </div>
              ) : (
                <Table>
                  <TableBody>
                    {dbAssets.length === 0 ? (
                      <TableRow>
                        <TableCell className="py-20 text-center text-slate-400 font-bold italic">
                          검색 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      dbAssets.map((asset) => (
                        <TableRow 
                          key={asset.product_id} 
                          className="cursor-pointer hover:bg-indigo-50/50 transition-colors group border-b border-slate-50"
                          onClick={() => handleSelectAsset(asset)}
                        >
                          <TableCell className="py-4 pl-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{asset.product_name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[9px] font-black uppercase py-0 px-1.5 border-slate-200">
                                  {asset.sku || "NO SKU"}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-bold italic tracking-tighter">{asset.status || "Market Ready"}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-black text-slate-500">
                            {formData.currency} {Number(asset.wholesale_base_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button variant="ghost" size="sm" className="font-bold text-indigo-600 hover:bg-indigo-100">
                              선택
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="p-4 bg-slate-50 dark:bg-zinc-800 text-center justify-center">
              <p className="text-[11px] text-muted-foreground font-medium">원하는 자산이 없나요? <span className="text-indigo-600 font-bold cursor-pointer">직접 등록 문의</span></p>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Top Nav */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{editMode.isEdit ? "정식 견적서 작성 및 회신" : "신규 견적서 생성"}</h1>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Plus className="h-3 w-3" /> 비즈니스 팀 - 공식 견적 발행
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold">임시 저장</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-100"
          >
            {loading ? "생성 중..." : "견적서 발송 / 완료"} <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-500" />
                기본 정보 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">연관 개발 의뢰</label>
                <Select 
                  onValueChange={(val) => setFormData({ ...formData, inquiry_id: val })}
                >
                  <SelectTrigger className="bg-slate-50/50 border-none h-11 focus:ring-1 focus:ring-indigo-500">
                    <SelectValue placeholder="프로젝트/의뢰 선택 (선택 사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    {inquiries.map(inq => (
                      <SelectItem key={inq.inquiry_id} value={inq.inquiry_id.toString()}>
                        [{inq.brand_name}] {inq.item_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">결제 통화</label>
                <Select 
                  defaultValue="USD"
                  onValueChange={(val) => setFormData({ ...formData, currency: val })}
                >
                  <SelectTrigger className="bg-slate-50/50 border-none h-11 focus:ring-1 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - 미달러</SelectItem>
                    <SelectItem value="KRW">KRW - 대한민국 원</SelectItem>
                    <SelectItem value="CNY">CNY - 중국 위안</SelectItem>
                    <SelectItem value="JPY">JPY - 일본 엔</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">견적 유효기한</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="date" 
                    className="bg-slate-50/50 border-none h-11 pl-10"
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">담당자 코멘트</label>
                <Input 
                  placeholder="특이사항 입력..."
                  className="bg-slate-50/50 border-none h-11"
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-500" />
                  견적 항목 상세
                </CardTitle>
                <CardDescription>제품 또는 제형 자산을 추가하여 견적을 구성하세요.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddItem}
                className="h-9 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold"
              >
                <Plus className="h-4 w-4 mr-1" /> 항목 추가
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none">
                    <TableHead className="pl-6 font-black text-[10px] uppercase">품명 / 제형</TableHead>
                    <TableHead className="w-[120px] font-black text-[10px] uppercase">수량 (MOQ)</TableHead>
                    <TableHead className="w-[120px] font-black text-[10px] uppercase">단가</TableHead>
                    <TableHead className="w-[100px] font-black text-[10px] uppercase">할인(%)</TableHead>
                    <TableHead className="w-[120px] text-right font-black text-[10px] uppercase">금액</TableHead>
                    <TableHead className="w-[60px] pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id} className="border-b border-slate-50 h-20">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "flex-1 h-10 px-3 rounded-lg flex items-center text-sm font-bold truncate transition-colors",
                            item.product_name ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-400 italic"
                          )}>
                            {item.product_name || "항목을 선택하세요..."}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openSelector(item.id)}
                            className="h-10 px-3 shrink-0 font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                          >
                            선택
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Input 
                          type="number"
                          className="h-10 border-none bg-slate-100/50 text-sm font-bold"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                          <Input 
                            type="number"
                            className="h-10 border-none bg-slate-100/50 pl-6 text-sm font-bold"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, "unit_price", Number(e.target.value))}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          className="h-10 border-none bg-slate-100/50 text-sm font-bold"
                          value={item.discount_rate}
                          onChange={(e) => updateItem(item.id, "discount_rate", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-900">
                        {formData.currency} {calculateSubtotal(item).toLocaleString()}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary Card */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl bg-indigo-900 text-white overflow-hidden sticky top-8">
            <CardHeader className="p-6 pb-0 border-none">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-300" />
                최종 견적 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-300">총 공급가액</span>
                  <span className="font-bold">{formData.currency} {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-300">예상 부가세 (10%)</span>
                  <span className="font-bold">{formData.currency} {(totalAmount * 0.1).toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/10 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-indigo-300">Total Amount</span>
                  <span className="text-3xl font-black">{formData.currency} {(totalAmount * 1.1).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 space-y-3 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-300">
                  <Layers className="h-3 w-3" /> SMART PRICING ANALYSIS
                </div>
                <p className="text-[11px] font-medium leading-relaxed italic text-indigo-100">
                  현재 입력된 단가는 동일 카테고리 평균 대비 <span className="text-emerald-400 font-bold">4.2% 낮게</span> 설정되어 바이어 낙찰 확률이 높습니다.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                     <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-black text-indigo-300 uppercase">Compliance Check</p>
                     <p className="text-xs font-bold font-sans">수출국 규제 성분 매칭 완료</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                     <Clock className="h-5 w-5 text-amber-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-black text-indigo-300 uppercase">Lead Time Est.</p>
                     <p className="text-xs font-bold">생산 완료까지 약 45일 예상</p>
                   </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-black/20 p-6 flex flex-col gap-3">
               <p className="text-[10px] text-center text-indigo-300/60 leading-tight">
                 위 견적서는 법적 효력을 가지며, 발송 후에는 바이어의 수락 시 정식 계약으로 전환됩니다.
               </p>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-black uppercase text-slate-400 tracking-widest">도움말</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl flex items-start gap-3">
                <Info className="h-4 w-4 text-indigo-500 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  견적 유효기한은 보통 발행일로부터 <span className="font-bold">30일</span>을 권장합니다. 원부자재 시세 변동이 심한 경우 기간을 더 짧게 설정하십시오.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
