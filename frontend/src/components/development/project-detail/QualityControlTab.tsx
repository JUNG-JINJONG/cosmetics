"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ClipboardCheck, 
  FlaskConical, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  FileText,
  User,
  Activity,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

import { CoAModal } from "./CoAModal";
import { API_BASE_URL } from "@/lib/api-config";

interface QualityControlTabProps {
  projectId: string;
  projectInfo: any;
  isBuyer?: boolean;
}

export const QualityControlTab = ({ projectId, projectInfo, isBuyer = false }: QualityControlTabProps) => {
  const [qcRecords, setQcRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [coaData, setCoaData] = useState<any>(null);
  const [isCoAModalOpen, setIsCoAModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTestType, setNewTestType] = useState("최종 출하 검사");

  useEffect(() => {
    fetchQCRecords();
  }, [projectId]);

  useEffect(() => {
    if (selectedRecord) {
      fetchCoAData(selectedRecord.qc_id);
    }
  }, [selectedRecord]);

  const fetchQCRecords = async (targetId?: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/project-list?project_id=${projectId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQcRecords(data);
        
        // 새로 생성된 항목이 있거나 특정 대상을 선택해야 할 경우
        if (targetId) {
          const newRecord = data.find((r: any) => r.qc_id === targetId);
          if (newRecord) setSelectedRecord(newRecord);
        } else if (data.length > 0 && !selectedRecord) {
          setSelectedRecord(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoAData = async (qcId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/coa/report?qc_id=${qcId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoaData(data);
      } else {
        setCoaData(null);
      }
    } catch (e) {
      setCoaData(null);
    }
  };

  const handleIssueCoA = async () => {
    if (!selectedRecord) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/coa/issue-report?qc_id=${selectedRecord.qc_id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("CoA(시험성적서)가 성공적으로 발행되었습니다.");
        fetchCoAData(selectedRecord.qc_id);
      }
    } catch (e) { console.error(e); }
  };

  const createQCReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project_id: projectId,
          test_type: newTestType,
          inspector_name: "임시 연구원",
          result_status_code: "1400000001" // 검사대기
        })
      });
      if (res.ok) {
        const newRecord = await res.json();
        setShowCreateModal(false);
        // 신규 생성된 ID를 넘겨서 즉시 선택되도록 함
        fetchQCRecords(newRecord.qc_id);
      }
    } catch (e) { console.error(e); }
  };

  const updateItemResult = async (itemId: number, value: string) => {
    if (isBuyer) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/items/result?qc_item_id=${itemId}&actual_value=${value}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchQCRecords(selectedRecord?.qc_id); 
      }
    } catch (e) { console.error(e); }
  };

  const handleInitializeItems = async () => {
    if (!selectedRecord) return;
    try {
      const token = localStorage.getItem("token");
      // 우선 프로젝트 ID를 제품 ID로 간주하여 초기화 시도 (실제 운영 시엔 프로젝트와 연결된 제품 ID 필요)
      // 현재는 테스트를 위해 임시로 product_id=1 등을 사용하거나 백엔드 로직 보강 가능
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/items/initialize?qc_id=${selectedRecord.qc_id}&product_id=1`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchQCRecords(selectedRecord.qc_id);
      } else {
        alert("제품 규격(Spec)이 등록되어 있지 않습니다. (Product ID: 1)");
      }
    } catch (e) { console.error(e); }
  };

  const handleBatchSave = async () => {
    if (!selectedRecord || !selectedRecord.items) return;
    try {
      const token = localStorage.getItem("token");
      const results = selectedRecord.items.map((item: any) => {
        const input = document.getElementById(`input-${item.qc_item_id}`) as HTMLInputElement;
        const check = document.getElementById(`check-${item.qc_item_id}`) as HTMLInputElement;
        
        let val = "";
        if (input) val = input.value;
        else if (check) val = check.checked ? (item.spec_range.includes("동일") ? "동일" : "적합") : "";
        
        return { qc_item_id: item.qc_item_id, actual_value: val };
      });

      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/items/batch-results?qc_id=${selectedRecord.qc_id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(results)
      });
      
      if (res.ok) {
        alert("모든 검사 결과가 저장되었습니다.");
        fetchQCRecords();
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">품질 데이터 로드 중...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {/* Sidebar: Record List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">검사 이력</h3>
          {!isBuyer && (
            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {qcRecords.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-2xl text-slate-400 text-sm">
            등록된 검사 기록이 없습니다.
          </div>
        ) : (
          qcRecords.map((record) => (
            <div 
              key={record.qc_id}
              onClick={() => setSelectedRecord(record)}
              className={cn(
                "p-4 rounded-2xl cursor-pointer transition-all border-2",
                selectedRecord?.qc_id === record.qc_id 
                  ? "bg-white border-primary shadow-md" 
                  : "bg-slate-50 border-transparent hover:border-slate-200"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <Badge className={cn("text-[10px]", getStatusColor(record.result_status_code))}>
                  {getStatusName(record.result_status_code)}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">#{record.qc_id}</span>
              </div>
              <h4 className="font-bold text-sm mb-1">{record.test_type}</h4>
              <p className="text-[11px] text-slate-500">{new Date(record.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      <div className="lg:col-span-3 space-y-6">
        {selectedRecord ? (
          <>
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" /> {selectedRecord.test_type} 상세 리포트
                  </CardTitle>
                  <CardDescription className="mt-1">
                    담당 검사원: {selectedRecord.inspector_name} | 실시일: {new Date(selectedRecord.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {coaData ? (
                    <Button 
                      onClick={() => setIsCoAModalOpen(true)}
                      variant="outline" 
                      className="bg-white border-primary/20 text-primary hover:bg-primary/5 font-bold"
                    >
                      <FileText className="h-4 w-4 mr-2" /> CoA 보기/인쇄
                    </Button>
                  ) : (
                    !isBuyer && selectedRecord.result_status_code === "1400000004" && (
                      <Button 
                        onClick={handleIssueCoA}
                        className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                      >
                        <Award className="h-4 w-4 mr-2" /> CoA 공식 발행
                      </Button>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-bold">검사 항목</th>
                      <th className="px-6 py-4 font-bold">표준 규격 (Spec)</th>
                      <th className="px-6 py-4 font-bold">측정 결과</th>
                      <th className="px-6 py-4 font-bold text-center">판정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedRecord.items?.length > 0 ? (
                      selectedRecord.items.map((item: any) => (
                        <tr key={item.qc_item_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{getParameterName(item.test_parameter_code)}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono">{item.spec_range || '-'}</td>
                          <td className="px-6 py-4">
                            {isBuyer ? (
                              <span className="font-bold text-slate-700">{item.actual_value || '-'}</span>
                            ) : item.spec_range && !item.spec_range.includes("~") ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox"
                                  id={`check-${item.qc_item_id}`}
                                  className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                  defaultChecked={item.actual_value === "동일" || item.actual_value === "적합" || item.actual_value === "음성 (Negative)"}
                                />
                                <label htmlFor={`check-${item.qc_item_id}`} className="text-xs font-bold text-slate-600 cursor-pointer">
                                  {item.spec_range.includes("동일") ? "동일" : "적합"}
                                </label>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input 
                                  key={`input-${item.qc_item_id}`}
                                  defaultValue={item.actual_value} 
                                  id={`input-${item.qc_item_id}`}
                                  className="h-8 w-32 font-bold focus:ring-primary/20"
                                  placeholder="데이터 입력"
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {item.result_status_code === "1400000004" ? (
                                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
                              ) : item.result_status_code === "1400000005" ? (
                                <div className="p-1 rounded-full bg-rose-100 text-rose-600"><XCircle className="h-5 w-5" /></div>
                              ) : (
                                <div className="p-1 rounded-full bg-slate-100 text-slate-400"><AlertCircle className="h-5 w-5" /></div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                          <p className="mb-4">검사 상세 항목이 없습니다. 제품 규격(Spec)을 먼저 설정하거나 항목을 생성해주세요.</p>
                          {!isBuyer && (
                            <Button variant="outline" size="sm" onClick={() => handleInitializeItems()}>
                              <Plus className="h-4 w-4 mr-2" /> 기본 검사항목(pH/점도/성상) 생성
                            </Button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
              {selectedRecord.items?.length > 0 && !isBuyer && (
                <div className="p-4 bg-slate-50 border-t flex justify-end">
                  <Button onClick={handleBatchSave} className="font-bold shadow-lg shadow-primary/20 px-8">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> 검사 결과 일괄 저장
                  </Button>
                </div>
              )}
            </Card>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl text-slate-400 bg-slate-50/30">
            <Activity className="h-12 w-12 mb-4 animate-pulse text-slate-200" />
            <p className="font-medium">왼쪽 목록에서 검사 기록을 선택하거나 신규 검사를 시작하세요.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>신규 품질 검사 등록</CardTitle>
              <CardDescription>검사 유형을 선택하고 기록을 생성합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">검사 유형</label>
                <select 
                  className="w-full p-2 border rounded-xl"
                  value={newTestType}
                  onChange={(e) => setNewTestType(e.target.value)}
                >
                  <option>최종 출하 검사</option>
                  <option>원부자재 입고 검사</option>
                  <option>공정 중검사 (IPQC)</option>
                  <option>미생물 테스트</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>취소</Button>
                <Button className="flex-1 font-bold" onClick={createQCReport}>생성하기</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CoAModal 
        isOpen={isCoAModalOpen}
        onClose={() => setIsCoAModalOpen(false)}
        coaData={coaData}
        projectInfo={projectInfo}
      />
    </div>
  );
};

const getStatusName = (code: string) => {
  const names: Record<string, string> = {
    "1400000001": "검사 대기",
    "1400000003": "검사 중",
    "1400000004": "최종 합격",
    "1400000005": "최종 불합격",
  };
  return names[code] || "진행 대기";
};

const getStatusColor = (code: string) => {
  const colors: Record<string, string> = {
    "1400000001": "bg-slate-100 text-slate-600",
    "1400000003": "bg-orange-100 text-orange-600",
    "1400000004": "bg-emerald-100 text-emerald-600",
    "1400000005": "bg-rose-100 text-rose-600",
  };
  return colors[code] || "bg-slate-100";
};

const getParameterName = (code: string) => {
  const parameters: Record<string, string> = {
    "2300000001": "pH",
    "2300000002": "점도",
    "2300000003": "비중",
    "2300000004": "성상",
    "2300000005": "취",
    "2300000006": "미생물",
    "2300000007": "중금속",
  };
  return parameters[code] || code;
};
