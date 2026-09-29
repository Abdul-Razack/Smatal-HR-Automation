'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployee } from '../../hooks/useEmployee';
import { useOrganization } from '@/modules/organization/hooks/useOrganization';
import { filterDesignationsByDepartment } from '@/modules/organization/constants';
import { EmployeeStatus, CreateEmployeeInput } from '../../types';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

interface EmployeeCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const;

export function EmployeeCreateModal({ open, onOpenChange }: EmployeeCreateModalProps) {
  const { createEmployee, useEmployees } = useEmployee();
  const { useDepartments, useDesignations, useBranches } = useOrganization();

  const { data: departments = [] } = useDepartments();
  const { data: designations = [] } = useDesignations();
  const { data: branches = [] } = useBranches();
  const { data: existingEmployees = [] } = useEmployees({ limit: 100 });

  // Form state
  const [formData, setFormData] = React.useState<CreateEmployeeInput>({
    firstName: '',
    lastName: '',
    personalEmail: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    departmentId: '',
    designationId: '',
    branchId: '',
    reportsToId: '',
    employeeNumber: '',
    employmentType: 'Full-time',
    salary: undefined,
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as EmployeeStatus,
    probationEndDate: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.personalEmail.trim()) {
      errs.personalEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail.trim())) {
      errs.personalEmail = 'Enter a valid email address';
    }
    if (!formData.joinedDate) errs.joinedDate = 'Joining date is required';
    if (formData.salary !== undefined && formData.salary !== null && Number(formData.salary) < 0) {
      errs.salary = 'Salary cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectedDepartment = React.useMemo(() => {
    return (departments as any[]).find((d: any) => d.id === formData.departmentId);
  }, [departments, formData.departmentId]);

  const filteredDesignations = React.useMemo(() => {
    return filterDesignationsByDepartment(selectedDepartment?.code, designations as any[]);
  }, [selectedDepartment, designations]);

  const selectedDesignation = React.useMemo(() => {
    return (designations as any[]).find((d: any) => d.id === formData.designationId);
  }, [designations, formData.designationId]);

  const isCEO = React.useMemo(() => {
    if (!selectedDesignation) return false;
    const code = (selectedDesignation.code || '').toUpperCase();
    const name = (selectedDesignation.name || '').toLowerCase();
    return code === 'CEO' || name.includes('chief executive') || name.includes('ceo');
  }, [selectedDesignation]);

  const handleChange = (field: keyof CreateEmployeeInput, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'departmentId') {
        next.designationId = '';
        next.reportsToId = '';
      }
      if (field === 'designationId') {
        const desig = (designations as any[]).find((d: any) => d.id === value);
        const isDesigCEO = desig && ((desig.code || '').toUpperCase() === 'CEO' || (desig.name || '').toLowerCase().includes('ceo') || (desig.name || '').toLowerCase().includes('chief executive'));
        if (isDesigCEO) {
          next.reportsToId = '';
        }
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    const payload: CreateEmployeeInput = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      personalEmail: formData.personalEmail.trim(),
      phone: formData.phone?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      departmentId: formData.departmentId || undefined,
      designationId: formData.designationId || undefined,
      branchId: formData.branchId || undefined,
      reportsToId: (formData.reportsToId && formData.reportsToId !== 'none') ? formData.reportsToId : undefined,
      employeeNumber: formData.employeeNumber?.trim() || undefined,
      employmentType: formData.employmentType || undefined,
      salary: formData.salary ? Number(formData.salary) : undefined,
      joinedDate: formData.joinedDate,
      status: formData.status || 'ACTIVE',
      probationEndDate: formData.probationEndDate || undefined,
    };

    createEmployee.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          firstName: '',
          lastName: '',
          personalEmail: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          departmentId: '',
          designationId: '',
          branchId: '',
          reportsToId: '',
          employeeNumber: '',
          employmentType: 'Full-time',
          salary: undefined,
          joinedDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE' as EmployeeStatus,
          probationEndDate: '',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Section 1: Personal Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80 border-b pb-1">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Jane"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-medium">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="personalEmail" className="text-xs font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="personalEmail"
                  type="email"
                  placeholder="e.g. jane.doe@example.com"
                  value={formData.personalEmail}
                  onChange={(e) => handleChange('personalEmail', e.target.value)}
                />
                {errors.personalEmail && (
                  <p className="text-xs text-destructive">{errors.personalEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. +1 555-0199"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dateOfBirth" className="text-xs font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="gender" className="text-xs font-medium">
                  Gender
                </Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(val) => handleChange('gender', val)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="address" className="text-xs font-medium">
                  Residential Address
                </Label>
                <Input
                  id="address"
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80 border-b pb-1">
              Employment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="departmentId" className="text-xs font-medium">
                  Department
                </Label>
                <Select
                  value={formData.departmentId || ''}
                  onValueChange={(val) => handleChange('departmentId', val)}
                >
                  <SelectTrigger id="departmentId">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="designationId" className="text-xs font-medium">
                  Designation {!formData.departmentId && <span className="text-[11px] text-muted-foreground font-normal ml-1">(Select department first)</span>}
                </Label>
                <Select
                  value={formData.designationId || ''}
                  onValueChange={(val) => handleChange('designationId', val)}
                  disabled={!formData.departmentId}
                >
                  <SelectTrigger id="designationId">
                    <SelectValue placeholder={!formData.departmentId ? "Select department first" : "Select designation"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDesignations.map((des: any) => (
                      <SelectItem key={des.id} value={des.id}>
                        {des.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="branchId" className="text-xs font-medium">
                  Branch / Location
                </Label>
                <Select
                  value={formData.branchId || ''}
                  onValueChange={(val) => handleChange('branchId', val)}
                >
                  <SelectTrigger id="branchId">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isCEO ? (
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Reporting Manager
                  </Label>
                  <div className="h-9 px-3 py-2 rounded-md border bg-muted/40 text-xs text-muted-foreground flex items-center">
                    Not Applicable (CEO is Top-Level Executive)
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="reportsToId" className="text-xs font-medium">
                    Reporting Manager <span className="text-[11px] text-muted-foreground font-normal ml-1">(Optional)</span>
                  </Label>
                  <Select
                    value={formData.reportsToId || ''}
                    onValueChange={(val) => handleChange('reportsToId', val === 'none' ? '' : val)}
                  >
                    <SelectTrigger id="reportsToId">
                      <SelectValue placeholder={existingEmployees.length > 0 ? "Select manager" : "No managers available yet (Optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Independent / Direct)</SelectItem>
                      {existingEmployees.map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.profile?.firstName} {emp.profile?.lastName} ({emp.designation?.name || emp.businessId || 'Employee'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="joinedDate" className="text-xs font-medium">
                  Joining Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="joinedDate"
                  type="date"
                  value={formData.joinedDate}
                  onChange={(e) => handleChange('joinedDate', e.target.value)}
                />
                {errors.joinedDate && (
                  <p className="text-xs text-destructive">{errors.joinedDate}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="employmentType" className="text-xs font-medium">
                  Employment Type
                </Label>
                <Select
                  value={formData.employmentType || 'Full-time'}
                  onValueChange={(val) => handleChange('employmentType', val)}
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="salary" className="text-xs font-medium">
                  Annual Salary
                </Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 75000"
                  value={formData.salary ?? ''}
                  onChange={(e) =>
                    handleChange('salary', e.target.value ? Number(e.target.value) : undefined)
                  }
                />
                {errors.salary && <p className="text-xs text-destructive">{errors.salary}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="employeeNumber" className="text-xs font-medium">
                  Custom Employee Code (Optional)
                </Label>
                <Input
                  id="employeeNumber"
                  placeholder="Leave empty for auto-generated ID"
                  value={formData.employeeNumber || ''}
                  onChange={(e) => handleChange('employeeNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status & Lifecycle */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80 border-b pb-1">
              Status & Probation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs font-medium">
                  Initial Status
                </Label>
                <Select
                  value={formData.status || 'ACTIVE'}
                  onValueChange={(val) => handleChange('status', val as EmployeeStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JOINED">JOINED</SelectItem>
                    <SelectItem value="PROBATION">PROBATION</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="OFFER">OFFER</SelectItem>
                    <SelectItem value="ONBOARDING">ONBOARDING</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="probationEndDate" className="text-xs font-medium">
                  Probation End Date (Optional)
                </Label>
                <Input
                  id="probationEndDate"
                  type="date"
                  value={formData.probationEndDate || ''}
                  onChange={(e) => handleChange('probationEndDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createEmployee.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createEmployee.isPending}>
              {createEmployee.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
