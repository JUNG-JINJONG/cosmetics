"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  PackageCheck,
  UserCheck,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OutboundTabProps {
  projectId: number;
  isBuyer: boolean;
}

export const OutboundTab = ({ projectId, isBuyer }: OutboundTabProps) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [qcRecords, setQcRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // 1. 출하 승인 이력 조회
      const aRes = await fetch(`http://localhost:8000/api/v1/workflow/qc/outbound?project_id=${projectId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (aRes.ok) setApprovals(await aRes.json());

      // 2. QC 기록 조회 (성적서 발행 여부 확인용)
      const qRes = await fetch(`http://localhost:8000/api/v1/workflow/qc/project-list?project_id=${projectId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (qRes.ok) setQcRecords(await qRes.json());

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOutbound = async (qcId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/outbound`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project_id: projectId,
          qc_id: qcId,
          approval_status_code: "2400000001" // 요청됨
        })
      });
      if (res.ok) {
        alert("출하 승인이 요청되었습니다.");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.detail || "요청에 실패했습니다. (CoA 발행 여부 확인 요망)");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveOutbound = async (approvalId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/workflow/qc/outbound-update?approval_id=${approvalId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          approval_status_code: "2400000002" // 승인됨
        })
      });
      if (res.ok) {
        alert("출하가 승인되었습니다. 생산처에서 발송을 진행합니다.");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">출하 데이터 로드 중...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Information */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> 출하 및 승인 관리
          </h3>
          <p className="text-sm text-muted-foreground mt-1">품질 검사가 완료된 제품의 최종 출하를 승인하고 발송 이력을 관리합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Approval History */}
        <div className="lg:col-span-2 space-y-6">
          {approvals.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50/30">
              <CardContent className="h-40 flex flex-col items-center justify-center text-slate-400">
                <PackageCheck className="h-10 w-10 mb-2 opacity-20" />
                <p>아직 생성된 출하 승인 요청이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            approvals.map((approval) => (
              <Card key={approval.approval_id} className="overflow-hidden border-none shadow-lg shadow-slate-200/50">
                <CardHeader className={cn(
                  "border-b py-4 flex flex-row items-center justify-between",
                  approval.approval_status_code === "2400000002" ? "bg-emerald-50/50" : "bg-orange-50/50"
                )}>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("font-bold", getStatusColor(approval.approval_status_code))}>
                      {getStatusName(approval.approval_status_code)}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">REQ-{approval.approval_id}</span>
                  </div>
                  <div className="text-xs text-slate-400">요청일: {new Date(approval.created_at).toLocaleDateString()}</div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">연결된 품질 검사:</span>
                        <span className="text-sm text-slate-600">QC #{approval.qc_id}</span>
                      </div>
                      {approval.approval_status_code === "2400000002" && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-bold">승인 완료됨:</span>
                          <span className="text-sm text-slate-600">
                            {new Date(approval.approved_at).toLocaleString()} (승인자 ID: {approval.approver_id})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-end">
                      {isBuyer && approval.approval_status_code === "2400000001" && (
                        <div className="flex gap-2">
                          <Button variant="outline" className="font-bold border-rose-200 text-rose-600 hover:bg-rose-50">반려</Button>
                          <Button
                            onClick={() => handleApproveOutbound(approval.approval_id)}
                            className="bg-primary hover:bg-primary/90 font-black px-8 shadow-lg shadow-primary/20"
                          >
                            최종 승인 및 발송 지시
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: QC Records for Manufacturer */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 출하 대기 물량 (최종 검사 합격 건)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {qcRecords.filter(r => r.result_status_code === "1400000004" && r.test_type === "최종 출하 검사").length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-6">출하 가능한 최종 검사 결과가 없습니다.</p>
              ) : (
                qcRecords.filter(r => r.result_status_code === "1400000004" && r.test_type === "최종 출하 검사").map((record) => {
                  const hasRequested = approvals.some(a => a.qc_id === record.qc_id);
                  return (
                    <div key={record.qc_id} className="p-3 border rounded-xl flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{record.test_type}</p>
                        <p className="text-[10px] text-slate-400 font-mono">생산번호: BATCH-{record.qc_id}</p>
                      </div>
                      {hasRequested ? (
                        <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-400">요청 완료</Badge>
                      ) : (
                        !isBuyer && (
                          <Button
                            size="sm"
                            onClick={() => handleRequestOutbound(record.qc_id)}
                            className="h-7 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border-none"
                          >
                            <Send className="h-3 w-3 mr-1" /> 상품 출고 승인 요청
                          </Button>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 leading-relaxed">
                <p className="font-bold mb-1">알림</p>
                <p>제조사는 제품 합격 후 CoA를 발행해야만 바이어에게 출하 승인을 요청할 수 있습니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const getStatusName = (code: string) => {
  const names: Record<string, string> = {
    "2400000001": "승인 대기",
    "2400000002": "승인 완료",
    "2400000003": "출고 완료",
    "2400000004": "반려됨",
  };
  return names[code] || "진행 대기";
};

const getStatusColor = (code: string) => {
  const colors: Record<string, string> = {
    "2400000001": "bg-orange-100 text-orange-600",
    "2400000002": "bg-emerald-100 text-emerald-600",
    "2400000003": "bg-blue-100 text-blue-600",
    "2400000004": "bg-rose-100 text-rose-600",
  };
  return colors[code] || "bg-slate-100";
};
