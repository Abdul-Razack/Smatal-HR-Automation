export interface StandardDocumentTypeDefinition {
  code: string;
  name: string;
  description: string;
  lifecycleStage?: string;
}

export const STANDARD_HR_DOCUMENT_TYPES: StandardDocumentTypeDefinition[] = [
  {
    code: 'OFFER_LETTER',
    name: 'Offer Letter',
    description: 'Employment offer issued before candidate joining',
    lifecycleStage: 'OFFER',
  },
  {
    code: 'APPOINTMENT_LETTER',
    name: 'Appointment Letter',
    description: 'Formal employment appointment letter specifying terms and conditions',
    lifecycleStage: 'JOINED',
  },
  {
    code: 'JOINING_LETTER',
    name: 'Joining Letter',
    description: 'Joining confirmation and official reporting documentation',
    lifecycleStage: 'JOINED',
  },
  {
    code: 'CONFIRMATION_LETTER',
    name: 'Confirmation Letter',
    description: 'Employment confirmation issued following probation completion',
    lifecycleStage: 'CONFIRMED',
  },
  {
    code: 'PROMOTION_LETTER',
    name: 'Promotion Letter',
    description: 'Official promotion letter recognizing role advancement and title upgrade',
    lifecycleStage: 'CONFIRMED',
  },
  {
    code: 'SALARY_REVISION_LETTER',
    name: 'Salary Revision Letter',
    description: 'Formal compensation adjustment and increment letter',
    lifecycleStage: 'CONFIRMED',
  },
  {
    code: 'NOC',
    name: 'No Objection Certificate (NOC)',
    description: 'Official No Objection Certificate for travel, banking, or education',
    lifecycleStage: 'NOTICE_PERIOD',
  },
  {
    code: 'RESIGNATION_ACCEPTANCE',
    name: 'Resignation Acceptance Letter',
    description: 'Formal acknowledgement and acceptance of employee resignation',
    lifecycleStage: 'NOTICE_PERIOD',
  },
  {
    code: 'RELIEVING_LETTER',
    name: 'Relieving Letter',
    description: 'Official relieving letter issued upon exit handover completion',
    lifecycleStage: 'RELIEVED',
  },
  {
    code: 'EXPERIENCE_CERTIFICATE',
    name: 'Experience Certificate',
    description: 'Employment experience and service period confirmation',
    lifecycleStage: 'RELIEVED',
  },
  {
    code: 'SERVICE_CERTIFICATE',
    name: 'Service Certificate',
    description: 'Comprehensive service and conduct certificate for separated employees',
    lifecycleStage: 'RELIEVED',
  },
];
