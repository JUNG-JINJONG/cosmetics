"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import { 
  Palette, 
  FlaskConical, 
  History, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  TrendingUp, 
  Droplet,
  Info,
  ChevronRight,
  RefreshCw,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ColorMaster {
  color_id: number;
  product_id: number;
  color_name: string;
  hex_code: string;
  lab_l: number;
  lab_a: number;
  lab_b: number;
  tolerance: number;
}

interface Measurement {
  measurement_id: number;
  color_id: number;
  measured_l: number;
  measured_a: number;
  measured_b: number;
  delta_e: number;
  is_pass: boolean;
  measured_at: string;
  notes?: string;
}

export default function DigitalColorLabPage() {
  const [masters, setMasters] = useState<ColorMaster[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<ColorMaster | null>(null);
  const [history, setHistory] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New Measurement Form
  const [form, setForm] = useState({
    l: "",
    a: "",
    b: "",
    notes: ""
  });

  // 1. 표준 색상 목록 조회
  async function fetchMasters() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai-rd-color/masters`);
      if (res.ok) {
        const data = await res.json();
        setMasters(data);
      }
    } catch (error) {
      console.error("Failed to fetch color masters", error);
    }
  }

  // 2. 측정 이력 조회
  async function fetchHistory(colorId: number) {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/ai-rd-color/measurements/history/${colorId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  }

  // 3. 실시간 측정값 추가
  async function handleMeasure() {
    if (!selectedMaster) {
      alert("좌측 목록에서 먼저 분석할 '표준 색상'을 선택해주세요!");
      return;
    }
    
    if (!form.l || !form.a || !form.b) {
      alert("L, a, b 측정값을 모두 입력해주세요.");
      return;
    }

    try {
      // 실제 데이터 백엔드 요청
      const res = await fetch(`${API_BASE_URL}/api/v1/ai-rd-color/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color_id: selectedMaster.color_id,
          measured_l: parseFloat(form.l),
          measured_a: parseFloat(form.a),
          measured_b: parseFloat(form.b),
          notes: form.notes
        })
      });

      if (res.ok) {
        fetchHistory(selectedMaster.color_id);
        setForm({ l: "", a: "", b: "", notes: "" });
      }
    } catch (error) {
      console.error("Failed to save measurement", error);
    }
  }

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    if (selectedMaster) {
      fetchHistory(selectedMaster.color_id);
    }
  }, [selectedMaster]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Palette className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">AI Digital Color Lab</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            실시간 색차 분석 대시보드
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            표준 색상 데이터(CIELAB)와 실시간 측정값을 비교하여 브랜드 정체성을 유지하기 위한 정밀 색차 분석을 수행합니다.
          </p>
        </div>
        {/* 임시 버튼 비활성화 (부장님 요청)
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 border-slate-200" onClick={() => fetchMasters()}>
            <RefreshCw className="mr-2 h-4 w-4" /> 데이터 동기화
          </Button>
          <Button className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all hover:scale-[1.02]">
            <Plus className="mr-2 h-4 w-4" /> 새 표준 색상 등록
          </Button>
        </div>
        */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Selection & Input */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Selector */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 pb-4 text-center">
              <CardTitle className="text-sm font-bold flex items-center justify-center gap-2">
                <Search className="h-4 w-4 text-blue-500" /> 표준 색상 라이브러리 (100+)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1 max-h-[240px] overflow-y-auto custom-scrollbar">
              {masters.map((master) => (
                <button
                  key={master.color_id}
                  onClick={() => setSelectedMaster(master)}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-xl transition-all border text-left group",
                    selectedMaster?.color_id === master.color_id
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800 border-transparent text-slate-700 dark:text-zinc-300"
                  )}
                >
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-inner shrink-0" 
                    style={{ backgroundColor: master.hex_code }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-sm truncate">{master.color_name}</div>
                    <div className={cn(
                      "text-[10px] uppercase font-mono",
                      selectedMaster?.color_id === master.color_id ? "text-blue-100" : "text-muted-foreground"
                    )}>
                      L: {master.lab_l} a: {master.lab_a} b: {master.lab_b}
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    selectedMaster?.color_id === master.color_id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                  )} />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* 2. Measurement Input */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-blue-500" /> 실시간 측정 데이터 입력
              </CardTitle>
              <CardDescription className="text-[10px]">색차계(Spectrophotometer)에서 측정된 LAB 값을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">L* (명도)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-10 text-center font-mono font-bold"
                    value={form.l}
                    onChange={(e) => setForm({...form, l: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">a* (Red/Green)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-10 text-center font-mono font-bold"
                    value={form.a}
                    onChange={(e) => setForm({...form, a: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">b* (Yellow/Blue)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-10 text-center font-mono font-bold"
                    value={form.b}
                    onChange={(e) => setForm({...form, b: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">측성 비고 (Batch No/Line)</label>
                <Input 
                  placeholder="예: Batch #A22-01 / Line 4" 
                  className="h-10 text-xs"
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                />
              </div>
              <Button 
                disabled={!selectedMaster || !form.l} 
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold"
                onClick={handleMeasure}
              >
                측정 및 Delta E 분석 실행
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Dashboard Results */}
        <div className="lg:col-span-8 space-y-6">
          {selectedMaster ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 border-l-4 border-l-blue-600">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">표준 색상 정보</p>
                      <h4 className="text-base font-bold dark:text-zinc-100">{selectedMaster.color_name}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-xl shadow-inner border border-white" style={{ backgroundColor: selectedMaster.hex_code }} />
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">허용 오차 (Tolerance)</p>
                      <h4 className="text-xl font-black text-blue-600">$\Delta E$ {selectedMaster.tolerance}</h4>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 border-l-4 border-l-emerald-500">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">최근 합격률</p>
                      <h4 className="text-xl font-black text-emerald-600">92.5%</h4>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </CardContent>
                </Card>
              </div>

              {/* Measurement History Table */}
              <Card className="border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-white dark:bg-zinc-900 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">측정 이력 및 색차 분석</CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px]">{history.length}회 측정됨</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-zinc-800/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">측정 일시</th>
                          <th className="px-4 py-3 text-center">측정 데이터 (L* a* b*)</th>
                          <th className="px-4 py-3 text-center">색차 ($\Delta E$)</th>
                          <th className="px-4 py-3 text-center">판정</th>
                          <th className="px-4 py-3 text-left">측성 비고</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {history.map((log) => (
                          <tr key={log.measurement_id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-4 text-xs font-medium text-slate-500">
                              {new Date(log.measured_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="font-mono text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                {log.measured_l} / {log.measured_a} / {log.measured_b}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn(
                                  "text-lg font-black",
                                  log.delta_e <= selectedMaster.tolerance ? "text-slate-900 dark:text-zinc-100" : "text-rose-600"
                                )}>
                                  {Number(log.delta_e).toFixed(3)}
                                </span>
                                <div className="text-[9px] text-muted-foreground font-bold italic line-through decoration-blue-200 decoration-2">
                                  Base: {selectedMaster.tolerance}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {log.is_pass ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 font-bold px-3">
                                  PASS
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800 font-bold px-3">
                                  FAIL
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-600 dark:text-zinc-400">
                              {log.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-md bg-slate-900 text-white">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                       <Droplet className="h-4 w-4 text-blue-400" /> 시각적 색차 비교 (Visual Diff)
                    </h3>
                    <div className="flex items-center justify-between gap-8 py-4">
                      <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-full h-24 rounded-2xl shadow-2xl border-2 border-white/20" style={{ backgroundColor: selectedMaster.hex_code }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Standard</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">VS</div>
                        <div className="h-8 w-1 bg-white/10 rounded-full" />
                      </div>
                      <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-full h-24 rounded-2xl shadow-2xl border-2 border-white/20 bg-slate-800 flex items-center justify-center overflow-hidden">
                          {/* 실측 시뮬레이션: 일단 같은 색으로 보여주거나 LAB -> HEX 변환 필요 */}
                          <div className="text-[10px] font-bold text-slate-500">Live Sample</div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Measurement</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                  <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold">Delta E ($\Delta E$) 란?</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          두 색상 간의 거리를 수치로 나타낸 것으로, 보통 **Delta E &lt; 1.0**은 사람의 눈으로 전혀 구분할 수 없는 수준이며, **2.0 이내**를 화장품 품질 합격 범위로 권장합니다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
               <Palette className="h-16 w-16 text-slate-200 mb-6 animate-pulse" />
               <h3 className="text-xl font-black tracking-tight text-slate-400">분석할 표준 색상을 선택하세요.</h3>
               <p className="text-sm text-slate-400 mt-2 text-center">좌측 목록에서 제품의 표준(Standard) 색상을 선택하면 <br />실시간 분석 대시보드가 활성화됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
