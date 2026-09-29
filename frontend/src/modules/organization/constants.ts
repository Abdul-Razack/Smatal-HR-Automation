export const DEPARTMENT_DESIGNATION_MAP: Record<string, string[]> = {
  // Executive Management
  MGT: ['CEO', 'MD', 'CTO', 'COO', 'DIR-OPS'],

  // Software Engineering
  ENG: ['TECH-LEAD', 'SR-FSD', 'FSD', 'FED', 'BED', 'MAD', 'JR-DEV', 'SWE-INT'],

  // Quality Assurance & Testing
  QA: ['QA-LEAD', 'SR-QA-AUTO', 'QA-AUTO', 'QA-MANUAL', 'QA-INT'],

  // UI/UX & Creative Design
  DES: ['LEAD-UIUX', 'SR-UIUX', 'UIUX-DES', 'GRAPHIC-DES'],

  // Cloud & Infrastructure
  INF: ['DEVOPS-LEAD', 'DEVOPS-ENG', 'SYS-ADMIN', 'IT-SUPPORT'],

  // Digital Marketing & Growth
  MKT: ['MKT-LEAD', 'SEO-SPEC', 'SOC-MEDIA', 'MKT-EXEC'],

  // Business Development & Client Solutions
  BD: ['HEAD-BD', 'SOL-MGR', 'BDE', 'PRE-SALES'],

  // Academic & Technical Training
  TRG: ['ACAD-DIR', 'SR-PY-AI-TRN', 'FSD-TRN', 'DS-TRN', 'CLOUD-TRN', 'QA-TRN', 'TALLY-TRN', 'JR-FACULTY'],

  // Student Admissions & Career Counseling
  ADM: ['ADM-MGR', 'SR-COUNSELOR', 'CAREER-ADV', 'ADM-EXEC'],

  // Placements & Corporate Relations
  PLC: ['HEAD-PLC', 'CORP-REL-MGR', 'PLC-OFFICER', 'PLC-COORD'],

  // Center Operations & Student Support
  OPS: ['CENTER-HEAD', 'OPS-COORD', 'LAB-ADMIN', 'FRONT-DESK'],

  // Human Resources
  HR: ['HR-MGR', 'SR-HR-EXEC', 'HR-EXEC', 'HR-OPS'],

  // Finance & Accounts
  FIN: ['FIN-MGR', 'SR-ACCT', 'BILL-ACCT-EXEC', 'ACCT-ASST'],
};

export function filterDesignationsByDepartment(
  deptCode: string | undefined | null,
  designations: any[]
): any[] {
  if (!deptCode) return [];
  const allowed = DEPARTMENT_DESIGNATION_MAP[deptCode.toUpperCase()];
  if (allowed && allowed.length > 0) {
    return designations.filter((d) => allowed.includes((d.code || '').toUpperCase()));
  }
  return designations;
}
