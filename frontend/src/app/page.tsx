"use client";
import { API_BASE_URL } from "@/lib/api-config";

import { 
  ArrowRight, 
  Beaker, 
  TrendingUp, 
  ShieldCheck, 
  Building,
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleManufacturerLogin = async () => {
    try {
      const formData = new URLSearchParams();
      // 테스트용 계정: user1@company.com / password123
      formData.append("username", "user1@company.com");
      formData.append("password", "password123");

      const res = await fetch(`${API_BASE_URL}/api/v1/account/company-users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // 토큰 저장 및 대시보드 이동
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_type", "company_user");
        router.push("/partners");
      } else {
        alert("제조사 로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Manufacturer Login Error:", error);
      alert("백엔드 서버 연결에 실패했습니다.");
    }
  };

  const handleBuyerLogin = async () => {
    try {
      const formData = new URLSearchParams();
      // 테스트용 바이어 계정: seoyeon.kim@glowtheory.com / password123
      formData.append("username", "seoyeon.kim@glowtheory.com");
      formData.append("password", "password123");

      const res = await fetch(`${API_BASE_URL}/api/v1/account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_type", "buyer");
        router.push("/partners");
      } else {
        alert("바이어 로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Buyer Login Error:", error);
      alert("백엔드 서버 연결에 실패했습니다.");
    }
  };

  const handleAdminLogin = async () => {
    try {
      const formData = new URLSearchParams();
      // 테스트용 관리자 계정: admin@cosmetics.com / password123
      formData.append("username", "admin@cosmetics.com");
      formData.append("password", "password123");

      const res = await fetch(`${API_BASE_URL}/api/v1/account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_type", "admin");
        router.push("/partners");
      } else {
        alert("관리자 로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      alert("백엔드 서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-border py-20">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Next-Gen Cosmetics <br />
            <span className="text-primary italic">ODM/OEM Partner</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            AI 기반 데이터 분석과 정밀한 브랜드 매칭을 통해 
            성공적인 화장품 비즈니스의 새로운 표준을 제시합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
              onClick={handleManufacturerLogin}
            >
              <Building className="mr-2 h-4 w-4" /> 제조사로그인
            </Button>
            <Button 
              size="lg" 
              className="px-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 min-w-[160px]"
              onClick={handleBuyerLogin}
            >
              <User className="mr-2 h-4 w-4" /> 바이어로그인
            </Button>
            {/* 
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 border-slate-200 min-w-[160px]"
              onClick={handleAdminLogin}
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> 관리자
            </Button>
            */}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:shadow-lg dark:bg-zinc-900/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Partner Showroom</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              검증된 글로벌 제조사들의 포트폴리오를 확인하고 직접 소통하세요.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:shadow-lg dark:bg-zinc-900/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <Beaker className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI R&D Lab</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              데이터 기반의 지능형 성분 조합과 처방 추천 서비스를 경험하세요.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:shadow-lg dark:bg-zinc-900/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Market Insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              실시간 시장 트렌드와 데이터 분석 리포트를 통해 전략을 수립하세요.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:shadow-lg dark:bg-zinc-900/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">QA/QC Control</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              디지털 성적서 발행부터 품질 관리까지 모든 공정을 트래킹합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Status Preview (Placeholder for API Integration) */}
      <section className="container px-4 mt-4">
        <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">진행 중인 프로젝트</h2>
            <Button variant="link">전체 보기</Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <div>
                  <div className="font-bold">미백 수분 크림 개발 프로젝트</div>
                  <div className="text-xs text-muted-foreground">Manufacturer: Cosmax | Last Updated: 2 hours ago</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">R&D Formulation</div>
            </div>
            {/* more items... */}
          </div>
        </div>
      </section>
    </div>
  );
}
