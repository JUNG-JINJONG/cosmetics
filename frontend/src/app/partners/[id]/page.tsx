"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Award, 
  ChevronLeft,
  ArrowRight,
  Package,
  Factory,
  MessageSquare,
  ShieldCheck,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Product {
  product_id: number;
  product_name: string;
  category_name?: string;
  description: string;
}

interface Brand {
  brand_id: number;
  brand_name: string;
  products: Product[];
}

interface Company {
  company_id: number;
  company_name: string;
  specialty: string;
  logo_url: string;
  banner_image_url: string;
  introduction: string;
  address: string;
  factory_address?: string;
  contact_phone: string;
  contact_email: string;
  certifications: string[];
  is_verified: boolean;
  brands: Brand[];
}

export default function PartnerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/business/partners/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCompany(data);
        }
      } catch (error) {
        console.error("Detail fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center gap-4 text-slate-400">
        <Building2 className="h-12 w-12" />
        <p className="font-black text-sm tracking-widest uppercase">Showroom Loading...</p>
      </div>
    </div>
  );

  if (!company) return <div>Company not found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex justify-between items-center pointer-events-none">
        <Button 
          variant="secondary" 
          className="rounded-full bg-white/90 backdrop-blur-md shadow-lg pointer-events-auto h-12 w-12 p-0 group"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
        </Button>
        <div className="flex gap-2 pointer-events-auto">
           <Button className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black px-6 shadow-xl shadow-blue-200">
              프로젝트 제안하기
           </Button>
        </div>
      </div>

      {/* 2. Hero Image Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={company.banner_image_url || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1600&q=80"} 
          alt="banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        
        {/* Profile Identity Card (Overlay) */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-8 pb-12 translate-y-1/2">
           <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Building2 className="h-40 w-40" />
              </div>

              <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl shrink-0 group hover:rotate-6 transition-transform">
                <img 
                  src={company.logo_url || "https://via.placeholder.com/200"} 
                  alt="logo" 
                  className="w-full h-full object-cover rounded-[2rem]"
                />
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
                   <h1 className="text-4xl font-black tracking-tighter text-slate-900">{company.company_name}</h1>
                   {company.is_verified && (
                     <Badge className="bg-emerald-100 text-emerald-700 border-none font-black px-3 py-1 text-xs mx-auto md:mx-0">
                       <ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED PARTNER
                     </Badge>
                   )}
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-slate-500 font-bold text-sm">
                   <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-blue-500" /> {company.address}</div>
                   <div className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-blue-500" /> {company.contact_email}</div>
                   <div className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-blue-500" /> {company.contact_phone}</div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                   <Badge variant="outline" className="h-7 border-blue-100 text-blue-600 bg-blue-50/50 font-black px-4">{company.specialty}</Badge>
                   {company.certifications?.map((cert, k) => (
                     <Badge key={k} variant="outline" className="h-7 border-slate-200 text-slate-400 font-bold px-4">{cert}</Badge>
                   ))}
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Main Content (Margin for head overlay) */}
      <div className="max-w-7xl mx-auto px-8 pt-48 pb-32">
        <Tabs defaultValue="overview" className="space-y-12">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-full md:w-auto">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg">개요 (Overview)</TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg">포트폴리오 (Portfolio)</TabsTrigger>
            <TabsTrigger value="infra" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg">생산 시설 (Facilities)</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-6">
                   <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-1 bg-blue-600 rounded-full" /> 기업 소개
                   </h2>
                   <p className="text-lg text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                      {company.introduction}
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <QuickStat cardIcon={CheckCircle2} label="프로젝트 성공률" value="98.5%" />
                   <QuickStat cardIcon={Star} label="바이어 평점" value="4.9 / 5.0" />
                   <QuickStat cardIcon={Package} label="생산 가능 품목" value="1,200+" />
                   <QuickStat cardIcon={Award} label="보유 특허" value="24개" />
                </div>
             </div>
          </TabsContent>

          <TabsContent value="portfolio" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                   <div className="h-8 w-1 bg-blue-600 rounded-full" /> 생산 제품 포트폴리오
                </h2>
                <p className="text-slate-400 font-bold mt-2">이 제조사가 그동안 개발 및 생산한 대표 제품들입니다.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {company.brands?.flatMap(b => b.products).map((product, i) => (
                   <Card key={i} className="group border-none shadow-xl hover:shadow-2xl transition-all rounded-3xl overflow-hidden bg-white border border-slate-50">
                      <div className="h-64 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent">
                            <Button className="w-full bg-white text-black font-black text-xs h-10 rounded-xl">샘플 요청</Button>
                         </div>
                         <Package className="h-16 w-16 text-slate-200 group-hover:scale-110 transition-transform" />
                      </div>
                      <CardContent className="p-6">
                         <Badge className="mb-2 bg-blue-50 text-blue-600 border-none font-black text-[10px]">{product.category_name || "스킨케어"}</Badge>
                         <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase">{product.product_name}</h4>
                         <p className="text-xs text-slate-400 font-medium mt-1 truncate">{product.description}</p>
                      </CardContent>
                   </Card>
                ))}
                {(!company.brands || company.brands.length === 0) && (
                   <div className="col-span-full py-32 text-center text-slate-300 font-black italic border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                      등록된 포트폴리오가 없습니다.
                   </div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="infra" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-8">
                   <Card className="border-none bg-slate-50 rounded-3xl p-8">
                      <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                           <Factory className="h-6 w-6 text-blue-600" /> 공장 정보
                        </CardTitle>
                      </CardHeader>
                      <div className="space-y-4 text-sm font-bold">
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400">생산 거점</span>
                          <span className="text-slate-900">{company.factory_address || company.address}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400">스마트 팩토리</span>
                          <span className="text-emerald-600">도입 완료 (Level 3)</span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="text-slate-400">생산 라인수</span>
                          <span className="text-slate-900">12개 라인</span>
                        </div>
                      </div>
                   </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                   <h2 className="text-2xl font-black text-slate-900">주요 보유 설비 및 기술</h2>
                   <div className="grid grid-cols-2 gap-4">
                      {["무균 충전 시스템", "고점도 교반기 (2T)", "자동 라벨링 라인", "실시간 품질 모니터링", "초순수 정제 설비"].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all">
                           <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">{i+1}</div>
                           <span className="font-black text-slate-700">{item}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 4. Footer CTA */}
      <div className="bg-slate-900 py-20 px-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <Building2 className="w-full h-full -rotate-12 translate-y-1/2 scale-150" />
        </div>
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
           <h2 className="text-4xl font-black tracking-tighter uppercase whitespace-pre-wrap">
              LET'S CREATE YOUR <br /> <span className="text-blue-400 italic">NEXT K-BEAUTY REVOLUTION</span>
           </h2>
           <p className="text-slate-400 font-bold text-lg">
              {company.company_name}의 기술력과 당신의 아이디어가 만나면 예술이 됩니다. <br />
              지금 바로 비즈니스 미팅을 요청하세요.
           </p>
           <Button className="bg-white text-black hover:bg-slate-200 h-16 px-10 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-white/10 group">
              업체 컨택 및 문의하기 <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
           </Button>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ cardIcon: Icon, label, value }: any) {
  return (
    <Card className="border-none bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all rounded-3xl p-6 group">
       <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-white group-hover:bg-blue-600 transition-colors p-3 rounded-2xl shadow-md border border-slate-100">
             <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
          </div>
       </div>
    </Card>
  );
}
