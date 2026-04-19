"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beaker,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Building2,
  Bell,
  User,
  Search,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

const menuStructure = [
  {
    title: "홈",
    icon: LayoutDashboard,
    items: [
      { name: "쇼룸", href: "/partners", desc: "입점 업체 목록 및 상세 프로필" },
      { name: "대시보드", href: "/dashboard", desc: "전체 진행 현황 및 주요 지표 요약" },
    ],
  },
  {
    title: "개발센터",
    icon: FileText,
    items: [
      { name: "개발 제안", href: "/development/inquiries", desc: "" },
      { name: "개발 진행", href: "/development/projects", desc: "" },
      // { name: "용기 관리", href: "/development/packaging", desc: "" },
      // { name: "적합 테스트", href: "/development/compliance", desc: "" },
    ],
  },
  {
    title: "AI 컨설팅",
    icon: Beaker,
    items: [
      { name: "AI 컨설턴트", href: "/ai-rd/consulting", desc: "맞춤형 개발 전략 및 추천 리포트" },
      { name: "AI 디지털 조색", href: "/ai-rd/color", desc: "색차 계산 및 표준 색상 관리" },
      { name: "AI 포뮬러 랩", href: "/ai-rd/library", desc: "지능형 제형 처방 및 성분 최적화 라이브러리" },
    ],
  },
  {
    title: "매칭",
    icon: TrendingUp,
    items: [
      { name: "의뢰", href: "/business/showroom", desc: "신제품 발주 및 견적 의뢰" },
      { name: "견적", href: "/business/quotation", desc: "MOQ 기반 단가 시뮬레이션" },
      { name: "발주", href: "/business/orders", desc: "견적 승인 여부 및 정식 발주서(PO) 관리" },
      { name: "정산", href: "/business/settlement", desc: "글로벌 정산 및 환율 데이터" },
      { name: "AI 비즈니스", href: "/business/copilot", desc: "매출 및 발주 데이터 지능형 분석" },
      // { name: "물류", href: "/business/logistics", desc: "생산 일정 및 배송 트래킹" },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("user_type");
      if (!token) {
        setUser(null);
        return;
      }

      let url = `${API_BASE_URL}/api/v1/account/me`;
      if (userType === "company_user") {
        url = `${API_BASE_URL}/api/v1/account/company-users/me`;
      }

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name, email: data.email });
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUser();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-between px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2 mr-4">
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              COSMETICS B2B
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground lg:hidden">MENU</span>

            <NavigationMenu className="flex font-semibold" viewport={false}>
              <NavigationMenuList>
                {menuStructure.map((group) => (
                  <NavigationMenuItem key={group.title}>
                    <NavigationMenuTrigger className="bg-transparent text-sm font-medium h-7 px-4">
                      <group.icon className="mr-2 h-4 w-4" />
                      {group.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="flex flex-row gap-1 py-1 px-2 w-max">
                        {group.items.map((item) => (
                          <ListItem
                            key={item.name}
                            title={item.name}
                            href={item.href}
                          >
                            {item.desc}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden xl:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-48 rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all focus:w-64"
            />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 hover:bg-muted">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user ? `${user.name} 님` : "로그인 필요"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || "로그인 해주세요"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" /> 마이페이지
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4" /> 소속 업체 관리
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user_type");
                    window.location.href = "/";
                  }}
                >
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none rounded-md py-0.5 px-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
