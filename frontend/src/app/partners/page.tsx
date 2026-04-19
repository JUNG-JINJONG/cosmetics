"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Award,
  ChevronRight,
  Sparkles,
  SearchCode
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-config";

interface Company {
  company_id: number;
  company_name: string;
  specialty: string;
  logo_url: string;
  banner_image_url: string;
  introduction: string;
  address: string;
  is_verified: boolean;
  certifications: string[];
}

export default function ShowroomListPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("전체");

  const specialties = ["전체", "스킨케어", "색조", "비건", "기능성", "마스크팩"];

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const url = new URL(`${API_BASE_URL}/api/v1/business/partners/`);
        if (searchTerm) url.searchParams.append("search", searchTerm);
        if (selectedSpecialty !== "전체") url.searchParams.append("specialty", selectedSpecialty);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [searchTerm, selectedSpecialty]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 1. Hero Section */}
      <div className="bg-slate-900 text-white py-20 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="mb-4 bg-blue-600 border-none px-3 py-1 font-black text-[10px] tracking-widest uppercase">
            Top-Tier Manufacturers
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter mb-4 leading-tight">
            당신의 브랜드를 완성할 <br />
            최고의 <span className="text-blue-400">쇼룸</span>을 만나보세요.
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
            검증된 제조사들의 전문 기술과 포트폴리오를 한눈에 확인하고, <br />
            비즈니스 목적에 최적화된 최상의 파트너를 검색하세요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-0 pb-20">
        {/* 2. Control Bar (Search & Filter) */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 mb-12 flex flex-col md:flex-row gap-4 items-center border border-slate-100">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              placeholder="업체명, 전문 분야, 혹은 핵심 키워드를 입력하세요..." 
              className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-medium focus-visible:ring-2 focus-visible:ring-blue-600 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar max-w-full">
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSpecialty(s)}
                className={cn(
                  "px-6 h-12 rounded-xl text-sm font-black transition-all whitespace-nowrap",
                  selectedSpecialty === s 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Company Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center px-2">
              <p className="text-sm font-bold text-slate-500">
                검색 결과 <span className="text-blue-600">{companies.length}</span>개의 제조사
              </p>
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <Filter className="h-3 w-3" /> 추천순
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {companies.map((company) => (
                <Link href={`/partners/${company.company_id}`} key={company.company_id}>
                   <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white hover:-translate-y-2">
                      <CardContent className="p-0 relative">
                         {/* Banner Image */}
                         <div className="h-44 w-full overflow-hidden relative">
                            <img 
                              src={company.banner_image_url || "/placeholder-banner.jpg"} 
                              alt="banner"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-[1px] group-hover:blur-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {company.is_verified && (
                              <Badge className="absolute top-4 right-4 bg-emerald-500/90 text-white border-none backdrop-blur-md px-3 font-black text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> VERIFIED
                              </Badge>
                            )}
                         </div>

                         {/* Logo (Floats) */}
                         <div className="absolute top-32 left-8 w-20 h-20 rounded-3xl bg-white p-1 shadow-2xl group-hover:rotate-3 transition-transform">
                            <img 
                              src={company.logo_url || "/placeholder-logo.jpg"} 
                              alt="logo" 
                              className="w-full h-full object-cover rounded-[1.25rem]"
                            />
                         </div>

                         {/* Content */}
                         <div className="pt-12 px-8 pb-8 space-y-4">
                            <div>
                               <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                  {company.company_name}
                                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                               </h3>
                               <p className="text-xs font-bold text-blue-600 uppercase tracking-tight flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" /> {company.specialty}
                               </p>
                            </div>

                            <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2 h-10">
                               {company.introduction || "제조사 상세 소개를 준비 중입니다."}
                            </p>

                            <div className="flex flex-wrap gap-1.5 pt-2">
                               {company.certifications?.slice(0, 3).map((cert, i) => (
                                 <Badge key={i} variant="outline" className="text-[9px] font-black border-slate-100 text-slate-400 rounded-lg">
                                    {cert}
                                 </Badge>
                               ))}
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 text-[11px] font-bold text-slate-400 mt-4">
                               <MapPin className="h-3 w-3" />
                               <span className="truncate">{company.address}</span>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </Link>
              ))}
            </div>
            
            {companies.length === 0 && (
              <div className="py-40 text-center space-y-4">
                 <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchCode className="h-10 w-10 text-slate-300" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800">매칭되는 제조사가 없습니다.</h2>
                 <p className="text-slate-400 font-bold">다른 검색어나 카테고리를 시도해 보세요.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
