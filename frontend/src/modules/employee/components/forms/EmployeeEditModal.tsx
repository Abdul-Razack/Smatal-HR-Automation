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
import { Employee, UpdateEmployeeInput } from '../../types';
import { toast } from 'sonner';
import { Edit3, Loader2 } from 'lucide-react';

interface EmployeeEditModalProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const;

export function EmployeeEditModal({
  employee,
  open,
  onOpenChange,
}: EmployeeEditModalProps) {
  const { updateEmployee, useEmployees } = useEmployee();
  const { useDepartments, useDesignations, useBranches } = useOrganization();

  const { data: departments = [] } = useDepartments();
  const { data: designations = [] } = useDesignations();
  const { data: branches = [] } = useBranches();
  const { data: existingEmployees = [] } = useEmployees({ limit: 100 });

  const [formData, setFormData] = React.useState<UpdateEmployeeInput>({
    firstName: employee.profile?.firstName || '',
    lastName: employee.profile?.lastName || '',
    personalEmail: employee.profile?.personalEmail || employee.profile?.email || '',
    phone: employee.profile?.phone || '',
    address: employee.profile?.address || '',
    dateOfBirth: employee.profile?.dateOfBirth ? String(employee.profile.dateOfBirth).split('T')[0] : '',
    gender: employee.profile?.gender || '',
    departmentId: employee.departmentId || employee.department?.id || '',
    designationId: employee.designationId || employee.designation?.id || '',
    branchId: employee.branchId || employee.branch?.id || '',
    reportsToId: employee.reportsToId || employee.manager?.id || '',
    employeeNumber: employee.employeeNumber || '',
    employmentType: employee.employmentType || 'Full-time',
    salary: employee.salary ? Number(employee.salary) : undefined,
    joinedDate: employee.joinedDate ? String(employee.joinedDate).split('T')[0] : '',
  });

  React.useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.profile?.firstName || '',
        lastName: employee.profile?.lastName || '',
        personalEmail: employee.profile?.personalEmail || employee.profile?.email || '',
        phone: employee.profile?.phone || '',
        address: employee.profile?.address || '',
        dateOfBirth: employee.profile?.dateOfBirth ? String(employee.profile.dateOfBirth).split('T')[0] : '',
        gender: employee.profile?.gender || '',
        departmentId: employee.departmentId || employee.department?.id || '',
        designationId: employee.designationId || employee.designation?.id || '',
        branchId: employee.branchId || employee.branch?.id || '',
        reportsToId: employee.reportsToId || employee.manager?.id || '',
        employeeNumber: employee.employeeNumber || '',
        employmentType: employee.employmentType || 'Full-time',
        salary: employee.salary ? Number(employee.salary) : undefined,
        joinedDate: employee.joinedDate ? String(employee.joinedDate).split('T')[0] : '',
      });
    }
  }, [employee]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.firstName && !formData.firstName.trim()) errs.firstName = 'First name cannot be empty';
    if (formData.lastName && !formData.lastName.trim()) errs.lastName = 'Last name cannot be empty';
    if (formData.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail.trim())) {
      errs.personalEmail = 'Enter a valid email address';
    }
    if (formData.salary !== undefined && formData.salary !== null && Number(formData.salary) < 0) {
      errs.salary = 'Salary cannot be negative';
    }
    if (formData.reportsToId && formData.reportsToId === employee.id) {
      errs.reportsToId = 'Employee cannot report to themselves';
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

  const handleChange = (field: keyof UpdateEmployeeInput, value: any) => {
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

    const payload: UpdateEmployeeInput = {
      firstName: formData.firstName?.trim() || undefined,
      lastName: formData.lastName?.trim() || undefined,
      personalEmail: formData.personalEmail?.trim() || undefined,
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
      joinedDate: formData.joinedDate || undefined,
    };

    updateEmployee.mutate(
      { id: employee.id, data: payload },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  // Filter out self from reportsTo candidates
  const eligibleManagers = existingEmployees.filter((emp: any) => emp.id !== employee.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit3 className="h-5 w-5 text-primary" />
            Edit Employee: {employee.profile?.firstName} {employee.profile?.lastName} ({employee.businessId || employee.employeeNumber || 'ID'})
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
                <Label htmlFor="edit-firstName" className="text-xs font-medium">
                  First Name
                </Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-lastName" className="text-xs font-medium">
                  Last Name
                </Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-personalEmail" className="text-xs font-medium">
                  Email Address
                </Label>
                <Input
                  id="edit-personalEmail"
                  type="email"
                  value={formData.personalEmail || ''}
                  onChange={(e) => handleChange('personalEmail', e.target.value)}
                />
                {errors.personalEmail && (
                  <p className="text-xs text-destructive">{errors.personalEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-xs font-medium">
                  Phone Number
                </Label>
                <Input
                  id="edit-phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-dateOfBirth" className="text-xs font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-gender" className="text-xs font-medium">
                  Gender
                </Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(val) => handleChange('gender', val)}
                >
                  <SelectTrigger id="edit-gender">
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
                <Label htmlFor="edit-address" className="text-xs font-medium">
                  Residential Address
                </Label>
                <Input
                  id="edit-address"
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
                <Label htmlFor="edit-departmentId" className="text-xs font-medium">
                  Department
                </Label>
                <Select
                  value={formData.departmentId || ''}
                  onValueChange={(val) => handleChange('departmentId', val)}
                >
                  <SelectTrigger id="edit-departmentId">
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
                <Label htmlFor="edit-designationId" className="text-xs font-medium">
                  Designation {!formData.departmentId && <span className="text-[11px] text-muted-foreground font-normal ml-1">(Select department first)</span>}
                </Label>
                <Select
                  value={formData.designationId || ''}
                  onValueChange={(val) => handleChange('designationId', val)}
                  disabled={!formData.departmentId}
                >
                  <SelectTrigger id="edit-designationId">
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
                <Label htmlFor="edit-branchId" className="text-xs font-medium">
                  Branch / Location
                </Label>
                <Select
                  value={formData.branchId || ''}
                  onValueChange={(val) => handleChange('branchId', val)}
                >
                  <SelectTrigger id="edit-branchId">
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
                  <Label htmlFor="edit-reportsToId" className="text-xs font-medium">
                    Reporting Manager <span className="text-[11px] text-muted-foreground font-normal ml-1">(Optional)</span>
                  </Label>
                  <Select
                    value={formData.reportsToId || ''}
                    onValueChange={(val) => handleChange('reportsToId', val === 'none' ? '' : val)}
                  >
                    <SelectTrigger id="edit-reportsToId">
                      <SelectValue placeholder={eligibleManagers.length > 0 ? "Select manager" : "No managers available yet (Optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Independent / Direct)</SelectItem>
                      {eligibleManagers.map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.profile?.firstName} {emp.profile?.lastName} ({emp.designation?.name || emp.businessId || 'Employee'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reportsToId && (
                    <p className="text-xs text-destructive">{errors.reportsToId}</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="edit-joinedDate" className="text-xs font-medium">
                  Joining Date
                </Label>
                <Input
                  id="edit-joinedDate"
                  type="date"
                  value={formData.joinedDate || ''}
                  onChange={(e) => handleChange('joinedDate', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-employmentType" className="text-xs font-medium">
                  Employment Type
                </Label>
                <Select
                  value={formData.employmentType || 'Full-time'}
                  onValueChange={(val) => handleChange('employmentType', val)}
                >
                  <SelectTrigger id="edit-employmentType">
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
                <Label htmlFor="edit-salary" className="text-xs font-medium">
                  Annual Salary
                </Label>
                <Input
                  id="edit-salary"
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
                <Label htmlFor="edit-employeeNumber" className="text-xs font-medium">
                  Employee Code
                </Label>
                <Input
                  id="edit-employeeNumber"
                  value={formData.employeeNumber || ''}
                  onChange={(e) => handleChange('employeeNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateEmployee.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateEmployee.isPending}>
              {updateEmployee.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
