"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Sparkles,
  Package,
  Layers,
  Filter,
  Trash2,
  Receipt
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ShowroomPage() {
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});

  const addToCart = (product: any) => {
    const qty = qtyMap[product.product_id] || product.moq || 1000;
    const existing = cartItems.find(item => item.product.product_id === product.product_id);
    if (existing) {
      setCartItems(cartItems.map(item => item.product.product_id === product.product_id ? { ...item, quantity: item.quantity + qty } : item));
    } else {
      setCartItems([...cartItems, { product, quantity: qty }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.product.product_id !== productId));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.quantity * Number(item.product.wholesale_base_price || 0)), 0);

  const submitRfq = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      let buyerId = 1;
      let targetCompanyId = 63437; // Default Fallback
      
      if (token) {
        const [userRes, companiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/account/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/v1/account/account/companies`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.buyer_id) buyerId = userData.buyer_id;
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          if (companiesData && companiesData.length > 0) {
            targetCompanyId = companiesData[0].company_id;
          }
        }
      }

      const payload = {
        inquiry_id: null,
        buyer_id: buyerId,
        company_id: targetCompanyId,
        currency: "KRW",
        comments: "기성품 일괄 견적(RFQ) 요청입니다.",
        total_estimated_amount: cartTotal,
        quotation_status_code: "Requested",
        items: cartItems.map(item => ({
          product_id: item.product.product_id,
          quantity: item.quantity,
          unit_price: Number(item.product.wholesale_base_price || 0),
          discount_rate: 0,
          discount_amount: 0,
          subtotal: item.quantity * Number(item.product.wholesale_base_price || 0)
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "견적 요청 처리에 실패했습니다.");
      }

      alert("제조사에게 일괄 견적서(RFQ) 발송 요청이 성공적으로 접수되었습니다!\n마이페이지에서 상세 견적 상황 및 처리 결과를 확인하실 수 있습니다.");
      setCartItems([]);
      setIsCartOpen(false);
    } catch (error: any) {
      console.error("Submit RFQ error:", error);
      alert("오류가 발생했습니다: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetchCatalog() {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/business/products/?limit=16`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setCatalogProducts(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredProducts = catalogProducts.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            기성품 견적 의뢰 <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            복잡한 개발 과정 없이 제조사가 이미 확보한 완제품/기성 제형 카탈로그를 탐색하고,
            원하는 수량을 입력해 즉시 견적(RFQ)을 요청하세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="제품명, SKU 검색..."
              className="h-10 w-[240px] pl-9 bg-white/50 dark:bg-zinc-950/50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> 장바구니 확인
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] font-bold items-center justify-center animate-out fade-out">
                {cartItems.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "전체 카탈로그", value: "36,439", icon: Layers, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "즉시 생산/출고 가능", value: "1,204", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "내 장바구니 품목", value: cartItems.length.toString(), icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
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
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4 flex items-center gap-2">
        핫 & 트렌딩 품목
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-muted-foreground font-medium">
            기성품 카탈로그를 불러오는 중입니다...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.product_id} className="group overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all h-full flex flex-col">
              <div className="h-44 bg-slate-50 dark:bg-zinc-800/50 relative flex items-center justify-center">
                <Package className="h-16 w-16 text-slate-200 group-hover:scale-110 group-hover:text-amber-400 transition-all duration-300" />
                <Badge variant="secondary" className="absolute top-3 left-3 text-[10px] bg-white/80 backdrop-blur-sm border-none shadow-sm font-bold">
                  {product.sku}
                </Badge>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1.5 flex justify-between">
                    <span>Ready Made</span>
                    <span className="text-slate-400">MOQ {Number(product.moq || 1000).toLocaleString()}</span>
                  </p>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    {product.product_name}
                  </h3>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[11px] text-slate-500 font-bold uppercase">예상 도매가</p>
                    <p className="font-black text-xl text-slate-900 dark:text-white tracking-tight">
                      ₩ {Number(product.wholesale_base_price || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex border rounded-lg h-10 overflow-hidden items-center group-hover:border-amber-200 transition-colors bg-white">
                    <div className="bg-slate-50 px-3 flex items-center text-[11px] font-black text-slate-500 border-r h-full uppercase tracking-widest">
                      Qty
                    </div>
                    <input 
                      type="number" 
                      value={qtyMap[product.product_id] !== undefined ? qtyMap[product.product_id] : (product.moq || 1000)}
                      onChange={(e) => setQtyMap({ ...qtyMap, [product.product_id]: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm font-black text-center focus:outline-none" 
                      min={1} 
                    />
                  </div>
                  <Button
                    className="w-full h-10 text-xs font-bold bg-slate-900 hover:bg-amber-500 text-white transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1.5" /> 장바구니 담기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-8 bg-white/95 backdrop-blur-xl border-l border-slate-100">
          <SheetHeader className="pb-6 border-b border-slate-100">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-amber-500" />
              스마트 견적 장바구니
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              선택하신 기성품들의 수량을 확인하시고 일괄로 견적(RFQ)을 요청하세요.
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <ShoppingCart className="h-16 w-16 text-slate-200" />
                <p className="font-medium text-slate-500">아직 장바구니에 담긴 제품이 없습니다.</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.product.product_id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="h-16 w-16 bg-slate-50 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider mb-1">{item.product.sku}</p>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.product.product_name}</h4>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs font-bold text-slate-500">
                        {item.quantity.toLocaleString()} 개 <span className="font-normal text-[10px]">x ₩{Number(item.product.wholesale_base_price||0).toLocaleString()}</span>
                      </p>
                      <p className="font-black text-slate-900">
                        ₩ {(item.quantity * Number(item.product.wholesale_base_price||0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product.product_id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-slate-500">예상 총 공급가액</span>
              <span className="text-3xl font-black tracking-tight text-slate-900">₩ {cartTotal.toLocaleString()}</span>
            </div>
            <Button 
              className="w-full h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200"
              disabled={cartItems.length === 0 || isSubmitting}
              onClick={submitRfq}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  접수 중...
                </div>
              ) : (
                <>
                  <Receipt className="mr-2 h-5 w-5" /> 제조사에 최종 견적(RFQ) 요청하기
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
