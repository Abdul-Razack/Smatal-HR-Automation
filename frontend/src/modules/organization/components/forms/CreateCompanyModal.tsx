'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganization';
import { useAuthStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdCompany: any) => void;
}

const INDUSTRY_OPTIONS = [
  'Technology & Software',
  'Digital Media & Entertainment',
  'Finance & Banking',
  'Healthcare & Pharmaceuticals',
  'Manufacturing & Production',
  'Retail & E-Commerce',
  'Consulting & Professional Services',
  'Real Estate & Construction',
  'Education & EdTech',
  'Logistics & Supply Chain',
  'Other',
];

export function CreateCompanyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCompanyModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { createCompany } = useOrganization();
  const { accessibleCompanies, setAccessibleCompanies, switchCompany } =
    useAuthStore();

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [legalName, setLegalName] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [autoSwitch, setAutoSwitch] = React.useState(true);
  const [codeTouched, setCodeTouched] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form when opened
  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setCode('');
      setLegalName('');
      setIndustry('');
      setWebsite('');
      setAddress('');
      setPhone('');
      setEmail('');
      setAutoSwitch(true);
      setCodeTouched(false);
      setErrors({});
    }
  }, [isOpen]);

  // Suggest uppercase code as user types name if code was not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!codeTouched) {
      const generatedCode = newName
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 15);
      setCode(generatedCode);
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeTouched(true);
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    setCode(val);
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: '' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Company name is required';
    }
    if (!code.trim()) {
      errs.code = 'Company code is required';
    } else if (code.trim().length < 2) {
      errs.code = 'Code must be at least 2 characters';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        legalName: legalName.trim() || name.trim(),
        industry: industry || undefined,
        website: website.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      };

      const created = await createCompany.mutateAsync(payload);

      // Construct fresh accessible company item
      const newCompanyItem = {
        id: created.id,
        name: created.name,
        code: created.code,
        legalName: created.legalName || created.name,
      };

      const updatedList = [...accessibleCompanies, newCompanyItem];
      setAccessibleCompanies(updatedList);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['organization', 'companies'] });

      toast.success(
        `Sister company "${created.name}" created successfully!`
      );

      if (onSuccess) {
        onSuccess(created);
      }

      onClose();

      if (autoSwitch) {
        toast.info(`Switching active context to ${created.name}...`);
        switchCompany(newCompanyItem);
        // Invalidate queries and navigate to organization master view to set up branding & departments
        queryClient.clear();
        router.push('/master/organization');
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create sister company';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Register Sister Company</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set up a new legal entity under Common Leadership with dedicated staff, departments, and branding.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Company Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="company-name" className="text-xs font-semibold">
                Company Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-name"
                placeholder="e.g. Smatal Media"
                value={name}
                onChange={handleNameChange}
                disabled={createCompany.isPending}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-code" className="text-xs font-semibold">
                Company Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-code"
                placeholder="e.g. SMATAL-MED"
                value={code}
                onChange={handleCodeChange}
                disabled={createCompany.isPending}
                className={errors.code ? 'border-destructive font-mono' : 'font-mono uppercase'}
              />
              {errors.code && (
                <p className="text-[11px] text-destructive">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Legal / Registered Entity Name */}
          <div className="space-y-1.5">
            <Label htmlFor="legal-name" className="text-xs font-semibold">
              Legal / Registered Name
            </Label>
            <Input
              id="legal-name"
              placeholder="e.g. Smatal Media Private Limited (defaults to display name if blank)"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              disabled={createCompany.isPending}
            />
          </div>

          {/* Industry & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs font-semibold flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Industry
              </Label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={createCompany.isPending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select industry sector...</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-semibold flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Official Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://media.smatal.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={createCompany.isPending}
              />
            </div>
          </div>

          {/* Registered Office Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Registered Office Address
            </Label>
            <Input
              id="address"
              placeholder="e.g. Level 4, Innovation Tower, Chennai, Tamil Nadu"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={createCompany.isPending}
            />
          </div>

          {/* Corporate Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Corporate Phone
              </Label>
              <Input
                id="phone"
                placeholder="+91 44 2828 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={createCompany.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Corporate Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="info@media.smatal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createCompany.isPending}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Auto-switch checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
              <input
                type="checkbox"
                checked={autoSwitch}
                onChange={(e) => setAutoSwitch(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Switch to this company immediately after creation
                </span>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Allows you to immediately upload company branding (logo, signature) and configure departments.
                </p>
              </div>
            </label>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createCompany.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCompany.isPending}
              className="gap-1.5"
            >
              {createCompany.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Company...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Sister Company
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
