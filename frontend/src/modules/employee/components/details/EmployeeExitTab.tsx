'use client';

import * as React from 'react';
import { Employee, ExitClearanceItem, ClearanceDepartmentType, ClearanceStatusType } from '../../types';
import { useEmployee } from '../../hooks/useEmployee';
import { documentApi } from '@/modules/document/api/document.api';
import { DocumentApiService } from '@/modules/document/api/DocumentApiService';
import { DocumentTypeDto } from '@/modules/document/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  DollarSign,
  Laptop,
  Briefcase,
  FileCheck,
  Download,
  Eye,
  RefreshCw,
  XCircle,
  Send,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeExitTabProps {
  employee: Employee;
  onEmployeeUpdated?: () => void;
}

export function EmployeeExitTab({ employee }: EmployeeExitTabProps) {
  const {
    useResignationDetail,
    useClearanceList,
    submitResignation,
    acceptResignation,
    withdrawResignation,
    initiateClearance,
    updateClearance,
    completeExit,
  } = useEmployee();

  const { data: resignationData, isLoading: isLoadingResignation } = useResignationDetail(employee.id);
  const { data: clearanceData, isLoading: isLoadingClearance } = useClearanceList(employee.id);

  // Modals state
  const [submitModalOpen, setSubmitModalOpen] = React.useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = React.useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = React.useState(false);
  const [clearanceModalOpen, setClearanceModalOpen] = React.useState(false);
  const [completeExitModalOpen, setCompleteExitModalOpen] = React.useState(false);
  const [selectedDept, setSelectedDept] = React.useState<ClearanceDepartmentType>('HR');
  const [deptStatus, setDeptStatus] = React.useState<ClearanceStatusType>('CLEARED');
  const [deptRemarks, setDeptRemarks] = React.useState('');

  // Submit Resignation Form
  const [resDate, setResDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [noticeDays, setNoticeDays] = React.useState(employee.noticePeriodDays || 30);
  const [resReason, setResReason] = React.useState('');

  // Accept Resignation Form
  const [agreedLwd, setAgreedLwd] = React.useState('');
  const [acceptComments, setAcceptComments] = React.useState('');

  // Withdraw Resignation Form
  const [withdrawReason, setWithdrawReason] = React.useState('');

  // Complete Exit Form
  const [finalLwd, setFinalLwd] = React.useState('');
  const [exitNotes, setExitNotes] = React.useState('');

  // Document Generation
  const [docTypes, setDocTypes] = React.useState<DocumentTypeDto[]>([]);
  const [isGeneratingDoc, setIsGeneratingDoc] = React.useState<string | null>(null);

  React.useEffect(() => {
    documentApi.listDocumentTypes().then((types) => {
      setDocTypes(types || []);
    }).catch(() => {
      // Ignore fallback
    });
  }, []);

  const resStatus = resignationData?.currentStatus || employee.resignationStatus || 'NOT_SUBMITTED';
  const clearances: ExitClearanceItem[] = clearanceData?.clearances || [
    { department: 'HR', status: 'PENDING', remarks: '' },
    { department: 'FINANCE', status: 'PENDING', remarks: '' },
    { department: 'IT', status: 'PENDING', remarks: '' },
    { department: 'ADMINISTRATION', status: 'PENDING', remarks: '' },
  ];
  const isAllCleared = clearanceData?.isAllCleared || false;

  // Auto-calculate Last Working Date when submission changes
  const computedLastWorkingDate = React.useMemo(() => {
    try {
      const d = new Date(resDate);
      d.setDate(d.getDate() + Number(noticeDays || 30));
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }, [resDate, noticeDays]);

  // Handlers
  const handleSubmitResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resReason.trim()) {
      toast.error('Please provide a reason for resignation');
      return;
    }
    await submitResignation.mutateAsync({
      id: employee.id,
      data: {
        resignationDate: new Date(resDate).toISOString(),
        reason: resReason.trim(),
        noticePeriodDays: Number(noticeDays),
        lastWorkingDate: new Date(computedLastWorkingDate).toISOString(),
      },
    });
    setSubmitModalOpen(false);
  };

  const handleAcceptResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    await acceptResignation.mutateAsync({
      id: employee.id,
      data: {
        agreedLastWorkingDate: agreedLwd ? new Date(agreedLwd).toISOString() : undefined,
        comments: acceptComments.trim() || undefined,
      },
    });
    setAcceptModalOpen(false);
  };

  const handleWithdrawResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    await withdrawResignation.mutateAsync({
      id: employee.id,
      data: {
        reason: withdrawReason.trim() || undefined,
      },
    });
    setWithdrawModalOpen(false);
  };

  const handleOpenClearanceModal = (dept: ClearanceDepartmentType) => {
    const existing = clearances.find((c) => c.department === dept);
    setSelectedDept(dept);
    setDeptStatus(existing?.status || 'CLEARED');
    setDeptRemarks(existing?.remarks || '');
    setClearanceModalOpen(true);
  };

  const handleUpdateClearance = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateClearance.mutateAsync({
      id: employee.id,
      department: selectedDept,
      data: {
        status: deptStatus,
        remarks: deptRemarks.trim() || undefined,
      },
    });
    setClearanceModalOpen(false);
  };

  const handleCompleteExit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeExit.mutateAsync({
      id: employee.id,
      data: {
        finalLastWorkingDate: finalLwd ? new Date(finalLwd).toISOString() : undefined,
        notes: exitNotes.trim() || undefined,
      },
    });
    setCompleteExitModalOpen(false);
  };

  const handleGenerateExitDoc = async (code: string) => {
    const docType = docTypes.find((dt) => dt.code === code);
    if (!docType) {
      toast.error(`Document type ${code} is not configured yet in company templates.`);
      return;
    }
    setIsGeneratingDoc(code);
    try {
      const res = await documentApi.generateDocument({
        documentTypeId: docType.id,
        entityType: 'EMPLOYEE',
        entityId: employee.id,
      });
      toast.success(`${docType.name} generated successfully!`);
      const documentId = res?.id || (res as any)?.data?.id;
      if (!documentId) {
        throw new Error('Generated document ID not found in response');
      }
      // Offer direct download
      await DocumentApiService.downloadDocumentFile(
        documentId,
        'pdf',
        `${docType.code}_${employee.employeeNumber || employee.id}.pdf`,
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || `Failed to generate ${code}`);
    } finally {
      setIsGeneratingDoc(null);
    }
  };

  const getResignationBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">Resignation Submitted</Badge>;
      case 'ACCEPTED':
        return <Badge variant="default" className="bg-blue-600 text-white">Accepted / Notice Active</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="outline" className="text-gray-500 border-gray-300">Withdrawn</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-emerald-600 text-white">Exit Completed</Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  const getClearanceBadge = (status: ClearanceStatusType) => {
    switch (status) {
      case 'CLEARED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200">CLEARED</Badge>;
      case 'NOT_APPLICABLE':
        return <Badge variant="outline" className="text-gray-500 border-gray-300">NOT APPLICABLE</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">PENDING</Badge>;
    }
  };

  const getDeptIcon = (dept: ClearanceDepartmentType) => {
    switch (dept) {
      case 'HR':
        return <UserCheck className="h-4 w-4 text-purple-600" />;
      case 'FINANCE':
        return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case 'IT':
        return <Laptop className="h-4 w-4 text-blue-600" />;
      case 'ADMINISTRATION':
        return <Building className="h-4 w-4 text-amber-600" />;
    }
  };

  // State-driven action availability
  const canSubmitResignation =
    (employee.status === 'CONFIRMED' || employee.status === 'ACTIVE') &&
    (resStatus === 'NOT_SUBMITTED' || resStatus === 'WITHDRAWN');

  const canAcceptResignation = resStatus === 'SUBMITTED';

  const canWithdrawResignation =
    (resStatus === 'SUBMITTED' || resStatus === 'ACCEPTED') &&
    employee.status !== 'RELIEVED' &&
    resStatus !== 'COMPLETED';

  const canInitiateClearance =
    (resStatus === 'ACCEPTED' || employee.status === 'NOTICE_PERIOD') &&
    (!clearanceData?.clearances || clearanceData.clearances.length === 0);

  const canCompleteExit =
    resStatus === 'ACCEPTED' &&
    (employee.status === 'NOTICE_PERIOD' || employee.status === 'NOTICE') &&
    isAllCleared;

  const isRelieved = employee.status === 'RELIEVED' || resStatus === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 via-white to-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <LogOut className="h-5 w-5 text-orange-600" />
                Resignation, NOC Clearance & Exit Management
              </CardTitle>
              <CardDescription>
                Full lifecycle exit workflow compliant with Step 4 & Step 8 separation rules.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getResignationBadge(resStatus)}
              <Badge variant="outline" className="font-mono text-xs">
                Status: {employee.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
            <div className="p-3 bg-white rounded-lg border shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Resignation Date</span>
              <p className="font-semibold text-foreground mt-0.5">
                {resignationData?.resignationDate || employee.resignationDate
                  ? new Date(resignationData?.resignationDate || employee.resignationDate!).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Notice Period</span>
              <p className="font-semibold text-foreground mt-0.5">
                {resignationData?.noticePeriodDays || employee.noticePeriodDays || 30} days
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Last Working Date</span>
              <p className="font-semibold text-foreground mt-0.5">
                {resignationData?.lastWorkingDate || employee.lastWorkingDate
                  ? new Date(resignationData?.lastWorkingDate || employee.lastWorkingDate!).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Clearance Progress</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-foreground">
                  {clearances.filter((c) => c.status === 'CLEARED' || c.status === 'NOT_APPLICABLE').length} / 4
                </span>
                {isAllCleared ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Resignation & Clearance Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resignation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                Resignation Information
              </span>
              {getResignationBadge(resStatus)}
            </CardTitle>
            <CardDescription>
              Tendered separation terms and HR acceptance record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {resStatus === 'NOT_SUBMITTED' ? (
              <div className="text-center py-8 text-muted-foreground space-y-2">
                <UserCheck className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="font-medium text-foreground">No Active Resignation</p>
                <p className="text-xs max-w-sm mx-auto">
                  This employee is actively serving and has not submitted a separation notice.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                  <div>
                    <span className="text-xs text-muted-foreground">Submission Date</span>
                    <p className="font-medium">
                      {resignationData?.resignationDate || employee.resignationDate
                        ? new Date(resignationData?.resignationDate || employee.resignationDate!).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Agreed Last Working Day</span>
                    <p className="font-medium">
                      {resignationData?.lastWorkingDate || employee.lastWorkingDate
                        ? new Date(resignationData?.lastWorkingDate || employee.lastWorkingDate!).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Reason for Leaving</span>
                  <p className="font-medium bg-muted/40 p-2.5 rounded border mt-1 text-sm text-foreground">
                    {resignationData?.reason || employee.resignationReason || 'Personal reasons / career advancement'}
                  </p>
                </div>

                {(resignationData?.acceptedBy || resignationData?.acceptedAt) && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      Resignation Accepted by HR
                    </p>
                    <p>
                      Accepted on:{' '}
                      <span className="font-medium">
                        {new Date(resignationData.acceptedAt!).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                )}

                {/* History if available */}
                {resignationData?.history && resignationData.history.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground font-medium">Resignation Audit Trail</span>
                    <div className="mt-2 space-y-2 max-h-36 overflow-y-auto pr-1">
                      {resignationData.history.map((h: any, i: number) => (
                        <div key={h.id || i} className="p-2 bg-muted/30 rounded text-xs border flex items-center justify-between">
                          <div>
                            <span className="font-semibold">{h.status}</span> — {h.reason}
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="bg-muted/10 border-t pt-3 flex flex-wrap gap-2 justify-end">
            {canSubmitResignation && (
              <Button size="sm" onClick={() => setSubmitModalOpen(true)}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit Resignation
              </Button>
            )}
            {canAcceptResignation && (
              <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={() => setAcceptModalOpen(true)}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Accept Resignation
              </Button>
            )}
            {canWithdrawResignation && (
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setWithdrawModalOpen(true)}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Withdraw
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Clearance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Departmental NOC & Clearance
              </span>
              {isAllCleared ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">All Cleared</Badge>
              ) : (
                <Badge variant="outline">Clearance Required</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Lightweight handover clearance covering HR, Finance, IT, and Administration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clearances.map((item) => (
              <div
                key={item.department}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-md bg-muted/60 mt-0.5">
                    {getDeptIcon(item.department)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.department}</span>
                      {getClearanceBadge(item.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.remarks ? `Remarks: ${item.remarks}` : 'No departmental remarks recorded.'}
                    </p>
                    {item.clearedAt && (
                      <span className="text-[11px] text-muted-foreground">
                        Cleared on {new Date(item.clearedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Clearance action allowed when exit is active */}
                {(resStatus === 'ACCEPTED' || employee.status === 'NOTICE_PERIOD' || employee.status === 'RELIEVED') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => handleOpenClearanceModal(item.department)}
                  >
                    Update
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="bg-muted/10 border-t pt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {clearances.filter((c) => c.status === 'CLEARED' || c.status === 'NOT_APPLICABLE').length} of 4 cleared
            </span>
            {canInitiateClearance && (
              <Button size="sm" variant="outline" onClick={() => initiateClearance.mutate(employee.id)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Initialize Checklist
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* 3. Exit Processing & Document Generation Card */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Exit Completion & Separation Documents
          </CardTitle>
          <CardDescription>
            Transactional exit finalizing (Step 4 & 8 lifecycle transitions) and real PDF exit document generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exit Action Banner */}
          <div className="p-4 rounded-lg border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-foreground">Relieving / Exit Completion Status</h4>
              <p className="text-xs text-muted-foreground max-w-lg">
                {!isAllCleared && resStatus === 'ACCEPTED'
                  ? 'All 4 departmental clearances (HR, Finance, IT, Admin) must be CLEARED or NOT_APPLICABLE before completing exit.'
                  : isRelieved
                  ? `Employee separation completed. Status transitioned to RELIEVED.`
                  : resStatus === 'ACCEPTED'
                  ? 'Clearance is complete! You can now formally relieve this employee.'
                  : 'Awaiting resignation submission and acceptance to initiate notice period.'}
              </p>
            </div>
            <div>
              {canCompleteExit ? (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  onClick={() => setCompleteExitModalOpen(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Exit & Relieve
                </Button>
              ) : isRelieved ? (
                <Badge className="bg-emerald-600 text-white text-xs px-3 py-1">
                  RELIEVED
                </Badge>
              ) : (
                <Button disabled variant="outline" className="text-muted-foreground">
                  Complete Exit (Locked)
                </Button>
              )}
            </div>
          </div>

          {/* Exit Documents Generation Grid */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              Generate Official Exit Documents (Step 7 PDF Pipeline)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. NOC */}
              <Card className="p-3 border flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <h5 className="font-semibold text-sm">No Objection (NOC)</h5>
                  <p className="text-[11px] text-muted-foreground mt-1">Official clearance certificate.</p>
                </div>
                <div className="pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isGeneratingDoc === 'NOC' || (!canCompleteExit && !isRelieved && resStatus !== 'ACCEPTED')}
                    onClick={() => handleGenerateExitDoc('NOC')}
                  >
                    {isGeneratingDoc === 'NOC' ? (
                      <Clock className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Generate NOC
                  </Button>
                </div>
              </Card>

              {/* 2. Resignation Acceptance */}
              <Card className="p-3 border flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <h5 className="font-semibold text-sm">Acceptance Letter</h5>
                  <p className="text-[11px] text-muted-foreground mt-1">Formal acknowledgement letter.</p>
                </div>
                <div className="pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isGeneratingDoc === 'RESIGNATION_ACCEPTANCE' || (resStatus !== 'ACCEPTED' && !isRelieved)}
                    onClick={() => handleGenerateExitDoc('RESIGNATION_ACCEPTANCE')}
                  >
                    {isGeneratingDoc === 'RESIGNATION_ACCEPTANCE' ? (
                      <Clock className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Generate Acceptance
                  </Button>
                </div>
              </Card>

              {/* 3. Relieving Letter */}
              <Card className="p-3 border flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <h5 className="font-semibold text-sm">Relieving Letter</h5>
                  <p className="text-[11px] text-muted-foreground mt-1">Official handover relieving.</p>
                </div>
                <div className="pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isGeneratingDoc === 'RELIEVING_LETTER' || !isRelieved}
                    onClick={() => handleGenerateExitDoc('RELIEVING_LETTER')}
                  >
                    {isGeneratingDoc === 'RELIEVING_LETTER' ? (
                      <Clock className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Generate Relieving
                  </Button>
                </div>
              </Card>

              {/* 4. Experience Certificate */}
              <Card className="p-3 border flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <h5 className="font-semibold text-sm">Experience Cert</h5>
                  <p className="text-[11px] text-muted-foreground mt-1">Confirmed tenure verification.</p>
                </div>
                <div className="pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isGeneratingDoc === 'EXPERIENCE_CERTIFICATE' || !isRelieved}
                    onClick={() => handleGenerateExitDoc('EXPERIENCE_CERTIFICATE')}
                  >
                    {isGeneratingDoc === 'EXPERIENCE_CERTIFICATE' ? (
                      <Clock className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Generate Experience
                  </Button>
                </div>
              </Card>

              {/* 5. Service Certificate */}
              <Card className="p-3 border flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <h5 className="font-semibold text-sm">Service Certificate</h5>
                  <p className="text-[11px] text-muted-foreground mt-1">Comprehensive service record.</p>
                </div>
                <div className="pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isGeneratingDoc === 'SERVICE_CERTIFICATE' || !isRelieved}
                    onClick={() => handleGenerateExitDoc('SERVICE_CERTIFICATE')}
                  >
                    {isGeneratingDoc === 'SERVICE_CERTIFICATE' ? (
                      <Clock className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Generate Service
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Submit Resignation */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmitResignation}>
            <DialogHeader>
              <DialogTitle>Submit Employee Resignation</DialogTitle>
              <DialogDescription>
                Initiate formal separation for {employee.profile?.firstName} {employee.profile?.lastName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="resDate">Resignation Date</Label>
                  <Input
                    id="resDate"
                    type="date"
                    required
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="noticeDays">Notice Period (Days)</Label>
                  <Input
                    id="noticeDays"
                    type="number"
                    min="0"
                    max="180"
                    required
                    value={noticeDays}
                    onChange={(e) => setNoticeDays(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-muted/40 border text-xs text-muted-foreground flex items-center justify-between">
                <span>Calculated Last Working Date:</span>
                <span className="font-semibold text-foreground text-sm">{computedLastWorkingDate || '—'}</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resReason">Reason for Resignation *</Label>
                <Textarea
                  id="resReason"
                  required
                  placeholder="Specify resignation reasons (e.g. Higher studies, Career opportunity, Relocation)"
                  rows={3}
                  value={resReason}
                  onChange={(e) => setResReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitResignation.isPending}>
                {submitResignation.isPending ? 'Submitting...' : 'Submit Resignation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Accept Resignation */}
      <Dialog open={acceptModalOpen} onOpenChange={setAcceptModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleAcceptResignation}>
            <DialogHeader>
              <DialogTitle>Accept Resignation</DialogTitle>
              <DialogDescription>
                Accepting this resignation will transition the employee to <strong>NOTICE_PERIOD</strong> and initialize departmental clearance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="agreedLwd">Agreed Last Working Date (Optional)</Label>
                <Input
                  id="agreedLwd"
                  type="date"
                  value={agreedLwd}
                  onChange={(e) => setAgreedLwd(e.target.value)}
                />
                <span className="text-[11px] text-muted-foreground">
                  Leave blank to retain calculated date ({employee.lastWorkingDate ? new Date(employee.lastWorkingDate).toLocaleDateString() : 'based on notice'}).
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="acceptComments">HR Acceptance Comments</Label>
                <Textarea
                  id="acceptComments"
                  placeholder="Add any handover notes or remarks"
                  rows={3}
                  value={acceptComments}
                  onChange={(e) => setAcceptComments(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAcceptModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={acceptResignation.isPending}>
                {acceptResignation.isPending ? 'Accepting...' : 'Accept & Start Notice Period'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Withdraw Resignation */}
      <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleWithdrawResignation}>
            <DialogHeader>
              <DialogTitle>Withdraw Resignation</DialogTitle>
              <DialogDescription>
                Revert this separation. The employee lifecycle will be restored to <strong>CONFIRMED</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="withdrawReason">Withdrawal Reason</Label>
                <Textarea
                  id="withdrawReason"
                  placeholder="Explain why resignation is being withdrawn (e.g. Retention discussion, Counter-offer accepted)"
                  rows={3}
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setWithdrawModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={withdrawResignation.isPending}>
                {withdrawResignation.isPending ? 'Withdrawing...' : 'Confirm Withdrawal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Update Clearance Item */}
      <Dialog open={clearanceModalOpen} onOpenChange={setClearanceModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handleUpdateClearance}>
            <DialogHeader>
              <DialogTitle>Update {selectedDept} Clearance</DialogTitle>
              <DialogDescription>
                Record departmental handover and asset clearance status.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="statusSelect">Clearance Status</Label>
                <Select value={deptStatus} onValueChange={(v: ClearanceStatusType) => setDeptStatus(v)}>
                  <SelectTrigger id="statusSelect">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="CLEARED">CLEARED</SelectItem>
                    <SelectItem value="NOT_APPLICABLE">NOT APPLICABLE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deptRemarks">Remarks / Notes</Label>
                <Textarea
                  id="deptRemarks"
                  placeholder="Details of handover, returned assets, or final clearance notes"
                  rows={3}
                  value={deptRemarks}
                  onChange={(e) => setDeptRemarks(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClearanceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateClearance.isPending}>
                {updateClearance.isPending ? 'Saving...' : 'Save Clearance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: Complete Exit */}
      <Dialog open={completeExitModalOpen} onOpenChange={setCompleteExitModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCompleteExit}>
            <DialogHeader>
              <DialogTitle>Complete Employee Exit</DialogTitle>
              <DialogDescription>
                This will formally change lifecycle status to <strong>RELIEVED</strong>, finalize resignation records, and unlock final relieving letters.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>All 4 departmental clearances (HR, Finance, IT, Admin) are verified and complete.</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="finalLwd">Final Relieving Date (Optional)</Label>
                <Input
                  id="finalLwd"
                  type="date"
                  value={finalLwd}
                  onChange={(e) => setFinalLwd(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exitNotes">Final Exit Notes</Label>
                <Textarea
                  id="exitNotes"
                  placeholder="Final separation remarks, handover confirmation, or HR notes"
                  rows={3}
                  value={exitNotes}
                  onChange={(e) => setExitNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCompleteExitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={completeExit.isPending}>
                {completeExit.isPending ? 'Completing...' : 'Relieve Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
