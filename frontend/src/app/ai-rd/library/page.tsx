"use client";

import React, { useState, useEffect } from "react";
import { 
  Beaker, 
  Sparkles, 
  Search, 
  Zap, 
  ArrowRight, 
  Layers, 
  Sliders, 
  Flame, 
  Maximize2,
  Minimize2,
  ChevronDown,
  Info,
  Microscope,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

// 15가지 감성 데이터 속성 정의
const SENSORY_ATTRIBUTES = [
  { id: "absorption", name: "흡수성 (Absorption)", desc: "피부에 스며드는 속도" },
  { id: "adhesion", name: "밀착력 (Adhesion)", desc: "피부 표면에 달라붙는 정도" },
  { id: "afterfeel", name: "사용후감 (Afterfeel)", desc: "바른 뒤 남는 부드러움" },
  { id: "spreadability", name: "발림성 (Spreadability)", desc: "부드럽게 펴 발라지는 정도" },
  { id: "moisture", name: "보습력 (Moisture)", desc: "수분 보충 및 유지력" },
  { id: "oiliness", name: "유분기 (Oiliness)", desc: "기름진 정도" },
  { id: "stickiness", name: "끈적임 (Stickiness)", desc: "손에 묻어나거나 끈적이는 정도" },
  { id: "cooling", name: "쿨링감 (Cooling)", desc: "시원한 청량감" },
  { id: "heaviness", name: "중량감 (Heaviness)", desc: "무겁게 발리는 정도" },
  { id: "softness", name: "부드러움 (Softness)", desc: "결의 매끄러움" },
  { id: "lasting", name: "지속력 (Lasting)", desc: "효과가 유지되는 시간" },
  { id: "firmness", name: "탄력감 (Firmness)", desc: "피부가 팽팽해지는 느낌" },
  { id: "irritation", name: "저자극성 (Low-Irritation)", desc: "자극이 적고 순한 정도" },
  { id: "brightening", name: "광택감 (Brightening)", desc: "윤기와 광이 나는 정도" },
  { id: "opacity", name: "은폐력 (Opacity)", desc: "불투명도 및 커버력" }
];

interface IngredientMatch {
  name: string;
  cas_no?: string;
  similarity: number;
}

interface RecipeResult {
  recommended_ingredients: IngredientMatch[];
  ai_explanation: string;
}

export default function AIFormulaLabPage() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SENSORY_ATTRIBUTES.map(attr => [attr.id, 2.5]))
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

  const handleScoreChange = (id: string, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const generateQueryFromScores = () => {
    const topAttributes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, score]) => {
        const attr = SENSORY_ATTRIBUTES.find(a => a.id === id);
        return `${attr?.name}이 ${score > 3.5 ? '매우 높은' : '우수한'}`;
      });

    return `${topAttributes.join(", ")} 제형의 화장품 처방을 추천해줘.`;
  };

  const handleRecommend = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const query = generateQueryFromScores();
      const res = await fetch(`${API_BASE_URL}/api/v1/ai-rd/recipe-recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          top_k: 7
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Formula recommendation failed", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  // SVG 레이더 차트 계산
  const center = 150;
  const radius = 100;
  const angleStep = (Math.PI * 2) / SENSORY_ATTRIBUTES.length;

  const getPoints = () => {
    return SENSORY_ATTRIBUTES.map((attr, i) => {
      const r = (scores[attr.id] / 5) * radius;
      const x = center + r * Math.sin(i * angleStep);
      const y = center - r * Math.cos(i * angleStep);
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <div className="bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
              <Microscope className="h-5 w-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Advanced R&D System</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            AI 포뮬러 랩 <Badge className="bg-indigo-600 text-[10px] py-0">PRO</Badge>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed text-sm">
            원하는 **감성 수치(Sensory Data)**를 설정하세요. 20만 건 이상의 화장품 데이터베이스를 분석하여 <br />
            가장 유사한 성분 배합비와 제형 정보를 지능적으로 제안합니다.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">AI Node Active</span>
              </div>
              <div className="text-xs font-mono font-bold text-indigo-600">Model: Gemini-Pro-RND</div>
           </div>
           <div className="h-14 px-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
              <span className="text-xs font-black text-slate-700">12,482 Ingredients Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8 xl:gap-5 items-start">
        {/* Left: Visualization (4 columns on PC - stabilized for 1280px) */}
        <div className="lg:col-span-6 xl:col-span-4 space-y-6">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white group border-b-4 border-b-indigo-500">
             <div className="p-5 pb-0 flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-indigo-500" /> 제형 밸런스 시각화
                </h3>
                <Badge variant="outline" className="text-[9px] font-mono">15-DIMENSION VECTOR</Badge>
             </div>
             <div className="flex justify-center p-5">
                <svg width="260" height="260" viewBox="0 0 300 300" className="drop-shadow-2xl">
                   {[1, 2, 3, 4, 5].map(tick => (
                     <polygon 
                        key={tick}
                        points={SENSORY_ATTRIBUTES.map((_, i) => {
                          const r = (tick / 5) * radius;
                          const x = center + r * Math.sin(i * angleStep);
                          const y = center - r * Math.cos(i * angleStep);
                          return `${x},${y}`;
                        }).join(" ")}
                        className="fill-none stroke-slate-100 stroke-1"
                     />
                   ))}
                   {SENSORY_ATTRIBUTES.map((_, i) => (
                     <line 
                        key={i}
                        x1={center} y1={center}
                        x2={center + radius * Math.sin(i * angleStep)}
                        y2={center - radius * Math.cos(i * angleStep)}
                        className="stroke-slate-50 stroke-1"
                     />
                   ))}
                   <polygon 
                      points={getPoints()}
                      className="fill-indigo-500/20 stroke-indigo-500 stroke-2 transition-all duration-300"
                   />
                </svg>
             </div>
          </Card>
        </div>

        {/* Center: Sensory Modeling (3 columns on PC - matching user's compact preference) */}
        <div className="lg:col-span-6 xl:col-span-3 space-y-6">
          <Card className="border-none shadow-2xl overflow-hidden rounded-3xl h-full">
            <CardHeader className="bg-slate-50/50 pb-6 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">감성 모델링</CardTitle>
                <Sliders className="h-6 w-6 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 max-h-[360px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                {SENSORY_ATTRIBUTES.map((attr) => (
                  <div key={attr.id} className="space-y-3 group">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                        {attr.name}
                      </label>
                      <span className="text-[10px] font-black w-8 text-center px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                        {scores[attr.id].toFixed(1)}
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.1"
                      value={scores[attr.id]}
                      onChange={(e) => handleScoreChange(attr.id, parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-6 bg-slate-50/80 border-t flex flex-col items-end">
              <Button 
                onClick={handleRecommend}
                disabled={loading}
                className="w-full xl:w-[60%] h-9 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-lg transition-all"
              >
                {loading ? "분석 중..." : "AI 제안"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Results (5 columns on PC) */}
        <div className="lg:col-span-12 xl:col-span-5">
          {result ? (
            <div className="h-[516px] bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-y-auto flex flex-col custom-scrollbar-white">
               {/* Header within the Indigo Box */}
               <div className="p-8 pb-4 relative z-10 border-b border-white/10 shrink-0">
                  <h4 className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">Coco's AI Pro Advice</h4>
                  <p className="text-lg font-medium leading-relaxed italic text-white/90">"{result.ai_explanation}"</p>
               </div>
               
               {/* Content (Ingredients & Sheet) */}
               <div className="p-8 pt-4 space-y-6 relative z-10">
                  <div className="grid grid-cols-1 gap-4">
                    {result.recommended_ingredients.map((ing, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 hover:bg-white/20 transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="h-8 w-8 bg-indigo-400 text-indigo-900 rounded-lg flex items-center justify-center font-black text-xs shrink-0">{idx+1}</div>
                           <span className="font-bold text-sm">{ing.name}</span>
                           <Badge variant="outline" className="ml-auto text-[9px] border-white/20 text-indigo-100 italic shrink-0">{(ing.similarity * 100).toFixed(0)}% MATCH</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/10 shadow-inner">
                     <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Layers className="h-4 w-4 text-indigo-400" />
                           <span className="font-bold text-sm">AI 최적화 처방 시뮬레이션</span>
                        </div>
                        <Badge className="bg-emerald-500/80 text-white border-none font-bold text-[9px]">STABILITY: EXCELLENT</Badge>
                     </div>
                     <div className="p-6 text-indigo-100 text-[10px] font-mono space-y-2">
                        <div className="flex justify-between"><span>Phase A: Water Base</span><span>72.45%</span></div>
                        <div className="flex justify-between"><span>Phase B: Lipid & Oils</span><span>15.20%</span></div>
                        <div className="flex justify-between text-indigo-400 font-bold border-t border-white/10 pt-3 mt-1"><span>TOTAL CONC.</span><span>100.00%</span></div>
                     </div>
                  </div>
               </div>
               
               {/* Decorative Gradient Overlay */}
               <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-400/20 blur-[80px] rounded-full" />
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
            </div>
          ) : (
            <div className="h-[516px] flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-slate-200 group text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Beaker className="h-10 w-10 text-slate-200 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-400">분석 대기 중</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed">
                좌측에서 감성 속성을 설정한 뒤 <br />
                <strong className="text-slate-500">AI 제안</strong> 버튼을 눌러주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
