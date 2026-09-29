--
-- PostgreSQL database dump
--

\restrict 10qatA9kUFjJwy0ib8gFVW0jMpQ3JAU4vBPaKV4owBAwJkil5TebL80GUO4EwhJ

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: abdul-razack-a
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "abdul-razack-a";

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: abdul-razack-a
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AuditOperation; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."AuditOperation" AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'SOFT_DELETE',
    'RESTORE',
    'PUBLISH',
    'ARCHIVE',
    'GENERATE',
    'APPROVE',
    'REJECT'
);


ALTER TYPE public."AuditOperation" OWNER TO "abdul-razack-a";

--
-- Name: CandidateStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."CandidateStatus" AS ENUM (
    'DRAFT',
    'APPLIED',
    'SCREENING',
    'INTERVIEWING',
    'SELECTED',
    'REJECTED',
    'WITHDRAWN',
    'CONVERTED'
);


ALTER TYPE public."CandidateStatus" OWNER TO "abdul-razack-a";

--
-- Name: CarryForwardType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."CarryForwardType" AS ENUM (
    'NONE',
    'CAPPED',
    'UNLIMITED'
);


ALTER TYPE public."CarryForwardType" OWNER TO "abdul-razack-a";

--
-- Name: ClearanceDepartment; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."ClearanceDepartment" AS ENUM (
    'HR',
    'FINANCE',
    'IT',
    'ADMINISTRATION'
);


ALTER TYPE public."ClearanceDepartment" OWNER TO "abdul-razack-a";

--
-- Name: ClearanceStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."ClearanceStatus" AS ENUM (
    'PENDING',
    'CLEARED',
    'NOT_APPLICABLE'
);


ALTER TYPE public."ClearanceStatus" OWNER TO "abdul-razack-a";

--
-- Name: DocumentGenerationStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."DocumentGenerationStatus" AS ENUM (
    'QUEUED',
    'PROCESSING',
    'GENERATED',
    'FAILED',
    'ARCHIVED'
);


ALTER TYPE public."DocumentGenerationStatus" OWNER TO "abdul-razack-a";

--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ONBOARDING',
    'ACTIVE',
    'NOTICE',
    'TERMINATED',
    'RESIGNED',
    'RETIRED',
    'OFFER',
    'JOINED',
    'PROBATION',
    'CONFIRMED',
    'NOTICE_PERIOD',
    'RELIEVED'
);


ALTER TYPE public."EmployeeStatus" OWNER TO "abdul-razack-a";

--
-- Name: FieldDataType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."FieldDataType" AS ENUM (
    'TEXT',
    'NUMBER',
    'DATE',
    'BOOLEAN',
    'ENUM',
    'FILE',
    'JSON'
);


ALTER TYPE public."FieldDataType" OWNER TO "abdul-razack-a";

--
-- Name: FieldEntityType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."FieldEntityType" AS ENUM (
    'PROFILE',
    'CANDIDATE',
    'EMPLOYEE',
    'LEAVE_REQUEST',
    'LEAVE_POLICY'
);


ALTER TYPE public."FieldEntityType" OWNER TO "abdul-razack-a";

--
-- Name: HolidayType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."HolidayType" AS ENUM (
    'PUBLIC',
    'COMPANY',
    'OPTIONAL'
);


ALTER TYPE public."HolidayType" OWNER TO "abdul-razack-a";

--
-- Name: LeaveAccrualType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."LeaveAccrualType" AS ENUM (
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public."LeaveAccrualType" OWNER TO "abdul-razack-a";

--
-- Name: LeaveBalanceType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."LeaveBalanceType" AS ENUM (
    'ACCRUED',
    'GRANTED'
);


ALTER TYPE public."LeaveBalanceType" OWNER TO "abdul-razack-a";

--
-- Name: LeaveDurationType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."LeaveDurationType" AS ENUM (
    'FULL_DAY',
    'HALF_DAY'
);


ALTER TYPE public."LeaveDurationType" OWNER TO "abdul-razack-a";

--
-- Name: LeaveStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."LeaveStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public."LeaveStatus" OWNER TO "abdul-razack-a";

--
-- Name: PermissionAction; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."PermissionAction" AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'PUBLISH',
    'APPROVE',
    'EXPORT',
    'MANAGE',
    'REJECT',
    'ADMIN',
    'ACTIVATE',
    'TERMINATE'
);


ALTER TYPE public."PermissionAction" OWNER TO "abdul-razack-a";

--
-- Name: ResignationStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."ResignationStatus" AS ENUM (
    'NOT_SUBMITTED',
    'SUBMITTED',
    'ACCEPTED',
    'WITHDRAWN',
    'COMPLETED'
);


ALTER TYPE public."ResignationStatus" OWNER TO "abdul-razack-a";

--
-- Name: TemplateStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."TemplateStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."TemplateStatus" OWNER TO "abdul-razack-a";

--
-- Name: TemplateVersionStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."TemplateVersionStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'DEPRECATED',
    'ARCHIVED',
    'ROLLED_BACK'
);


ALTER TYPE public."TemplateVersionStatus" OWNER TO "abdul-razack-a";

--
-- Name: ValidationRuleType; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."ValidationRuleType" AS ENUM (
    'REQUIRED',
    'REGEX',
    'MIN_LENGTH',
    'MAX_LENGTH',
    'MIN_VALUE',
    'MAX_VALUE',
    'EMAIL',
    'PHONE',
    'CUSTOM'
);


ALTER TYPE public."ValidationRuleType" OWNER TO "abdul-razack-a";

--
-- Name: WorkflowInstanceStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."WorkflowInstanceStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'FAILED'
);


ALTER TYPE public."WorkflowInstanceStatus" OWNER TO "abdul-razack-a";

--
-- Name: WorkflowStatus; Type: TYPE; Schema: public; Owner: abdul-razack-a
--

CREATE TYPE public."WorkflowStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."WorkflowStatus" OWNER TO "abdul-razack-a";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid,
    "entityType" character varying(100) NOT NULL,
    "entityBusinessId" character varying(100) NOT NULL,
    action character varying(50) NOT NULL,
    "performedBy" uuid NOT NULL,
    "performedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "beforeState" jsonb,
    "afterState" jsonb,
    "correlationId" character varying(100),
    "ipAddress" character varying(50),
    remarks text
);


ALTER TABLE public.audit_logs OWNER TO "abdul-razack-a";

--
-- Name: branches; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.branches (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    address character varying(500),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    pincode character varying(20),
    "isHeadquarters" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.branches OWNER TO "abdul-razack-a";

--
-- Name: business_id_counters; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.business_id_counters (
    prefix character varying(20) NOT NULL,
    counter integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.business_id_counters OWNER TO "abdul-razack-a";

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.candidates (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "profileId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    status public."CandidateStatus" DEFAULT 'DRAFT'::public."CandidateStatus" NOT NULL,
    "appliedDate" date,
    source character varying(100),
    "referredBy" uuid,
    notes text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.candidates OWNER TO "abdul-razack-a";

--
-- Name: companies; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.companies (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    "legalName" character varying(255),
    code character varying(50) NOT NULL,
    "logoUrl" character varying(500),
    website character varying(255),
    industry character varying(100),
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL,
    address character varying(500),
    phone character varying(50),
    email character varying(255),
    "authorizedPerson" character varying(255),
    "authorizedPersonDesignation" character varying(255),
    "signatureUrl" character varying(500)
);


ALTER TABLE public.companies OWNER TO "abdul-razack-a";

--
-- Name: departments; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(500),
    "parentId" uuid,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.departments OWNER TO "abdul-razack-a";

--
-- Name: designations; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.designations (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(500),
    level integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.designations OWNER TO "abdul-razack-a";

--
-- Name: document_snapshots; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.document_snapshots (
    id uuid NOT NULL,
    "generatedDocumentId" uuid NOT NULL,
    "filePath" character varying(500) NOT NULL,
    "fileUrl" character varying(1000),
    "fileSize" integer,
    "mimeType" character varying(100) NOT NULL,
    checksum character varying(256) NOT NULL,
    "storageProvider" character varying(50) NOT NULL,
    "renderedContent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" uuid NOT NULL
);


ALTER TABLE public.document_snapshots OWNER TO "abdul-razack-a";

--
-- Name: document_types; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.document_types (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(100) NOT NULL,
    description character varying(500),
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.document_types OWNER TO "abdul-razack-a";

--
-- Name: employees; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "profileId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "branchId" uuid,
    "departmentId" uuid,
    "designationId" uuid,
    "reportsToId" uuid,
    "employeeNumber" character varying(50),
    status public."EmployeeStatus" DEFAULT 'ONBOARDING'::public."EmployeeStatus" NOT NULL,
    "joinedDate" date NOT NULL,
    "confirmationDate" date,
    "probationEndDate" date,
    "terminationDate" date,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL,
    "employmentType" character varying(50),
    salary numeric(12,2),
    "lastWorkingDate" date,
    "noticePeriodDays" integer,
    "resignationDate" date,
    "resignationReason" character varying(1000),
    "resignationStatus" public."ResignationStatus" DEFAULT 'NOT_SUBMITTED'::public."ResignationStatus"
);


ALTER TABLE public.employees OWNER TO "abdul-razack-a";

--
-- Name: employment_history; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.employment_history (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "changeType" character varying(50) NOT NULL,
    "previousValue" character varying(500),
    "newValue" character varying(500),
    "effectiveDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes character varying(500),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" uuid NOT NULL
);


ALTER TABLE public.employment_history OWNER TO "abdul-razack-a";

--
-- Name: exit_clearances; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.exit_clearances (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    department public."ClearanceDepartment" NOT NULL,
    status public."ClearanceStatus" DEFAULT 'PENDING'::public."ClearanceStatus" NOT NULL,
    remarks character varying(1000),
    "clearedBy" uuid,
    "clearedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.exit_clearances OWNER TO "abdul-razack-a";

--
-- Name: field_definitions; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.field_definitions (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid,
    "machineKey" character varying(100) NOT NULL,
    "displayName" character varying(255) NOT NULL,
    description character varying(500),
    "dataType" public."FieldDataType" NOT NULL,
    "entityType" public."FieldEntityType" NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "defaultValue" character varying(500),
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "groupId" uuid,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.field_definitions OWNER TO "abdul-razack-a";

--
-- Name: field_groups; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.field_groups (
    id uuid NOT NULL,
    "companyId" uuid,
    name character varying(100) NOT NULL,
    description character varying(500),
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.field_groups OWNER TO "abdul-razack-a";

--
-- Name: field_options; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.field_options (
    id uuid NOT NULL,
    "fieldDefinitionId" uuid NOT NULL,
    label character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.field_options OWNER TO "abdul-razack-a";

--
-- Name: field_validations; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.field_validations (
    id uuid NOT NULL,
    "fieldDefinitionId" uuid NOT NULL,
    "ruleType" public."ValidationRuleType" NOT NULL,
    "ruleValue" character varying(500) NOT NULL,
    "errorMessage" character varying(500),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.field_validations OWNER TO "abdul-razack-a";

--
-- Name: field_values; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.field_values (
    id uuid NOT NULL,
    "fieldDefinitionId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "entityType" public."FieldEntityType" NOT NULL,
    "entityId" uuid NOT NULL,
    "profileId" uuid,
    "candidateId" uuid,
    "employeeId" uuid,
    "leaveRequestId" uuid,
    "leavePolicyId" uuid,
    "valueData" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.field_values OWNER TO "abdul-razack-a";

--
-- Name: generated_documents; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.generated_documents (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    "profileId" uuid NOT NULL,
    "documentTypeId" uuid NOT NULL,
    "templateVersionId" uuid NOT NULL,
    "workflowInstanceId" uuid,
    "workflowStageId" uuid,
    "entityType" character varying(50) NOT NULL,
    "entityId" uuid NOT NULL,
    status public."DocumentGenerationStatus" DEFAULT 'QUEUED'::public."DocumentGenerationStatus" NOT NULL,
    "generatedAt" timestamp(3) without time zone,
    "generatedBy" uuid,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL,
    "candidateId" uuid,
    "employeeId" uuid
);


ALTER TABLE public.generated_documents OWNER TO "abdul-razack-a";

--
-- Name: holidays; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.holidays (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    date date NOT NULL,
    type public."HolidayType" DEFAULT 'PUBLIC'::public."HolidayType" NOT NULL,
    description character varying(500),
    "branchId" uuid,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.holidays OWNER TO "abdul-razack-a";

--
-- Name: identity_users; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.identity_users (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "profileId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(500) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone,
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "mfaSecret" character varying(200),
    "lastLoginAt" timestamp(3) without time zone,
    "loginAttempts" integer DEFAULT 0 NOT NULL,
    "lockedUntil" timestamp(3) without time zone,
    "passwordChangedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.identity_users OWNER TO "abdul-razack-a";

--
-- Name: leave_accruals; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.leave_accruals (
    id uuid NOT NULL,
    "leaveBalanceId" uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    "accrualDate" date NOT NULL,
    notes character varying(500),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" uuid NOT NULL
);


ALTER TABLE public.leave_accruals OWNER TO "abdul-razack-a";

--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.leave_balances (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "leaveTypeId" uuid NOT NULL,
    year integer NOT NULL,
    "balanceType" public."LeaveBalanceType" DEFAULT 'GRANTED'::public."LeaveBalanceType" NOT NULL,
    "totalEntitlement" numeric(10,2) NOT NULL,
    "accruedDays" numeric(10,2) DEFAULT 0 NOT NULL,
    "carriedForward" numeric(10,2) DEFAULT 0 NOT NULL,
    "usedDays" numeric(10,2) DEFAULT 0 NOT NULL,
    "pendingDays" numeric(10,2) DEFAULT 0 NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.leave_balances OWNER TO "abdul-razack-a";

--
-- Name: leave_carry_forwards; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.leave_carry_forwards (
    id uuid NOT NULL,
    "leaveBalanceId" uuid NOT NULL,
    "fromYear" integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" uuid NOT NULL
);


ALTER TABLE public.leave_carry_forwards OWNER TO "abdul-razack-a";

--
-- Name: leave_history; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.leave_history (
    id uuid NOT NULL,
    "leaveRequestId" uuid NOT NULL,
    status public."LeaveStatus" NOT NULL,
    action character varying(100) NOT NULL,
    notes text,
    "performedBy" uuid NOT NULL,
    "performedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb
);


ALTER TABLE public.leave_history OWNER TO "abdul-razack-a";

--
-- Name: leave_policies; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.leave_policies (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    "leaveTypeId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(500),
    "annualEntitlement" numeric(10,2) NOT NULL,
    "accrualType" public."LeaveAccrualType" DEFAULT 'YEARLY'::public."LeaveAccrualType" NOT NULL,
    "carryForwardType" public."CarryForwardType" DEFAULT 'NONE'::public."CarryForwardType" NOT NULL,
    "maxCarryForwardDays" numeric(10,2),
    "requiresAttachment" boolean DEFAULT false NOT NULL,
    "minDaysForAttachment" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.leave_policies OWNER TO "abdul-razack-a";

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.leave_requests (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "leaveTypeId" uuid NOT NULL,
    status public."LeaveStatus" DEFAULT 'PENDING'::public."LeaveStatus" NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    duration numeric(10,2) NOT NULL,
    "durationType" public."LeaveDurationType" DEFAULT 'FULL_DAY'::public."LeaveDurationType" NOT NULL,
    reason text NOT NULL,
    "attachmentUrl" character varying(500),
    "workflowInstanceId" uuid,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.leave_requests OWNER TO "abdul-razack-a";

--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.leave_types (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(500),
    "colorCode" character varying(20),
    "isPaid" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.leave_types OWNER TO "abdul-razack-a";

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    "notificationType" character varying(100) NOT NULL,
    priority character varying(20) NOT NULL,
    recipient uuid NOT NULL,
    "readStatus" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO "abdul-razack-a";

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    resource character varying(100) NOT NULL,
    action public."PermissionAction" NOT NULL,
    description character varying(500),
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO "abdul-razack-a";

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    "personalEmail" character varying(255) NOT NULL,
    phone character varying(30),
    "dateOfBirth" date,
    gender character varying(20),
    nationality character varying(100),
    "profilePhoto" character varying(500),
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL,
    address character varying(500)
);


ALTER TABLE public.profiles OWNER TO "abdul-razack-a";

--
-- Name: resignations; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.resignations (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "resignationDate" date NOT NULL,
    "lastWorkingDate" date NOT NULL,
    "noticePeriodDays" integer NOT NULL,
    reason character varying(1000) NOT NULL,
    status public."ResignationStatus" DEFAULT 'SUBMITTED'::public."ResignationStatus" NOT NULL,
    "acceptedBy" uuid,
    "acceptedAt" timestamp(3) without time zone,
    comments character varying(1000),
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.resignations OWNER TO "abdul-razack-a";

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.role_permissions (
    "roleId" uuid NOT NULL,
    "permissionId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO "abdul-razack-a";

--
-- Name: roles; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(500),
    "isSystem" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.roles OWNER TO "abdul-razack-a";

--
-- Name: template_placeholders; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.template_placeholders (
    id uuid NOT NULL,
    "templateVersionId" uuid NOT NULL,
    "fieldDefinitionId" uuid,
    "placeholderKey" character varying(100) NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.template_placeholders OWNER TO "abdul-razack-a";

--
-- Name: template_versions; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.template_versions (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "templateId" uuid NOT NULL,
    "versionNumber" integer NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    "contentType" character varying(20) DEFAULT 'html'::character varying NOT NULL,
    status public."TemplateVersionStatus" DEFAULT 'DRAFT'::public."TemplateVersionStatus" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "publishedBy" uuid,
    notes character varying(500),
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL,
    "storageUri" character varying(1000),
    "originalFilename" character varying(500),
    "mimeType" character varying(100),
    "fileSize" integer,
    checksum character varying(64),
    "placeholderCount" integer,
    "importStatus" character varying(20)
);


ALTER TABLE public.template_versions OWNER TO "abdul-razack-a";

--
-- Name: templates; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.templates (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    "documentTypeId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(500),
    status public."TemplateStatus" DEFAULT 'DRAFT'::public."TemplateStatus" NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.templates OWNER TO "abdul-razack-a";

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.user_roles (
    "identityUserId" uuid NOT NULL,
    "roleId" uuid NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" uuid NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public.user_roles OWNER TO "abdul-razack-a";

--
-- Name: workflow_definitions; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.workflow_definitions (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "companyId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(500),
    "entityType" character varying(50) NOT NULL,
    status public."WorkflowStatus" DEFAULT 'DRAFT'::public."WorkflowStatus" NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" uuid,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.workflow_definitions OWNER TO "abdul-razack-a";

--
-- Name: workflow_history; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.workflow_history (
    id uuid NOT NULL,
    "workflowInstanceId" uuid NOT NULL,
    "stageId" uuid NOT NULL,
    action character varying(100) NOT NULL,
    notes text,
    "performedBy" uuid NOT NULL,
    "performedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb
);


ALTER TABLE public.workflow_history OWNER TO "abdul-razack-a";

--
-- Name: workflow_instances; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.workflow_instances (
    id uuid NOT NULL,
    "businessId" character varying(20) NOT NULL,
    "workflowDefinitionId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "entityType" character varying(50) NOT NULL,
    "entityId" uuid NOT NULL,
    "candidateId" uuid,
    "employeeId" uuid,
    "currentStageId" uuid,
    status public."WorkflowInstanceStatus" DEFAULT 'PENDING'::public."WorkflowInstanceStatus" NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.workflow_instances OWNER TO "abdul-razack-a";

--
-- Name: workflow_stages; Type: TABLE; Schema: public; Owner: abdul-razack-a
--

CREATE TABLE public.workflow_stages (
    id uuid NOT NULL,
    "workflowDefinitionId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(500),
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isTerminal" boolean DEFAULT false NOT NULL,
    "isFinal" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid NOT NULL
);


ALTER TABLE public.workflow_stages OWNER TO "abdul-razack-a";

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.audit_logs (id, "businessId", "companyId", "entityType", "entityBusinessId", action, "performedBy", "performedAt", "beforeState", "afterState", "correlationId", "ipAddress", remarks) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.branches (id, "businessId", "companyId", name, code, address, city, state, country, pincode, "isHeadquarters", "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
2b187d14-b8c8-405d-be3c-c89c94a2e584	BRN-001	2fadcb4e-adef-491b-bc85-811487845a69	Headquarters - Silicon Valley	HQ	\N	\N	\N	\N	\N	f	t	f	\N	\N	1	2026-09-25 14:51:36.571	2026-09-25 14:51:36.571	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: business_id_counters; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.business_id_counters (prefix, counter, "updatedAt") FROM stdin;
TPL	9	2026-09-26 15:53:35.815
TVER	11	2026-09-26 15:55:14.302
EMP	3	2026-09-26 16:07:33.644
GDOC	20	2026-09-26 16:07:54.011
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.candidates (id, "businessId", "profileId", "companyId", status, "appliedDate", source, "referredBy", notes, "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.companies (id, "businessId", name, "legalName", code, "logoUrl", website, industry, "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy", address, phone, email, "authorizedPerson", "authorizedPersonDesignation", "signatureUrl") FROM stdin;
2fadcb4e-adef-491b-bc85-811487845a69	CMP-001	Acme Corporation	Acme Corporation Inc.	ACME	\N	https://acme.example.com	Software & Technology	t	f	\N	\N	1	2026-07-22 07:21:58.432	2026-09-25 14:51:36.556	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000	100 Innovation Way, Suite 400, Tech City, CA 94016	+1 (555) 234-5678	hr@acme.example.com	Sarah Jenkins	Chief People Officer	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.departments (id, "businessId", "companyId", name, code, description, "parentId", "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
7e1eea4f-79ea-4ef5-8225-0a1315e90a61	DPT-001	2fadcb4e-adef-491b-bc85-811487845a69	Software Engineering	ENG	\N	\N	t	f	\N	\N	1	2026-09-25 14:51:36.575	2026-09-25 14:51:36.575	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.designations (id, "businessId", "companyId", name, code, description, level, "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
d2c4e8e1-f1ca-4c42-8ef0-c7c0ce6084ad	DSG-001	2fadcb4e-adef-491b-bc85-811487845a69	Senior Full Stack Engineer	SWE-SR	\N	4	t	f	\N	\N	1	2026-09-25 14:51:36.579	2026-09-25 14:51:36.579	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: document_snapshots; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.document_snapshots (id, "generatedDocumentId", "filePath", "fileUrl", "fileSize", "mimeType", checksum, "storageProvider", "renderedContent", "createdAt", "createdBy") FROM stdin;
2ac52de8-aa6c-433e-bfd8-f7d9aff0e23a	761452f7-31b3-4907-8e03-f5255932742e	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/f3765ec7-1add-4add-be36-e4a08e0c3c51/GDOC_000001/generated.html	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/f3765ec7-1add-4add-be36-e4a08e0c3c51/GDOC_000001/generated.html	3696	text/html	03f1233191fcba4b7469171e00b602d123da91d6cd31ca2fdbf48a51dacf8545	LocalStorageAdapter	\N	2026-09-25 14:53:55.194	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
d1da510d-aa83-4855-bb38-4184c08963d7	761452f7-31b3-4907-8e03-f5255932742e	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/f3765ec7-1add-4add-be36-e4a08e0c3c51/GDOC_000001/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/f3765ec7-1add-4add-be36-e4a08e0c3c51/GDOC_000001/generated.pdf	39949	application/pdf	5384650328f52ad88d9e4dedcc85a1d9878654eb541fc7adb9d5995e101067aa	LocalStorageAdapter	\N	2026-09-25 14:53:55.194	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
6c5cad16-0f43-4b88-ab26-f6eb3fb843e8	87bca8c4-9455-4945-8a49-b43103c1894e	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000002/generated.html	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000002/generated.html	1495	text/html	6c70d004ca9466b02a66287e9fdac91d6733080e47d81b1e36580bb6dd671ca3	LocalStorageAdapter	\N	2026-09-25 15:10:03.917	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
1f7a6fd8-062f-4fcb-821f-0b0755e82ed2	87bca8c4-9455-4945-8a49-b43103c1894e	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000002/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000002/generated.pdf	45468	application/pdf	ea30cd8b2150f99ae0ddc23e1ffc91a04337f3b8dd35244d74de444744784a2d	LocalStorageAdapter	\N	2026-09-25 15:10:03.917	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
fd4e1bc7-ad9f-4e8c-8c29-8276eb3acdc3	4ba7085d-ce5a-4357-b378-176f5f53ba61	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000003/generated.html	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000003/generated.html	1495	text/html	6c70d004ca9466b02a66287e9fdac91d6733080e47d81b1e36580bb6dd671ca3	LocalStorageAdapter	\N	2026-09-25 15:10:29.357	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
f6e32ce6-4b1b-47c0-9e49-7b7c1d76252c	4ba7085d-ce5a-4357-b378-176f5f53ba61	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000003/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000003/generated.pdf	45468	application/pdf	07c0fa1c6de81719efeb0c523a6e40e3f6df221c2376268a31ce574aad94989b	LocalStorageAdapter	\N	2026-09-25 15:10:29.357	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
090207ea-4806-4f4f-8a5d-64c633232db3	1e64bad2-1383-4afa-a822-f87532ad9b99	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000004/generated.html	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000004/generated.html	1485	text/html	b357b2cd118abe85d404fc73765b8c631cbae3764d5c2bfb77021077be43ec28	LocalStorageAdapter	\N	2026-09-25 15:14:23.085	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
ca7c952e-79e3-453c-8ac8-20339298751a	1e64bad2-1383-4afa-a822-f87532ad9b99	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000004/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000004/generated.pdf	45472	application/pdf	c2a3d9d5806c519592be76b4b9d0f55fada265d66dd68cf7480bc2a11fb1499c	LocalStorageAdapter	\N	2026-09-25 15:14:23.085	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
668ef469-ba76-4074-88e4-e154a72f6543	4ba9471e-8283-462d-b5ff-51d04917cf37	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000005/generated.html	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000005/generated.html	1485	text/html	b357b2cd118abe85d404fc73765b8c631cbae3764d5c2bfb77021077be43ec28	LocalStorageAdapter	\N	2026-09-25 15:26:31.312	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
19954ee1-930a-4212-bc3d-05e2df6ab82f	4ba9471e-8283-462d-b5ff-51d04917cf37	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000005/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000005/generated.pdf	45472	application/pdf	40c26ab4bd1d62270280bc99ab4511199fdac3e6ebbbd2feadb3afd2d4d7a709	LocalStorageAdapter	\N	2026-09-25 15:26:31.312	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
8b4a8042-6f91-4d61-8ba4-6b5ee2964fde	4d5245fc-e49e-40c8-bbca-b8c161d35247	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000006/generated.html	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000006/generated.html	1485	text/html	b357b2cd118abe85d404fc73765b8c631cbae3764d5c2bfb77021077be43ec28	LocalStorageAdapter	\N	2026-09-25 15:28:07.541	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
bb69f355-15bb-4037-9a95-63ff162d6c5a	4d5245fc-e49e-40c8-bbca-b8c161d35247	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000006/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000006/generated.pdf	45472	application/pdf	9c08cd00a546f4da968051e53fc9a725a1bd041906cdb8cf12acac14b69fe3f3	LocalStorageAdapter	\N	2026-09-25 15:28:07.541	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
1797bde4-83a8-47c6-ba85-7af2d8064d4d	911e000f-38e2-4b50-a40d-314020533357	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000018/generated.docx	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000018/generated.docx	45570	application/vnd.openxmlformats-officedocument.wordprocessingml.document	9f3fcf4a9529ef8ed2cc4a29a400633ba1079c9eef45f5ba0f76d24f5b8f62cb	LocalStorageAdapter	\N	2026-09-26 09:47:15.052	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
8ef5029c-7d61-4893-a31d-8bcdeb048663	911e000f-38e2-4b50-a40d-314020533357	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000018/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000018/generated.pdf	55972	application/pdf	4f8718db4375142e698eacc949bd4f0fe028b7e5474d0683b93e17096042d28c	LocalStorageAdapter	\N	2026-09-26 09:47:15.053	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
9dc47c38-34d0-4ca8-98a5-09249a663781	0f3f7fd2-ae9f-4b25-a080-5d38eac375b6	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000019/generated.docx	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000019/generated.docx	198454	application/vnd.openxmlformats-officedocument.wordprocessingml.document	0ce63e18aabd000ce356d89c1b68314d2e2a2c3b7d315d1e51e8d0adbfe2fd2a	LocalStorageAdapter	\N	2026-09-26 10:26:35.87	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
ef6ec5f5-3169-4508-9736-3b69ada15777	0f3f7fd2-ae9f-4b25-a080-5d38eac375b6	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000019/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/df9cba32-1778-4692-a378-5bb5a5bcfbd3/GDOC_000019/generated.pdf	173785	application/pdf	4666a0b31543609c6003e1c6c113fdd4b3a6abe9c5fe1182c8848a62741624c7	LocalStorageAdapter	\N	2026-09-26 10:26:35.87	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
7fdc6cd1-3d2c-48d2-bc49-afcd433f0241	f21b0e7e-c179-4475-9e7e-bbf8904f561a	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/155c59a6-2168-431b-b006-f43748a855b3/GDOC_000020/generated.html	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/155c59a6-2168-431b-b006-f43748a855b3/GDOC_000020/generated.html	3669	text/html	193eaded750c0789b635786ae3d784dc26ba8051b6c838323939460c641445d8	LocalStorageAdapter	\N	2026-09-26 10:37:54.125	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
180ce3c9-2f8f-442c-8358-d270b5ea5884	f21b0e7e-c179-4475-9e7e-bbf8904f561a	documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/155c59a6-2168-431b-b006-f43748a855b3/GDOC_000020/generated.pdf	local://documents/2fadcb4e-adef-491b-bc85-811487845a69/employees/155c59a6-2168-431b-b006-f43748a855b3/GDOC_000020/generated.pdf	56160	application/pdf	a8e4848717c4b3f7f2bc2ecdcc28ce5bdcb88555c9556c1e6b94a1bb948aaf8b	LocalStorageAdapter	\N	2026-09-26 10:37:54.125	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
\.


--
-- Data for Name: document_types; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.document_types (id, "businessId", "companyId", name, code, description, "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
e635eac0-0f24-4469-857c-3430eebf069f	SMATAL-DEMO-DCT-001	2fadcb4e-adef-491b-bc85-811487845a69	Offer Letter	OFFER_LETTER	Employment offer issued before candidate joining	t	f	\N	\N	1	2026-09-25 14:30:59.891	2026-09-25 14:30:59.891	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
0fb2f288-f840-4275-8d7d-207b77026624	SMATAL-DEMO-DCT-002	2fadcb4e-adef-491b-bc85-811487845a69	Appointment Letter	APPOINTMENT_LETTER	Formal employment appointment letter specifying terms and conditions	t	f	\N	\N	1	2026-09-25 14:30:59.895	2026-09-25 14:30:59.895	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
20c19cfb-f5e1-42f2-9f41-4dc8e083f633	SMATAL-DEMO-DCT-003	2fadcb4e-adef-491b-bc85-811487845a69	Joining Letter	JOINING_LETTER	Joining confirmation and official reporting documentation	t	f	\N	\N	1	2026-09-25 14:30:59.898	2026-09-25 14:30:59.898	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
7cae883f-96ac-403a-a6ed-1851559f322c	SMATAL-DEMO-DCT-004	2fadcb4e-adef-491b-bc85-811487845a69	Confirmation Letter	CONFIRMATION_LETTER	Employment confirmation issued following probation completion	t	f	\N	\N	1	2026-09-25 14:30:59.9	2026-09-25 14:30:59.9	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
b87f298a-5c3c-4322-95a0-94068b6610b4	SMATAL-DEMO-DCT-005	2fadcb4e-adef-491b-bc85-811487845a69	Promotion Letter	PROMOTION_LETTER	Official promotion letter recognizing role advancement and title upgrade	t	f	\N	\N	1	2026-09-25 14:30:59.902	2026-09-25 14:30:59.902	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
d0948279-3bad-4df1-846c-b632ebf21c9c	SMATAL-DEMO-DCT-006	2fadcb4e-adef-491b-bc85-811487845a69	Salary Revision Letter	SALARY_REVISION_LETTER	Formal compensation adjustment and increment letter	t	f	\N	\N	1	2026-09-25 14:30:59.904	2026-09-25 14:30:59.904	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
6cb303ca-c9c5-47c8-bfb7-81d9892947bb	SMATAL-DEMO-DCT-007	2fadcb4e-adef-491b-bc85-811487845a69	No Objection Certificate (NOC)	NOC	Official No Objection Certificate for travel, banking, or education	t	f	\N	\N	1	2026-09-25 14:30:59.906	2026-09-25 14:30:59.906	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
a9682673-5011-47ae-9b7b-29838add4081	SMATAL-DEMO-DCT-008	2fadcb4e-adef-491b-bc85-811487845a69	Resignation Acceptance Letter	RESIGNATION_ACCEPTANCE	Formal acknowledgement and acceptance of employee resignation	t	f	\N	\N	1	2026-09-25 14:30:59.907	2026-09-25 14:30:59.907	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
306e25d9-36c8-420e-a36a-d0a1a232731d	SMATAL-DEMO-DCT-009	2fadcb4e-adef-491b-bc85-811487845a69	Relieving Letter	RELIEVING_LETTER	Official relieving letter issued upon exit handover completion	t	f	\N	\N	1	2026-09-25 14:30:59.909	2026-09-25 14:30:59.909	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
c3e06ff8-3812-45d6-98ac-577a1a7f747f	SMATAL-DEMO-DCT-010	2fadcb4e-adef-491b-bc85-811487845a69	Experience Certificate	EXPERIENCE_CERTIFICATE	Employment experience and service period confirmation	t	f	\N	\N	1	2026-09-25 14:30:59.912	2026-09-25 14:30:59.912	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
b380deaa-fd30-461b-9772-6c8fd1afbf9b	SMATAL-DEMO-DCT-011	2fadcb4e-adef-491b-bc85-811487845a69	Service Certificate	SERVICE_CERTIFICATE	Comprehensive service and conduct certificate for separated employees	t	f	\N	\N	1	2026-09-25 14:30:59.913	2026-09-25 14:30:59.913	00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.employees (id, "businessId", "profileId", "companyId", "branchId", "departmentId", "designationId", "reportsToId", "employeeNumber", status, "joinedDate", "confirmationDate", "probationEndDate", "terminationDate", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy", "employmentType", salary, "lastWorkingDate", "noticePeriodDays", "resignationDate", "resignationReason", "resignationStatus") FROM stdin;
f3765ec7-1add-4add-be36-e4a08e0c3c51	EMP_000001	56b1f292-755c-4216-a6f8-c8de2389ce2b	2fadcb4e-adef-491b-bc85-811487845a69	2b187d14-b8c8-405d-be3c-c89c94a2e584	7e1eea4f-79ea-4ef5-8225-0a1315e90a61	d2c4e8e1-f1ca-4c42-8ef0-c7c0ce6084ad	\N	EMP-0001	PROBATION	2026-09-25	\N	\N	\N	f	\N	\N	1	2026-09-25 14:53:39.542	2026-09-25 14:53:39.542	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Full-time	145000.00	\N	\N	\N	\N	\N
df9cba32-1778-4692-a378-5bb5a5bcfbd3	EMP_000002	f8f944be-160a-4c65-bf85-8cc6809c126a	2fadcb4e-adef-491b-bc85-811487845a69	2b187d14-b8c8-405d-be3c-c89c94a2e584	7e1eea4f-79ea-4ef5-8225-0a1315e90a61	d2c4e8e1-f1ca-4c42-8ef0-c7c0ce6084ad	\N	EMP-0002	PROBATION	2026-09-25	\N	\N	\N	f	\N	\N	1	2026-09-25 15:09:12.608	2026-09-25 15:09:12.608	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Full-time	150000.00	\N	\N	\N	\N	\N
155c59a6-2168-431b-b006-f43748a855b3	EMP_000003	76bf1296-ac07-4d47-b5c7-aae236c3205d	2fadcb4e-adef-491b-bc85-811487845a69	2b187d14-b8c8-405d-be3c-c89c94a2e584	7e1eea4f-79ea-4ef5-8225-0a1315e90a61	d2c4e8e1-f1ca-4c42-8ef0-c7c0ce6084ad	f3765ec7-1add-4add-be36-e4a08e0c3c51	EMP_000003	ACTIVE	2026-09-26	2026-09-26	2026-09-24	\N	f	\N	\N	1	2026-09-26 10:37:33.648	2026-09-26 10:37:33.648	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Full-time	1234567.00	\N	\N	\N	\N	\N
\.


--
-- Data for Name: employment_history; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.employment_history (id, "employeeId", "companyId", "changeType", "previousValue", "newValue", "effectiveDate", notes, "createdAt", "createdBy") FROM stdin;
f100b114-899e-4815-afa6-07c22bb1dc29	f3765ec7-1add-4add-be36-e4a08e0c3c51	2fadcb4e-adef-491b-bc85-811487845a69	JOINED	\N	PROBATION	2026-09-25 00:00:00	\N	2026-09-25 14:53:39.549	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
9cb2dca2-5a2d-4e6f-bbe0-4ebae0199c5d	df9cba32-1778-4692-a378-5bb5a5bcfbd3	2fadcb4e-adef-491b-bc85-811487845a69	JOINED	\N	PROBATION	2026-09-25 00:00:00	\N	2026-09-25 15:09:12.616	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
11391f6d-a2f5-450b-a3d2-28459aba04d6	155c59a6-2168-431b-b006-f43748a855b3	2fadcb4e-adef-491b-bc85-811487845a69	JOINED	\N	ACTIVE	2026-09-26 00:00:00	\N	2026-09-26 10:37:33.655	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
\.


--
-- Data for Name: exit_clearances; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.exit_clearances (id, "employeeId", "companyId", department, status, remarks, "clearedBy", "clearedAt", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: field_definitions; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.field_definitions (id, "businessId", "companyId", "machineKey", "displayName", description, "dataType", "entityType", "isSystem", "isRequired", "defaultValue", "displayOrder", "groupId", "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: field_groups; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.field_groups (id, "companyId", name, description, "displayOrder", "isDeleted", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: field_options; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.field_options (id, "fieldDefinitionId", label, value, "displayOrder", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: field_validations; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.field_validations (id, "fieldDefinitionId", "ruleType", "ruleValue", "errorMessage", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: field_values; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.field_values (id, "fieldDefinitionId", "companyId", "entityType", "entityId", "profileId", "candidateId", "employeeId", "leaveRequestId", "leavePolicyId", "valueData", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: generated_documents; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.generated_documents (id, "businessId", "companyId", "profileId", "documentTypeId", "templateVersionId", "workflowInstanceId", "workflowStageId", "entityType", "entityId", status, "generatedAt", "generatedBy", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy", "candidateId", "employeeId") FROM stdin;
761452f7-31b3-4907-8e03-f5255932742e	GDOC_000001	2fadcb4e-adef-491b-bc85-811487845a69	56b1f292-755c-4216-a6f8-c8de2389ce2b	e635eac0-0f24-4469-857c-3430eebf069f	ffab9dcc-ae4e-4eee-acf8-3dfc5893bdb7	\N	\N	EMPLOYEE	f3765ec7-1add-4add-be36-e4a08e0c3c51	GENERATED	2026-09-25 14:53:55.194	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-25 14:53:54.99	2026-09-25 14:53:54.99	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	f3765ec7-1add-4add-be36-e4a08e0c3c51
87bca8c4-9455-4945-8a49-b43103c1894e	GDOC_000002	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	GENERATED	2026-09-25 15:10:03.917	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-25 15:10:03.593	2026-09-25 15:10:03.593	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
4ba7085d-ce5a-4357-b378-176f5f53ba61	GDOC_000003	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	GENERATED	2026-09-25 15:10:29.357	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-25 15:10:29.027	2026-09-25 15:10:29.027	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
1e64bad2-1383-4afa-a822-f87532ad9b99	GDOC_000004	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	GENERATED	2026-09-25 15:14:23.085	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-25 15:14:22.76	2026-09-25 15:14:22.76	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
4ba9471e-8283-462d-b5ff-51d04917cf37	GDOC_000005	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	414e7810-51b3-4110-8652-d0998c810958	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	GENERATED	2026-09-25 15:26:31.312	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-25 15:26:30.871	2026-09-25 15:26:30.871	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
4d5245fc-e49e-40c8-bbca-b8c161d35247	GDOC_000006	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	GENERATED	2026-09-25 15:28:07.541	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-25 15:28:07.215	2026-09-25 15:28:07.215	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
e3f88af7-889f-433e-bcfc-41385ff473fd	GDOC_000007	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 07:37:28.927	2026-09-26 07:37:28.956	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
7bbb73a6-928f-4b92-8051-2b0681baae49	GDOC_000008	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 07:37:49.512	2026-09-26 07:37:49.528	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
7cc0d09a-4626-4d41-b110-4441eacc373b	GDOC_000009	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 07:38:20.546	2026-09-26 07:38:20.564	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
326fb685-1365-4e01-9806-f01947c3f876	GDOC_000010	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 07:39:12.577	2026-09-26 07:39:12.593	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
b682ba29-47f0-4d85-b643-387454097420	GDOC_000011	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 08:28:03.694	2026-09-26 08:28:03.712	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
4d049312-8ca1-4e88-ba84-195b98b84d8d	GDOC_000012	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 08:29:01.158	2026-09-26 08:29:01.166	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
54541c0d-e46b-4fb7-b0eb-b7b9db897217	GDOC_000013	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 08:43:55.011	2026-09-26 08:43:55.026	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
c11f7120-af2f-4918-bd73-eb798351d847	GDOC_000014	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	d45dcafc-d995-408e-a200-9f2725547b3a	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 09:00:26.944	2026-09-26 09:00:26.963	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
ccbe602b-43ac-4e14-86a2-240ee0ce890d	GDOC_000015	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	d45dcafc-d995-408e-a200-9f2725547b3a	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 09:12:49.066	2026-09-26 09:12:49.083	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
bf5f9682-7c5c-4121-8026-94cf9a83e297	GDOC_000016	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	d45dcafc-d995-408e-a200-9f2725547b3a	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 09:14:14.689	2026-09-26 09:14:14.702	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
d7017984-5261-48ac-b22e-5a5a48e8374f	GDOC_000017	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	FAILED	\N	\N	f	\N	\N	1	2026-09-26 09:43:13.641	2026-09-26 09:43:13.888	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
911e000f-38e2-4b50-a40d-314020533357	GDOC_000018	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	GENERATED	2026-09-26 09:47:15.053	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-26 09:47:14.493	2026-09-26 09:47:14.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
0f3f7fd2-ae9f-4b25-a080-5d38eac375b6	GDOC_000019	2fadcb4e-adef-491b-bc85-811487845a69	f8f944be-160a-4c65-bf85-8cc6809c126a	0fb2f288-f840-4275-8d7d-207b77026624	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	\N	EMPLOYEE	df9cba32-1778-4692-a378-5bb5a5bcfbd3	GENERATED	2026-09-26 10:26:35.871	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-26 10:26:35.517	2026-09-26 10:26:35.517	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	df9cba32-1778-4692-a378-5bb5a5bcfbd3
f21b0e7e-c179-4475-9e7e-bbf8904f561a	GDOC_000020	2fadcb4e-adef-491b-bc85-811487845a69	76bf1296-ac07-4d47-b5c7-aae236c3205d	e635eac0-0f24-4469-857c-3430eebf069f	ffab9dcc-ae4e-4eee-acf8-3dfc5893bdb7	\N	\N	EMPLOYEE	155c59a6-2168-431b-b006-f43748a855b3	GENERATED	2026-09-26 10:37:54.125	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f	\N	\N	1	2026-09-26 10:37:54.014	2026-09-26 10:37:54.014	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	155c59a6-2168-431b-b006-f43748a855b3
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.holidays (id, "businessId", "companyId", name, date, type, description, "branchId", "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: identity_users; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.identity_users (id, "businessId", "profileId", "companyId", email, "passwordHash", "isActive", "isEmailVerified", "emailVerifiedAt", "mfaEnabled", "mfaSecret", "lastLoginAt", "loginAttempts", "lockedUntil", "passwordChangedAt", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
dd663d28-ea68-44dd-80c9-1b3b5fad62f9	USR-001	30e97393-fbae-4ecb-b4fb-f36160b441a0	2fadcb4e-adef-491b-bc85-811487845a69	admin@smatal.com	$2b$10$Let32ec5Xmd2FyiD2B9Lm.ZOlFL3truhwrKFFBWXD8/7xdpML8/IS	t	t	\N	f	\N	2026-09-26 12:24:00.258	0	\N	\N	f	\N	\N	80	2026-07-22 07:21:58.543	2026-09-26 12:24:00.258	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: leave_accruals; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.leave_accruals (id, "leaveBalanceId", amount, "accrualDate", notes, "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.leave_balances (id, "businessId", "companyId", "employeeId", "leaveTypeId", year, "balanceType", "totalEntitlement", "accruedDays", "carriedForward", "usedDays", "pendingDays", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: leave_carry_forwards; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.leave_carry_forwards (id, "leaveBalanceId", "fromYear", amount, "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: leave_history; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.leave_history (id, "leaveRequestId", status, action, notes, "performedBy", "performedAt", metadata) FROM stdin;
\.


--
-- Data for Name: leave_policies; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.leave_policies (id, "businessId", "companyId", "leaveTypeId", name, description, "annualEntitlement", "accrualType", "carryForwardType", "maxCarryForwardDays", "requiresAttachment", "minDaysForAttachment", "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.leave_requests (id, "businessId", "companyId", "employeeId", "leaveTypeId", status, "startDate", "endDate", duration, "durationType", reason, "attachmentUrl", "workflowInstanceId", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.leave_types (id, "businessId", "companyId", name, code, description, "colorCode", "isPaid", "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.notifications (id, "businessId", "companyId", title, message, "notificationType", priority, recipient, "readStatus", "createdAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.permissions (id, resource, action, description, "isDeleted", "createdAt", "updatedAt") FROM stdin;
59f63be3-a688-477e-8616-c5b6c8e7fcc9	User	CREATE	Create users	f	2026-07-22 07:21:58.412	2026-09-23 14:29:07.769
3c96e18d-129e-4c53-a2b6-30088fb5d516	User	READ	Read users	f	2026-07-22 07:21:58.414	2026-09-23 14:29:07.772
a4904874-a3c9-4658-8999-1d7dad8c73bc	User	UPDATE	Update users	f	2026-07-22 07:21:58.415	2026-09-23 14:29:07.773
598cbe61-7eef-4f91-8893-46c1a41d5467	User	DELETE	Delete users	f	2026-07-22 07:21:58.415	2026-09-23 14:29:07.774
b0ae204d-5a36-4031-831d-9c12ded66304	Employee	CREATE	Create employees	f	2026-07-22 07:21:58.416	2026-09-23 14:29:07.775
7e508440-6706-4387-8553-465c0b5e3ab6	Employee	READ	View employees	f	2026-07-22 07:21:58.416	2026-09-23 14:29:07.776
a046fb16-d2a9-47bb-9650-f3469fecdf1b	Employee	UPDATE	Update employees	f	2026-07-22 07:21:58.416	2026-09-23 14:29:07.777
b94f2b69-4f7a-4286-93db-6152249bc11b	Employee	DELETE	Delete employees	f	2026-07-22 07:21:58.417	2026-09-23 14:29:07.778
f6e3df06-1c60-4437-94dd-e1882459c38f	Employee	ACTIVATE	Activate employees	f	2026-07-22 07:21:58.418	2026-09-23 14:29:07.779
32566ea0-c028-47be-930c-ce562bd980fb	Employee	TERMINATE	Terminate employees	f	2026-07-22 07:21:58.418	2026-09-23 14:29:07.78
00819596-eaca-45f6-a8e0-c84ea7ab601a	Employee	ADMIN	Administer all employees	f	2026-07-22 07:21:58.419	2026-09-23 14:29:07.781
3b98d7f9-3a92-4726-b709-63e0665f3133	Role	CREATE	Create roles	f	2026-07-22 07:21:58.419	2026-09-23 14:29:07.782
4468e324-2ce7-4fec-aaf1-a063fa1b0d73	Role	READ	Read roles	f	2026-07-22 07:21:58.419	2026-09-23 14:29:07.782
beb4e6ab-5dd6-4463-8aca-764a5a42f315	Role	UPDATE	Update roles	f	2026-07-22 07:21:58.42	2026-09-23 14:29:07.783
b150a1ad-4401-47c4-a72e-6150bc4646df	Role	DELETE	Delete roles	f	2026-07-22 07:21:58.42	2026-09-23 14:29:07.784
30a553de-f705-47d0-8723-13fa7ac745a6	Document	CREATE	Create documents	f	2026-07-22 07:21:58.42	2026-09-23 14:29:07.785
ac26c7b6-d8d3-4d15-bde4-f717614b89c9	Document	READ	Read documents	f	2026-07-22 07:21:58.421	2026-09-23 14:29:07.786
eb6bbe61-57fb-47c3-8f78-5401e2a8aa34	Workflow	CREATE	Create workflows	f	2026-07-22 07:21:58.421	2026-09-23 14:29:07.786
a7d28788-032a-42df-8047-2dfe62eee07a	Workflow	READ	Read workflows	f	2026-07-22 07:21:58.421	2026-09-23 14:29:07.787
343dc67e-b2fb-4e17-bec1-4bba12c4d053	Workflow	MANAGE	Manage workflows	f	2026-07-22 07:21:58.421	2026-09-23 14:29:07.788
8e629d83-644e-4884-94a9-9e54321c6dc4	Workflow	APPROVE	Approve workflows	f	2026-07-22 07:21:58.422	2026-09-23 14:29:07.789
3ad19d93-50cd-4fde-a917-a36c567ff2f6	Leave	READ	View leaves	f	2026-07-22 07:21:58.422	2026-09-23 14:29:07.789
744799c0-273a-4e7c-a91f-8a676aaf407c	Leave	CREATE	Create leave requests	f	2026-07-22 07:21:58.422	2026-09-23 14:29:07.79
5e6f6e0d-ded6-45ee-8613-0c90f509f97a	Leave	UPDATE	Update leave requests	f	2026-07-22 07:21:58.423	2026-09-23 14:29:07.791
9a975409-b756-4d3e-81fd-816fff452ca2	Leave	DELETE	Delete leave requests	f	2026-07-22 07:21:58.423	2026-09-23 14:29:07.792
8632e50b-cdd7-4b72-9150-7dd1b82f4bce	Leave	APPROVE	Approve leave requests	f	2026-07-22 07:21:58.423	2026-09-23 14:29:07.792
efa3bfc1-a838-4949-af7a-2a5770c84bba	Leave	REJECT	Reject leave requests	f	2026-07-22 07:21:58.423	2026-09-23 14:29:07.793
2a98b8fb-0bd1-42cd-bf91-5bfe8bb7808e	Leave	ADMIN	Administer all leaves and balances	f	2026-07-22 07:21:58.424	2026-09-23 14:29:07.793
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.profiles (id, "firstName", "lastName", "personalEmail", phone, "dateOfBirth", gender, nationality, "profilePhoto", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy", address) FROM stdin;
30e97393-fbae-4ecb-b4fb-f36160b441a0	Super	Admin	admin@smatal.com	+1234567890	\N	\N	\N	\N	f	\N	\N	1	2026-07-22 07:21:58.541	2026-09-23 14:29:07.905	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000	\N
56b1f292-755c-4216-a6f8-c8de2389ce2b	Jordan	Miller	jordan.miller@example.com	+1 555-987-6543	\N	\N	\N	\N	f	\N	\N	1	2026-09-25 14:53:39.533	2026-09-25 14:53:39.532	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N
f8f944be-160a-4c65-bf85-8cc6809c126a	Alex	Smith	alex.smith.1790348948202@example.com	+1 555-0199	\N	\N	\N	\N	f	\N	\N	1	2026-09-25 15:09:12.594	2026-09-25 15:09:12.593	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	742 Evergreen Terrace, Springfield
76bf1296-ac07-4d47-b5c7-aae236c3205d	abu	aj	dsfdv@v.com	532343625	2004-02-26	\N	\N	\N	f	\N	\N	1	2026-09-26 10:37:33.64	2026-09-26 10:37:33.639	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N
\.


--
-- Data for Name: resignations; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.resignations (id, "employeeId", "companyId", "resignationDate", "lastWorkingDate", "noticePeriodDays", reason, status, "acceptedBy", "acceptedAt", comments, "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.role_permissions ("roleId", "permissionId", "createdAt", "createdBy") FROM stdin;
f0a85ce7-802f-4133-8324-a11d85f0aaea	59f63be3-a688-477e-8616-c5b6c8e7fcc9	2026-07-22 07:21:58.438	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	3c96e18d-129e-4c53-a2b6-30088fb5d516	2026-07-22 07:21:58.44	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	a4904874-a3c9-4658-8999-1d7dad8c73bc	2026-07-22 07:21:58.44	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	598cbe61-7eef-4f91-8893-46c1a41d5467	2026-07-22 07:21:58.442	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	b0ae204d-5a36-4031-831d-9c12ded66304	2026-07-22 07:21:58.442	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	7e508440-6706-4387-8553-465c0b5e3ab6	2026-07-22 07:21:58.443	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	a046fb16-d2a9-47bb-9650-f3469fecdf1b	2026-07-22 07:21:58.444	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	b94f2b69-4f7a-4286-93db-6152249bc11b	2026-07-22 07:21:58.445	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	f6e3df06-1c60-4437-94dd-e1882459c38f	2026-07-22 07:21:58.446	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	32566ea0-c028-47be-930c-ce562bd980fb	2026-07-22 07:21:58.447	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	00819596-eaca-45f6-a8e0-c84ea7ab601a	2026-07-22 07:21:58.447	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	3b98d7f9-3a92-4726-b709-63e0665f3133	2026-07-22 07:21:58.448	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	4468e324-2ce7-4fec-aaf1-a063fa1b0d73	2026-07-22 07:21:58.449	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	beb4e6ab-5dd6-4463-8aca-764a5a42f315	2026-07-22 07:21:58.45	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	b150a1ad-4401-47c4-a72e-6150bc4646df	2026-07-22 07:21:58.451	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	30a553de-f705-47d0-8723-13fa7ac745a6	2026-07-22 07:21:58.452	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	ac26c7b6-d8d3-4d15-bde4-f717614b89c9	2026-07-22 07:21:58.453	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	eb6bbe61-57fb-47c3-8f78-5401e2a8aa34	2026-07-22 07:21:58.454	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	a7d28788-032a-42df-8047-2dfe62eee07a	2026-07-22 07:21:58.456	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	343dc67e-b2fb-4e17-bec1-4bba12c4d053	2026-07-22 07:21:58.456	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	8e629d83-644e-4884-94a9-9e54321c6dc4	2026-07-22 07:21:58.457	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	3ad19d93-50cd-4fde-a917-a36c567ff2f6	2026-07-22 07:21:58.458	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	744799c0-273a-4e7c-a91f-8a676aaf407c	2026-07-22 07:21:58.459	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	5e6f6e0d-ded6-45ee-8613-0c90f509f97a	2026-07-22 07:21:58.46	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	9a975409-b756-4d3e-81fd-816fff452ca2	2026-07-22 07:21:58.461	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	8632e50b-cdd7-4b72-9150-7dd1b82f4bce	2026-07-22 07:21:58.461	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	efa3bfc1-a838-4949-af7a-2a5770c84bba	2026-07-22 07:21:58.462	00000000-0000-0000-0000-000000000000
f0a85ce7-802f-4133-8324-a11d85f0aaea	2a98b8fb-0bd1-42cd-bf91-5bfe8bb7808e	2026-07-22 07:21:58.463	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.roles (id, "businessId", "companyId", name, code, description, "isSystem", "isActive", "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
f0a85ce7-802f-4133-8324-a11d85f0aaea	ROL-001	2fadcb4e-adef-491b-bc85-811487845a69	Super Admin	SUPER_ADMIN	Full system access	t	t	f	\N	\N	1	2026-07-22 07:21:58.436	2026-09-23 14:29:07.812	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
b8155a4b-4d35-4835-b3aa-881abe5ee72a	ROL-002	2fadcb4e-adef-491b-bc85-811487845a69	Company Admin	COMPANY_ADMIN	Company level administration	t	t	f	\N	\N	1	2026-07-22 07:21:58.463	2026-09-23 14:29:07.83	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
e2c9ff8b-a9cd-41c0-a293-6178edc10210	ROL-003	2fadcb4e-adef-491b-bc85-811487845a69	HR Manager	HR_MANAGER	HR operations	t	t	f	\N	\N	1	2026-07-22 07:21:58.464	2026-09-23 14:29:07.831	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
f56b2d72-1560-48b1-b46e-1e21e75d72c9	ROL-004	2fadcb4e-adef-491b-bc85-811487845a69	Recruiter	RECRUITER	Recruitment operations	t	t	f	\N	\N	1	2026-07-22 07:21:58.465	2026-09-23 14:29:07.832	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
c9717f3c-a5c3-48c3-80aa-83dfb917c3d2	ROL-005	2fadcb4e-adef-491b-bc85-811487845a69	Employee	EMPLOYEE	Standard employee access	t	t	f	\N	\N	1	2026-07-22 07:21:58.466	2026-09-23 14:29:07.833	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: template_placeholders; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.template_placeholders (id, "templateVersionId", "fieldDefinitionId", "placeholderKey", "isRequired", "displayOrder", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
d3c760de-b20f-4428-8bff-735ea73030e2	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	system.currentDate	t	0	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
46e3e97f-b401-4a94-8028-1da75546d1e1	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	employee.fullName	t	1	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
9fc53524-80d5-4090-a356-7441ed2a4f6a	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	employee.designation	t	2	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
84f64c94-1ebf-4f3a-9448-e647341315c9	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	employee.department	t	3	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
7e90da96-692f-4c48-ae3b-305df2a32c38	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	company.name	t	4	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
a9613819-5b57-485d-840b-9a7890171323	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	employee.employeeId	t	5	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
2a3c2c96-48c6-4973-9d5c-09df13c191a4	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	employee.joiningDate	t	6	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
847480de-f4f6-424e-ab28-627c3e01746d	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	employee.employmentType	t	7	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
941d0af7-f06f-4fc4-941b-b80b57cd0bee	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	employee.salary	t	8	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
6283b16d-464f-4df8-a23e-ed08cb14e993	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	company.address	t	9	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
85104cfd-ed33-44b2-b418-8fdc488df650	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	company.authorizedPerson	t	10	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
f219b988-efa1-45f1-b0a0-85b9f7bd8123	eb5ec6b0-53b2-4a3a-88c6-8f2708512821	\N	company.authorizedPersonDesignation	t	11	2026-09-25 15:09:36.689	2026-09-25 15:09:36.689	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
6150f95a-2bd4-4eb0-8c76-738e6c940593	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	employee_name	t	0	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
85a60b72-ad97-4ac6-9ffb-e61283ee45bb	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	system.currentDate	t	0	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
fc2c3d31-9a06-40cf-accf-2968ac79da0f	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	employee.fullName	t	1	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
b59cb0d3-52c7-4fc7-b252-36f8354e70b2	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	employee.designation	t	2	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
d0529f2b-4ec5-4adb-9ad5-7d05ccd98563	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	employee.department	t	3	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
bdb3af08-fe7b-4976-924b-fd828ab8038f	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	company.name	t	4	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
8114860a-26d9-42d7-8169-27403d58533a	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	employee.employeeId	t	5	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
272d5d55-0ec6-45d2-9e9f-f34bd4a6d8a9	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	employee.joiningDate	t	6	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
93d4f0c8-81f5-4935-8d0f-e6725c3297c0	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	employee.employmentType	t	7	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
0327fa5e-a67a-4fd1-9959-a555223e2e42	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	employee.salary	t	8	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
aa4eedcd-a607-4365-aeb8-78212482fe89	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	company.address	t	9	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
b4c646d8-a836-4551-a104-63e2590c08db	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	company.authorizedPerson	t	10	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
8be2ff75-85ea-40c5-8e52-5e9bb991c128	bb0afb64-cfa2-4086-b7f0-67b1c2466edc	\N	company.authorizedPersonDesignation	t	11	2026-09-25 15:13:54.777	2026-09-25 15:13:54.777	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
3da7f861-017f-4ae8-bfe7-f056d76122ab	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	designation	t	1	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
467e6d7f-c4f8-4a6c-b27d-b0dc7c989368	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	department	t	2	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
deb9eda2-d531-42f7-98ce-efa820073a10	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	company_name	t	3	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
ceb84aeb-1fc0-4b95-a047-508f083ce475	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	employee_id	t	4	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
03339759-9d34-4232-ab97-b6f6f6e1a07b	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	joining_date	t	5	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
e0e1ff13-14df-4338-8f16-41f00b922acd	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	salary	t	6	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
c2336a63-62a6-4f29-9262-d14036f45581	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	employee_grade	t	7	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
28e45e58-8332-4d0e-9896-b5113f90858e	170a7fe5-5722-4418-a6bc-2a203385ee92	\N	company_address	t	8	2026-09-26 08:55:59.935	2026-09-26 08:55:59.935	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
a4c041dd-b72b-4707-b43c-6dc683158c5d	d45dcafc-d995-408e-a200-9f2725547b3a	\N	candidate.fullName	t	0	2026-09-26 08:55:59.946	2026-09-26 08:55:59.946	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
b54188cb-d7b2-49f6-ae5e-e80aa9de007f	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.employeeId	t	0	2026-09-26 09:41:34.311	2026-09-26 09:41:34.311	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
cabbbbff-6f19-4c93-9fab-eda86858692e	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	system.currentDate	t	2	2026-09-26 09:41:34.322	2026-09-26 09:41:34.322	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
fadbacdc-ebfc-4d3e-ae05-f563ceff17fd	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.fullName	t	4	2026-09-26 09:41:34.323	2026-09-26 09:41:34.323	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
24416481-0bfb-4ff7-8764-5a22a4203b59	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.designation	f	6	2026-09-26 09:41:34.325	2026-09-26 09:41:34.325	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
9ca40241-9911-481f-b985-8c53ce8f592d	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.department	f	8	2026-09-26 09:41:34.327	2026-09-26 09:41:34.327	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
03873c5f-46f1-49ed-875a-908d638db022	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.joiningDate	f	10	2026-09-26 09:41:34.328	2026-09-26 09:41:34.328	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
fdd5e059-4368-46aa-9899-5d775769413f	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.employmentType	f	12	2026-09-26 09:41:34.33	2026-09-26 09:41:34.33	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
e311e2ee-cb2a-44aa-a835-fe5deae790ff	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.salary	f	14	2026-09-26 09:41:34.331	2026-09-26 09:41:34.331	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
16350736-069e-4a50-ab7a-9ee3483b929e	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	employee.probationEndDate	f	16	2026-09-26 09:41:34.332	2026-09-26 09:41:34.332	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
74d9f8b7-08fb-44e2-bc6f-9531b126a629	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	company.address	f	18	2026-09-26 09:41:34.334	2026-09-26 09:41:34.334	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
8995715d-37a0-4dbd-95db-9f373a6ef973	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	company.name	t	20	2026-09-26 09:41:34.335	2026-09-26 09:41:34.335	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
b80b8910-0b1c-453b-8e36-b40a8b440d02	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	company.authorizedPerson	f	22	2026-09-26 09:41:34.337	2026-09-26 09:41:34.337	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
5582722a-e2aa-4b06-ac24-f8170f4222ee	1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	\N	company.authorizedPersonDesignation	f	24	2026-09-26 09:41:34.338	2026-09-26 09:41:34.338	30e97393-fbae-4ecb-b4fb-f36160b441a0	30e97393-fbae-4ecb-b4fb-f36160b441a0
23a604a8-0da5-4e3c-bdd6-1c9c42e38a22	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	candidate.fullName	t	0	2026-09-26 07:34:56.739	2026-09-26 07:34:56.739	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
23d55b76-31af-44b0-838f-7066a92b082e	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	company.name	t	1	2026-09-26 07:34:56.739	2026-09-26 07:34:56.739	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
927373af-607f-4b5d-abea-6380a1edc54e	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	company.authorizedPerson	t	2	2026-09-26 07:34:56.739	2026-09-26 07:34:56.739	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
02fa3b2d-a15f-4f5b-a76c-539b91148dee	50435d92-3d42-44b4-b564-8dcb1c5b3806	\N	company.authorizedPersonDesignation	t	3	2026-09-26 07:34:56.739	2026-09-26 07:34:56.739	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
ff1eaaa7-dc52-4978-b6bb-61230ea0bb0e	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	system.currentDate	t	0	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
bccc7087-8938-4c33-aa0b-f68f34ac5168	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	employee.fullName	t	1	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
4e0564e8-5b8a-408f-a4aa-4b78d10859b2	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	employee.designation	t	2	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
08f0a1b9-a4b5-4038-856e-f885e3721b90	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	employee.department	t	3	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
fe542972-5719-48b3-aa49-6f4bf7b18c7d	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	company.name	t	4	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
3f48537d-4eb6-4300-9577-6168e79f6677	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	employee.employeeId	t	5	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
3bb21d69-0134-4383-bf04-42ab0b1e070e	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	employee.joiningDate	t	6	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
f240a053-56c1-4a86-a5e4-6ed629e73751	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	employee.employmentType	t	7	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
b04791c5-2a3f-409d-af59-77c11ba00d81	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	employee.salary	t	8	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
ea07fb18-bf5f-4c36-82d6-62f3db54c28b	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	company.address	t	9	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
238923f4-24b0-4c54-9a33-43ba52119a7b	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	company.authorizedPerson	t	10	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
64c2f239-f673-414b-a4e9-d67cfb0f2269	c694b925-358b-4b9f-83f5-dd51418e4cbd	\N	company.authorizedPersonDesignation	t	11	2026-09-25 15:17:06.33	2026-09-25 15:17:06.33	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
d4b0c9ad-d9e3-498e-bded-ea33c7fcfbd5	414e7810-51b3-4110-8652-d0998c810958	\N	system.currentDate	t	0	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
94d6050c-efe6-4fb9-9f1c-5745b8e71736	414e7810-51b3-4110-8652-d0998c810958	\N	employee.fullName	t	1	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
600c1dd1-4d7c-4967-82ec-edc1dc8f3e1e	414e7810-51b3-4110-8652-d0998c810958	\N	employee.designation	t	2	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
a62c9c22-878e-4f50-bcd4-0e9477cef1c7	414e7810-51b3-4110-8652-d0998c810958	\N	employee.department	t	3	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
1359a6b3-b62b-4e0a-a2fb-98a093a9ccb9	414e7810-51b3-4110-8652-d0998c810958	\N	company.name	t	4	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
8a2190ce-14e5-42ab-8c01-94b9b6c1b5ab	414e7810-51b3-4110-8652-d0998c810958	\N	employee.employeeId	t	5	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
a972d2cb-2016-4585-9de8-4404f90520a5	414e7810-51b3-4110-8652-d0998c810958	\N	employee.joiningDate	t	6	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
5a504fab-5be3-488b-b89c-522f30a5baa7	414e7810-51b3-4110-8652-d0998c810958	\N	employee.employmentType	t	7	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
0629fae9-c5f5-4a5b-8e14-a2fc68ae6a0d	414e7810-51b3-4110-8652-d0998c810958	\N	employee.salary	t	8	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
b9fe8676-bf4c-463f-9ccf-406c1eea7df8	414e7810-51b3-4110-8652-d0998c810958	\N	company.address	t	9	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
350a4ab1-3cff-4a07-969b-fce8bb6432c1	414e7810-51b3-4110-8652-d0998c810958	\N	company.authorizedPerson	t	10	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
b60c34e9-f6f1-4b9a-9f54-6af18a9a2f45	414e7810-51b3-4110-8652-d0998c810958	\N	company.authorizedPersonDesignation	t	11	2026-09-25 15:26:01.885	2026-09-25 15:26:01.885	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
78494cfe-512b-44d1-95a5-1afe834da1c7	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	system.currentDate	t	0	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
60888f2b-62ec-47ca-a6df-d31f2e93e292	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	employee.fullName	t	1	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
8e61f8ea-9cb1-4ab4-8b93-df35c25be6f2	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	employee.designation	t	2	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
dda67305-d720-4cea-a2cc-3a0e74f133c0	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	employee.department	t	3	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
354c7050-9a9d-40a5-b506-0010815ddde0	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	company.name	t	4	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
2bba10e4-f547-4e58-879e-0a486759e620	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	employee.employeeId	t	5	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
63fb1f85-e646-4cee-af0a-6ce51200ab96	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	employee.joiningDate	t	6	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
745f8a26-add5-4bf1-823a-20315e6f95a1	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	employee.employmentType	t	7	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
9ac9c1cc-3da7-43fd-a691-593dce5e242e	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	employee.salary	t	8	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
07ae1d93-f039-449f-86e3-138c921a8792	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	company.address	t	9	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
0906fe57-4480-41b2-8d18-a1a3ac150add	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	company.authorizedPerson	t	10	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
ca67a1f1-85bf-4a16-931a-add377597357	fc3c7763-d14c-4dc3-9116-81cf5ff72227	\N	company.authorizedPersonDesignation	t	11	2026-09-25 15:27:37.843	2026-09-25 15:27:37.843	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
83e3c14b-02e5-485b-8aca-a4f5ca06b44b	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.employeeId	t	0	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
9f85b6c8-07e3-4800-8a12-78c4238b141f	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	system.currentDate	t	1	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
3d136f1f-89fc-4253-8f47-60e6db648779	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.fullName	t	2	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
82af8588-fd66-4449-9304-1b2f7a6f73cf	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.designation	t	3	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
717ae70b-bdc5-42b1-8dc5-abdaa9a294f1	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.department	t	4	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
62d0e8fb-8a1a-4be9-87fc-8048da51c9bb	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.joiningDate	t	5	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
be8a7a2e-d9b4-40e3-ab3c-40c20601a890	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.employmentType	t	6	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
bd928b28-f21c-41f3-90c0-2271bfc81152	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.salary	t	7	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
3a91a25e-3bf6-4f40-8098-4a38188b275d	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	employee.probationEndDate	t	8	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
97accdc6-c9e0-4c4e-86f2-e0709fb67cf7	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	company.name	t	9	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
71fe60c6-3da5-4199-84d0-3957460b6fd9	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	company.authorizedPerson	t	10	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
e3682082-28d9-44f5-ae78-40b859f6a041	07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	\N	company.authorizedPersonDesignation	t	11	2026-09-26 10:25:31.493	2026-09-26 10:25:31.493	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
\.


--
-- Data for Name: template_versions; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.template_versions (id, "businessId", "templateId", "versionNumber", content, "contentType", status, "publishedAt", "publishedBy", notes, "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy", "storageUri", "originalFilename", "mimeType", "fileSize", checksum, "placeholderCount", "importStatus") FROM stdin;
ffab9dcc-ae4e-4eee-acf8-3dfc5893bdb7	TMV-001	38f244e2-f2b4-472f-9e9a-f7e92adfb4fc	1	<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px;">\n  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">\n    <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; text-transform: uppercase;">{{company.name}}</h1>\n    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">{{company.address}} | Email: {{company.email}} | Tel: {{company.phone}}</p>\n  </div>\n\n  <div style="margin-bottom: 25px;">\n    <p style="margin: 0; font-weight: bold;">Date: {{system.currentDate}}</p>\n  </div>\n\n  <div style="margin-bottom: 25px;">\n    <p style="margin: 0;">To,</p>\n    <p style="margin: 0; font-weight: bold; font-size: 16px;">{{employee.fullName}}</p>\n    <p style="margin: 0; color: #475569;">Email: {{employee.personalEmail}}</p>\n  </div>\n\n  <h2 style="color: #1e3a8a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">\n    SUBJECT: FORMAL EMPLOYMENT OFFER — {{employee.designation}}\n  </h2>\n\n  <p>Dear <strong>{{employee.fullName}}</strong>,</p>\n\n  <p>On behalf of <strong>{{company.name}}</strong>, we are thrilled to extend this formal offer of employment for the position of <strong>{{employee.designation}}</strong> within our <strong>{{employee.department}}</strong> team.</p>\n\n  <p>Your technical expertise, experience, and leadership align directly with our mission. Below are the key terms and conditions governing this offer:</p>\n\n  <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">\n    <tr style="background-color: #f8fafc;">\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1; font-weight: bold; width: 35%;">Position Title</td>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1;">{{employee.designation}}</td>\n    </tr>\n    <tr>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1; font-weight: bold;">Department</td>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1;">{{employee.department}}</td>\n    </tr>\n    <tr style="background-color: #f8fafc;">\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1; font-weight: bold;">Work Location / Branch</td>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1;">Headquarters - Silicon Valley</td>\n    </tr>\n    <tr>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1; font-weight: bold;">Anticipated Start Date</td>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1;">{{employee.joiningDate}}</td>\n    </tr>\n    <tr style="background-color: #f8fafc;">\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1; font-weight: bold;">Annual Total Compensation</td>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1; font-weight: bold; color: #166534;">$145,000 USD (Salary: {{employee.salary}})</td>\n    </tr>\n    <tr>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1; font-weight: bold;">Employment Type</td>\n      <td style="padding: 10px 15px; border: 1px solid #cbd5e1;">Full-Time Permanent</td>\n    </tr>\n  </table>\n\n  <p>Please indicate your acceptance of this offer by signing below and returning this letter prior to your start date. We look forward to welcoming you to the team!</p>\n\n  <div style="margin-top: 50px;">\n    <p style="margin: 0; font-weight: bold;">Sincerely,</p>\n    <div style="margin: 10px 0; font-family: cursive; font-size: 22px; color: #1e3a8a;">Sarah Jenkins</div>\n    <p style="margin: 0; font-weight: bold;">{{company.authorizedPerson}}</p>\n    <p style="margin: 0; color: #64748b;">{{company.authorizedPersonDesignation}}</p>\n    <p style="margin: 0; color: #64748b;">{{company.name}}</p>\n  </div>\n</div>	html	PUBLISHED	2026-09-25 14:52:59.091	00000000-0000-0000-0000-000000000000	Version 1.0 Initial Release	f	\N	\N	1	2026-09-25 14:52:59.092	2026-09-25 14:52:59.092	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000	\N	\N	\N	\N	\N	\N	\N
eb5ec6b0-53b2-4a3a-88c6-8f2708512821	TVER_000001	9222ece9-8c22-4cc6-b51e-8863c7110fb2	1	<h1 style="text-align: center;">APPOINTMENT LETTER</h1><p style="text-align: right;"><strong>Date:</strong> {{system.currentDate}}</p><p>Dear <strong>{{employee.fullName}}</strong>,</p><p>We are pleased to appoint you as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department of <strong>{{company.name}}</strong>.</p><p>Employee ID: <code>{{employee.employeeId}}</code></p><p>Your date of joining is <strong>{{employee.joiningDate}}</strong>.</p><p>Your employment type is <strong>{{employee.employmentType}}</strong>.</p><p>Your salary is <strong>{{employee.salary}}</strong>.</p><table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" style="text-align: left;"><p>Term</p></th><th colspan="1" rowspan="1" style="text-align: left;"><p>Details</p></th></tr><tr><td colspan="1" rowspan="1"><p><strong>Position</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.designation}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Department</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.department}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Annual CTC</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.salary}}</p></td></tr></tbody></table><p>Company Address: <em>{{company.address}}</em></p><p><br><br>      </p><p>Regards,</p><p><strong>{{company.authorizedPerson}}</strong><br>{{company.authorizedPersonDesignation}}<br>{{company.name}}{{company.authorizedPersonDesignation}}</p>	html	PUBLISHED	2026-09-25 15:09:36.674	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Updated via Browser Editor	f	\N	\N	1	2026-09-25 15:09:32.052	2026-09-25 15:09:32.052	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	\N	\N	\N	\N	\N	\N
bb0afb64-cfa2-4086-b7f0-67b1c2466edc	TVER_000002	9ee998e0-3da8-421c-aa33-ce1f62b3c02e	1	<h1 style="text-align: center;">APPOINTMENT LETTER</h1><p style="text-align: right;"><strong>Date:</strong> {{system.currentDate}}</p><p>Dear <strong>{{employee.fullName}}</strong>,</p><p>We are pleased to appoint you as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department of <strong>{{company.name}}</strong>.</p><p>Employee ID: <code>{{employee.employeeId}}</code></p><p>Your date of joining is <strong>{{employee.joiningDate}}</strong>.</p><p>Your employment type is <strong>{{employee.employmentType}}</strong>.</p><p>Your salary is <strong>{{employee.salary}}</strong>.</p><table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" style="text-align: left;"><p>Term</p></th><th colspan="1" rowspan="1" style="text-align: left;"><p>Details</p></th></tr><tr><td colspan="1" rowspan="1"><p><strong>Position</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.designation}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Department</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.department}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Annual CTC</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.salary}}</p></td></tr></tbody></table><p>Company Address: <em>{{company.address}}</em></p><p><br></p><p>Regards,</p><p><strong>{{company.authorizedPerson}}</strong><br>{{company.authorizedPersonDesignation}}<br>{{company.name}}{{company.authorizedPersonDesignation}}</p>	html	PUBLISHED	2026-09-25 15:13:54.763	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Updated via Browser Editor	f	\N	\N	1	2026-09-25 15:13:50.151	2026-09-25 15:13:50.151	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	\N	\N	\N	\N	\N	\N
c694b925-358b-4b9f-83f5-dd51418e4cbd	TVER_000003	b40a29ad-abe8-4c85-ba78-d25a1fd97443	1	<h1 style="text-align: center;">APPOINTMENT LETTER</h1><p style="text-align: right;"><strong>Date:</strong> {{system.currentDate}}</p><p>Dear <strong>{{employee.fullName}}</strong>,</p><p>We are pleased to appoint you as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department of <strong>{{company.name}}</strong>.</p><p>Employee ID: <code>{{employee.employeeId}}</code></p><p>Your date of joining is <strong>{{employee.joiningDate}}</strong>.</p><p>Your employment type is <strong>{{employee.employmentType}}</strong>.</p><p>Your salary is <strong>{{employee.salary}}</strong>.</p><table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" style="text-align: left;"><p>Term</p></th><th colspan="1" rowspan="1" style="text-align: left;"><p>Details</p></th></tr><tr><td colspan="1" rowspan="1"><p><strong>Position</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.designation}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Department</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.department}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Annual CTC</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.salary}}</p></td></tr></tbody></table><p>Company Address: <em>{{company.address}}</em></p><p><br></p><p>Regards,</p><p><strong>{{company.authorizedPerson}}</strong><br>{{company.authorizedPersonDesignation}}<br>{{company.name}}{{company.authorizedPersonDesignation}}</p>	html	PUBLISHED	2026-09-25 15:17:06.322	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Updated via Browser Editor	f	\N	\N	1	2026-09-25 15:17:01.679	2026-09-25 15:17:01.679	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	\N	\N	\N	\N	\N	\N
414e7810-51b3-4110-8652-d0998c810958	TVER_000004	d616a7d1-2033-4469-a77b-d031cc839712	1	<h1 style="text-align: center;">APPOINTMENT LETTER</h1><p style="text-align: right;"><strong>Date:</strong> {{system.currentDate}}</p><p>Dear <strong>{{employee.fullName}}</strong>,</p><p>We are pleased to appoint you as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department of <strong>{{company.name}}</strong>.</p><p>Employee ID: <code>{{employee.employeeId}}</code></p><p>Your date of joining is <strong>{{employee.joiningDate}}</strong>.</p><p>Your employment type is <strong>{{employee.employmentType}}</strong>.</p><p>Your salary is <strong>{{employee.salary}}</strong>.</p><table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" style="text-align: left;"><p>Term</p></th><th colspan="1" rowspan="1" style="text-align: left;"><p>Details</p></th></tr><tr><td colspan="1" rowspan="1"><p><strong>Position</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.designation}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Department</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.department}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Annual CTC</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.salary}}</p></td></tr></tbody></table><p>Company Address: <em>{{company.address}}</em></p><p><br></p><p>Regards,</p><p><strong>{{company.authorizedPerson}}</strong><br>{{company.authorizedPersonDesignation}}<br>{{company.name}}{{company.authorizedPersonDesignation}}</p>	html	PUBLISHED	2026-09-25 15:26:01.872	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Updated via Browser Editor	f	\N	\N	1	2026-09-25 15:25:57.24	2026-09-25 15:25:57.24	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	\N	\N	\N	\N	\N	\N
fc3c7763-d14c-4dc3-9116-81cf5ff72227	TVER_000005	fd014076-5361-4fb2-942a-a2c884cbe1ed	1	<h1 style="text-align: center;">APPOINTMENT LETTER</h1><p style="text-align: right;"><strong>Date:</strong> {{system.currentDate}}</p><p>Dear <strong>{{employee.fullName}}</strong>,</p><p>We are pleased to appoint you as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department of <strong>{{company.name}}</strong>.</p><p>Employee ID: <code>{{employee.employeeId}}</code></p><p>Your date of joining is <strong>{{employee.joiningDate}}</strong>.</p><p>Your employment type is <strong>{{employee.employmentType}}</strong>.</p><p>Your salary is <strong>{{employee.salary}}</strong>.</p><table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" style="text-align: left;"><p>Term</p></th><th colspan="1" rowspan="1" style="text-align: left;"><p>Details</p></th></tr><tr><td colspan="1" rowspan="1"><p><strong>Position</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.designation}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Department</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.department}}</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Annual CTC</strong></p></td><td colspan="1" rowspan="1"><p>{{employee.salary}}</p></td></tr></tbody></table><p>Company Address: <em>{{company.address}}</em></p><p><br></p><p>Regards,</p><p><strong>{{company.authorizedPerson}}</strong><br>{{company.authorizedPersonDesignation}}<br>{{company.name}}{{company.authorizedPersonDesignation}}</p>	html	PUBLISHED	2026-09-25 15:27:37.833	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Updated via Browser Editor	f	\N	\N	1	2026-09-25 15:27:33.186	2026-09-25 15:27:33.186	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	\N	\N	\N	\N	\N	\N
50435d92-3d42-44b4-b564-8dcb1c5b3806	TVER_000006	fef5a84a-294c-4476-b5d8-add9cab64779	1	<p>Dear {{candidate.fullName}},</p><p></p><p>We are pleased to issue this Appointment Letter for your position at {{company.name}}. Please find your appointment details below:</p><p></p><p>Sincerely,</p><p>{{company.authorizedPerson}}</p><p>{{company.authorizedPersonDesignation}}</p>	html	PUBLISHED	2026-09-26 07:34:56.715	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Updated via Browser Editor	f	\N	\N	1	2026-09-26 07:34:37.899	2026-09-26 07:34:37.899	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	\N	\N	\N	\N	\N	\N
07a6cb96-a0eb-4c72-81d6-4f97f3b4599e	TVER_000011	086e3ea4-246c-420b-8509-bf7ac4170a82	1		docx	PUBLISHED	2026-09-26 10:25:31.476	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Version 1 created from user Downloads letterhead PDF	f	\N	\N	1	2026-09-26 10:25:14.308	2026-09-26 10:25:14.308	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	local://templates/2fadcb4e-adef-491b-bc85-811487845a69/086e3ea4-246c-420b-8509-bf7ac4170a82/28e396ab-f222-4778-be0d-451239c23d0c/original.docx	Smatal_Computer_Academy_Appointment_Letterhead.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	198200	d085d3b46b6d634499c30bfbbad3aa1dd185df5a6b18797da1dd89eb4277d122	12	MAPPED
170a7fe5-5722-4418-a6bc-2a203385ee92	TVER_000008	6b2e675a-95ae-4e97-b3f1-fc657e14b0ef	2		docx	DEPRECATED	2026-09-26 08:24:15.93	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	f	\N	\N	1	2026-09-26 08:20:31.526	2026-09-26 08:20:31.526	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	local://templates/2fadcb4e-adef-491b-bc85-811487845a69/6b2e675a-95ae-4e97-b3f1-fc657e14b0ef/aee3aa8e-005b-43a6-b8db-5d44621dcb9f/original.docx	Acme_Letterhead_Appointment_Letter.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	11125	b9d5acb104fa7d147bd4e53ae995802d612166a245559eae799a761fc868accd	9	MAPPED
d45dcafc-d995-408e-a200-9f2725547b3a	TVER_000009	6b2e675a-95ae-4e97-b3f1-fc657e14b0ef	3	<p>{{candidate.fullName}}</p>	html	PUBLISHED	2026-09-26 08:55:59.915	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	Updated via Browser Editor	f	\N	\N	1	2026-09-26 08:55:21.573	2026-09-26 08:55:21.573	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	\N	\N	\N	\N	\N	\N
04dc39da-6b96-45f5-b279-013b7db83f3f	TVER_000007	6b2e675a-95ae-4e97-b3f1-fc657e14b0ef	1		docx	DRAFT	\N	\N	\N	f	\N	\N	1	2026-09-26 08:18:59.956	2026-09-26 08:18:59.956	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	local://templates/2fadcb4e-adef-491b-bc85-811487845a69/6b2e675a-95ae-4e97-b3f1-fc657e14b0ef/c819b5d1-df2e-4f86-acf7-88deaefc098f/original.docx	Acme_Letterhead_Appointment_Letter.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	11120	ca9e2172ea042544af918b06bb233cabf17749ae825fed813e200a19738c3ee4	0	MAPPED
1a0add89-3dd6-4e0b-b6db-d8e91bf0ee9f	TVER_000010	5ec70ad5-0235-43fc-bf1e-815bf57d63a0	1		docx	PUBLISHED	2026-09-26 09:38:22.163	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	\N	f	\N	\N	1	2026-09-26 09:34:37.281	2026-09-26 09:34:37.281	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	local://templates/2fadcb4e-adef-491b-bc85-811487845a69/5ec70ad5-0235-43fc-bf1e-815bf57d63a0/8310a945-3c42-44bb-9f61-7c178d242eee/original.docx	SMATAL_Custom_Appointment_Letterhead.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	45293	fb52652e9bbe3de89f3d31f5c7e566b8a0f7faf311b7e463aca578dbcd9ac3ad	13	MAPPED
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.templates (id, "businessId", "companyId", "documentTypeId", name, description, status, "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
fd014076-5361-4fb2-942a-a2c884cbe1ed	TPL_000005	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Custom Appointment Letter Test	Official appointment letter with live placeholder resolution and formatted clauses.	PUBLISHED	f	\N	\N	1	2026-09-25 15:27:23.226	2026-09-25 15:27:23.226	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
fef5a84a-294c-4476-b5d8-add9cab64779	TPL_000006	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Live Custom Appointment Letter Test	E2E test template	PUBLISHED	f	\N	\N	1	2026-09-26 07:32:06.757	2026-09-26 07:32:06.757	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
38f244e2-f2b4-472f-9e9a-f7e92adfb4fc	TMP-001	2fadcb4e-adef-491b-bc85-811487845a69	e635eac0-0f24-4469-857c-3430eebf069f	Senior Full Stack Engineer Offer Letter	Standard employment offer letter for engineering hires.	PUBLISHED	f	\N	\N	1	2026-09-25 14:52:59.088	2026-09-25 14:52:59.088	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
9222ece9-8c22-4cc6-b51e-8863c7110fb2	TPL_000001	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Custom Appointment Letter Test	Official appointment letter with live placeholder resolution and formatted clauses.	PUBLISHED	f	\N	\N	1	2026-09-25 15:09:22.513	2026-09-25 15:09:22.513	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
6b2e675a-95ae-4e97-b3f1-fc657e14b0ef	TPL_000007	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Imported Letterhead Appointment Letter	Letterhead import test template	PUBLISHED	f	\N	\N	1	2026-09-26 08:07:23.952	2026-09-26 08:07:23.952	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
9ee998e0-3da8-421c-aa33-ce1f62b3c02e	TPL_000002	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Custom Appointment Letter Test	Official appointment letter with live placeholder resolution and formatted clauses.	PUBLISHED	f	\N	\N	1	2026-09-25 15:13:40.624	2026-09-25 15:13:40.624	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
b40a29ad-abe8-4c85-ba78-d25a1fd97443	TPL_000003	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Custom Appointment Letter Test	Official appointment letter with live placeholder resolution and formatted clauses.	PUBLISHED	f	\N	\N	1	2026-09-25 15:16:51.68	2026-09-25 15:16:51.68	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
d616a7d1-2033-4469-a77b-d031cc839712	TPL_000004	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Custom Appointment Letter Test	Official appointment letter with live placeholder resolution and formatted clauses.	PUBLISHED	f	\N	\N	1	2026-09-25 15:25:47.281	2026-09-25 15:25:47.281	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
5ec70ad5-0235-43fc-bf1e-815bf57d63a0	TPL_000008	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	SMATAL Appointment Letterhead	Professional SMATAL Technologies appointment letter with embedded logo	PUBLISHED	f	\N	\N	1	2026-09-26 09:33:09.99	2026-09-26 09:33:09.99	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
086e3ea4-246c-420b-8509-bf7ac4170a82	TPL_000009	2fadcb4e-adef-491b-bc85-811487845a69	0fb2f288-f840-4275-8d7d-207b77026624	Smatal Computer Academy Appointment Letter	Appointment Letter using official Smatal Computer Academy letterhead from Downloads	PUBLISHED	f	\N	\N	1	2026-09-26 10:23:35.82	2026-09-26 10:23:35.82	dd663d28-ea68-44dd-80c9-1b3b5fad62f9	dd663d28-ea68-44dd-80c9-1b3b5fad62f9
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.user_roles ("identityUserId", "roleId", "assignedAt", "assignedBy", "expiresAt") FROM stdin;
dd663d28-ea68-44dd-80c9-1b3b5fad62f9	f0a85ce7-802f-4133-8324-a11d85f0aaea	2026-07-22 07:21:58.545	00000000-0000-0000-0000-000000000000	\N
\.


--
-- Data for Name: workflow_definitions; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.workflow_definitions (id, "businessId", "companyId", name, description, "entityType", status, "isDeleted", "deletedAt", "deletedBy", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: workflow_history; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.workflow_history (id, "workflowInstanceId", "stageId", action, notes, "performedBy", "performedAt", metadata) FROM stdin;
\.


--
-- Data for Name: workflow_instances; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.workflow_instances (id, "businessId", "workflowDefinitionId", "companyId", "entityType", "entityId", "candidateId", "employeeId", "currentStageId", status, "startedAt", "completedAt", "isDeleted", "deletedAt", version, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: workflow_stages; Type: TABLE DATA; Schema: public; Owner: abdul-razack-a
--

COPY public.workflow_stages (id, "workflowDefinitionId", name, code, description, "displayOrder", "isTerminal", "isFinal", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: business_id_counters business_id_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.business_id_counters
    ADD CONSTRAINT business_id_counters_pkey PRIMARY KEY (prefix);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: document_snapshots document_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.document_snapshots
    ADD CONSTRAINT document_snapshots_pkey PRIMARY KEY (id);


--
-- Name: document_types document_types_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT document_types_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employment_history employment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT employment_history_pkey PRIMARY KEY (id);


--
-- Name: exit_clearances exit_clearances_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.exit_clearances
    ADD CONSTRAINT exit_clearances_pkey PRIMARY KEY (id);


--
-- Name: field_definitions field_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_definitions
    ADD CONSTRAINT field_definitions_pkey PRIMARY KEY (id);


--
-- Name: field_groups field_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_groups
    ADD CONSTRAINT field_groups_pkey PRIMARY KEY (id);


--
-- Name: field_options field_options_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_options
    ADD CONSTRAINT field_options_pkey PRIMARY KEY (id);


--
-- Name: field_validations field_validations_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_validations
    ADD CONSTRAINT field_validations_pkey PRIMARY KEY (id);


--
-- Name: field_values field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_values
    ADD CONSTRAINT field_values_pkey PRIMARY KEY (id);


--
-- Name: generated_documents generated_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: identity_users identity_users_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.identity_users
    ADD CONSTRAINT identity_users_pkey PRIMARY KEY (id);


--
-- Name: leave_accruals leave_accruals_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_accruals
    ADD CONSTRAINT leave_accruals_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_carry_forwards leave_carry_forwards_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_carry_forwards
    ADD CONSTRAINT leave_carry_forwards_pkey PRIMARY KEY (id);


--
-- Name: leave_history leave_history_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_history
    ADD CONSTRAINT leave_history_pkey PRIMARY KEY (id);


--
-- Name: leave_policies leave_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_policies
    ADD CONSTRAINT leave_policies_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: resignations resignations_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.resignations
    ADD CONSTRAINT resignations_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: template_placeholders template_placeholders_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.template_placeholders
    ADD CONSTRAINT template_placeholders_pkey PRIMARY KEY (id);


--
-- Name: template_versions template_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.template_versions
    ADD CONSTRAINT template_versions_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY ("identityUserId", "roleId");


--
-- Name: workflow_definitions workflow_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_pkey PRIMARY KEY (id);


--
-- Name: workflow_history workflow_history_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_history
    ADD CONSTRAINT workflow_history_pkey PRIMARY KEY (id);


--
-- Name: workflow_instances workflow_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_pkey PRIMARY KEY (id);


--
-- Name: workflow_stages workflow_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT workflow_stages_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "audit_logs_businessId_key" ON public.audit_logs USING btree ("businessId");


--
-- Name: audit_logs_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "audit_logs_companyId_idx" ON public.audit_logs USING btree ("companyId");


--
-- Name: audit_logs_correlationId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "audit_logs_correlationId_idx" ON public.audit_logs USING btree ("correlationId");


--
-- Name: audit_logs_entityType_entityBusinessId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "audit_logs_entityType_entityBusinessId_idx" ON public.audit_logs USING btree ("entityType", "entityBusinessId");


--
-- Name: audit_logs_performedAt_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "audit_logs_performedAt_idx" ON public.audit_logs USING btree ("performedAt");


--
-- Name: audit_logs_performedBy_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "audit_logs_performedBy_idx" ON public.audit_logs USING btree ("performedBy");


--
-- Name: branches_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "branches_businessId_key" ON public.branches USING btree ("businessId");


--
-- Name: branches_companyId_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "branches_companyId_code_key" ON public.branches USING btree ("companyId", code);


--
-- Name: branches_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "branches_companyId_idx" ON public.branches USING btree ("companyId");


--
-- Name: branches_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "branches_isDeleted_idx" ON public.branches USING btree ("isDeleted");


--
-- Name: candidates_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "candidates_businessId_key" ON public.candidates USING btree ("businessId");


--
-- Name: candidates_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "candidates_companyId_idx" ON public.candidates USING btree ("companyId");


--
-- Name: candidates_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "candidates_isDeleted_idx" ON public.candidates USING btree ("isDeleted");


--
-- Name: candidates_profileId_companyId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "candidates_profileId_companyId_key" ON public.candidates USING btree ("profileId", "companyId");


--
-- Name: candidates_profileId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "candidates_profileId_idx" ON public.candidates USING btree ("profileId");


--
-- Name: candidates_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX candidates_status_idx ON public.candidates USING btree (status);


--
-- Name: companies_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "companies_businessId_key" ON public.companies USING btree ("businessId");


--
-- Name: companies_code_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX companies_code_idx ON public.companies USING btree (code);


--
-- Name: companies_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX companies_code_key ON public.companies USING btree (code);


--
-- Name: companies_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "companies_isDeleted_idx" ON public.companies USING btree ("isDeleted");


--
-- Name: departments_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "departments_businessId_key" ON public.departments USING btree ("businessId");


--
-- Name: departments_companyId_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "departments_companyId_code_key" ON public.departments USING btree ("companyId", code);


--
-- Name: departments_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "departments_companyId_idx" ON public.departments USING btree ("companyId");


--
-- Name: departments_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "departments_isDeleted_idx" ON public.departments USING btree ("isDeleted");


--
-- Name: departments_parentId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "departments_parentId_idx" ON public.departments USING btree ("parentId");


--
-- Name: designations_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "designations_businessId_key" ON public.designations USING btree ("businessId");


--
-- Name: designations_companyId_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "designations_companyId_code_key" ON public.designations USING btree ("companyId", code);


--
-- Name: designations_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "designations_companyId_idx" ON public.designations USING btree ("companyId");


--
-- Name: designations_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "designations_isDeleted_idx" ON public.designations USING btree ("isDeleted");


--
-- Name: document_snapshots_generatedDocumentId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "document_snapshots_generatedDocumentId_idx" ON public.document_snapshots USING btree ("generatedDocumentId");


--
-- Name: document_types_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "document_types_businessId_key" ON public.document_types USING btree ("businessId");


--
-- Name: document_types_companyId_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "document_types_companyId_code_key" ON public.document_types USING btree ("companyId", code);


--
-- Name: document_types_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "document_types_companyId_idx" ON public.document_types USING btree ("companyId");


--
-- Name: document_types_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "document_types_isDeleted_idx" ON public.document_types USING btree ("isDeleted");


--
-- Name: employees_branchId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employees_branchId_idx" ON public.employees USING btree ("branchId");


--
-- Name: employees_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "employees_businessId_key" ON public.employees USING btree ("businessId");


--
-- Name: employees_companyId_employeeNumber_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "employees_companyId_employeeNumber_key" ON public.employees USING btree ("companyId", "employeeNumber");


--
-- Name: employees_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employees_companyId_idx" ON public.employees USING btree ("companyId");


--
-- Name: employees_departmentId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employees_departmentId_idx" ON public.employees USING btree ("departmentId");


--
-- Name: employees_designationId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employees_designationId_idx" ON public.employees USING btree ("designationId");


--
-- Name: employees_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employees_isDeleted_idx" ON public.employees USING btree ("isDeleted");


--
-- Name: employees_profileId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employees_profileId_idx" ON public.employees USING btree ("profileId");


--
-- Name: employees_reportsToId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employees_reportsToId_idx" ON public.employees USING btree ("reportsToId");


--
-- Name: employees_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX employees_status_idx ON public.employees USING btree (status);


--
-- Name: employment_history_changeType_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employment_history_changeType_idx" ON public.employment_history USING btree ("changeType");


--
-- Name: employment_history_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employment_history_companyId_idx" ON public.employment_history USING btree ("companyId");


--
-- Name: employment_history_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "employment_history_employeeId_idx" ON public.employment_history USING btree ("employeeId");


--
-- Name: exit_clearances_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "exit_clearances_companyId_idx" ON public.exit_clearances USING btree ("companyId");


--
-- Name: exit_clearances_employeeId_department_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "exit_clearances_employeeId_department_key" ON public.exit_clearances USING btree ("employeeId", department);


--
-- Name: exit_clearances_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "exit_clearances_employeeId_idx" ON public.exit_clearances USING btree ("employeeId");


--
-- Name: exit_clearances_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX exit_clearances_status_idx ON public.exit_clearances USING btree (status);


--
-- Name: field_definitions_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "field_definitions_businessId_key" ON public.field_definitions USING btree ("businessId");


--
-- Name: field_definitions_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_definitions_companyId_idx" ON public.field_definitions USING btree ("companyId");


--
-- Name: field_definitions_entityType_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_definitions_entityType_idx" ON public.field_definitions USING btree ("entityType");


--
-- Name: field_definitions_groupId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_definitions_groupId_idx" ON public.field_definitions USING btree ("groupId");


--
-- Name: field_definitions_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_definitions_isDeleted_idx" ON public.field_definitions USING btree ("isDeleted");


--
-- Name: field_definitions_machineKey_companyId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "field_definitions_machineKey_companyId_key" ON public.field_definitions USING btree ("machineKey", "companyId");


--
-- Name: field_options_fieldDefinitionId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_options_fieldDefinitionId_idx" ON public.field_options USING btree ("fieldDefinitionId");


--
-- Name: field_validations_fieldDefinitionId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_validations_fieldDefinitionId_idx" ON public.field_validations USING btree ("fieldDefinitionId");


--
-- Name: field_values_candidateId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_values_candidateId_idx" ON public.field_values USING btree ("candidateId");


--
-- Name: field_values_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_values_employeeId_idx" ON public.field_values USING btree ("employeeId");


--
-- Name: field_values_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_values_entityType_entityId_idx" ON public.field_values USING btree ("entityType", "entityId");


--
-- Name: field_values_fieldDefinitionId_companyId_entityType_entityI_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "field_values_fieldDefinitionId_companyId_entityType_entityI_key" ON public.field_values USING btree ("fieldDefinitionId", "companyId", "entityType", "entityId");


--
-- Name: field_values_leavePolicyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_values_leavePolicyId_idx" ON public.field_values USING btree ("leavePolicyId");


--
-- Name: field_values_leaveRequestId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_values_leaveRequestId_idx" ON public.field_values USING btree ("leaveRequestId");


--
-- Name: field_values_profileId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "field_values_profileId_idx" ON public.field_values USING btree ("profileId");


--
-- Name: generated_documents_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "generated_documents_businessId_key" ON public.generated_documents USING btree ("businessId");


--
-- Name: generated_documents_companyId_createdAt_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_companyId_createdAt_idx" ON public.generated_documents USING btree ("companyId", "createdAt");


--
-- Name: generated_documents_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_companyId_idx" ON public.generated_documents USING btree ("companyId");


--
-- Name: generated_documents_documentTypeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_documentTypeId_idx" ON public.generated_documents USING btree ("documentTypeId");


--
-- Name: generated_documents_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_employeeId_idx" ON public.generated_documents USING btree ("employeeId");


--
-- Name: generated_documents_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_entityType_entityId_idx" ON public.generated_documents USING btree ("entityType", "entityId");


--
-- Name: generated_documents_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_isDeleted_idx" ON public.generated_documents USING btree ("isDeleted");


--
-- Name: generated_documents_profileId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_profileId_idx" ON public.generated_documents USING btree ("profileId");


--
-- Name: generated_documents_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX generated_documents_status_idx ON public.generated_documents USING btree (status);


--
-- Name: generated_documents_templateVersionId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_templateVersionId_idx" ON public.generated_documents USING btree ("templateVersionId");


--
-- Name: generated_documents_workflowInstanceId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "generated_documents_workflowInstanceId_idx" ON public.generated_documents USING btree ("workflowInstanceId");


--
-- Name: holidays_branchId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "holidays_branchId_idx" ON public.holidays USING btree ("branchId");


--
-- Name: holidays_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "holidays_businessId_key" ON public.holidays USING btree ("businessId");


--
-- Name: holidays_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "holidays_companyId_idx" ON public.holidays USING btree ("companyId");


--
-- Name: holidays_date_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX holidays_date_idx ON public.holidays USING btree (date);


--
-- Name: holidays_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "holidays_isDeleted_idx" ON public.holidays USING btree ("isDeleted");


--
-- Name: identity_users_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "identity_users_businessId_key" ON public.identity_users USING btree ("businessId");


--
-- Name: identity_users_companyId_email_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "identity_users_companyId_email_key" ON public.identity_users USING btree ("companyId", email);


--
-- Name: identity_users_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "identity_users_companyId_idx" ON public.identity_users USING btree ("companyId");


--
-- Name: identity_users_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "identity_users_isDeleted_idx" ON public.identity_users USING btree ("isDeleted");


--
-- Name: identity_users_profileId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "identity_users_profileId_idx" ON public.identity_users USING btree ("profileId");


--
-- Name: leave_accruals_accrualDate_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_accruals_accrualDate_idx" ON public.leave_accruals USING btree ("accrualDate");


--
-- Name: leave_accruals_leaveBalanceId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_accruals_leaveBalanceId_idx" ON public.leave_accruals USING btree ("leaveBalanceId");


--
-- Name: leave_balances_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "leave_balances_businessId_key" ON public.leave_balances USING btree ("businessId");


--
-- Name: leave_balances_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_balances_companyId_idx" ON public.leave_balances USING btree ("companyId");


--
-- Name: leave_balances_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_balances_employeeId_idx" ON public.leave_balances USING btree ("employeeId");


--
-- Name: leave_balances_employeeId_leaveTypeId_year_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "leave_balances_employeeId_leaveTypeId_year_key" ON public.leave_balances USING btree ("employeeId", "leaveTypeId", year);


--
-- Name: leave_balances_leaveTypeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_balances_leaveTypeId_idx" ON public.leave_balances USING btree ("leaveTypeId");


--
-- Name: leave_carry_forwards_leaveBalanceId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_carry_forwards_leaveBalanceId_idx" ON public.leave_carry_forwards USING btree ("leaveBalanceId");


--
-- Name: leave_history_leaveRequestId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_history_leaveRequestId_idx" ON public.leave_history USING btree ("leaveRequestId");


--
-- Name: leave_policies_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "leave_policies_businessId_key" ON public.leave_policies USING btree ("businessId");


--
-- Name: leave_policies_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_policies_companyId_idx" ON public.leave_policies USING btree ("companyId");


--
-- Name: leave_policies_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_policies_isDeleted_idx" ON public.leave_policies USING btree ("isDeleted");


--
-- Name: leave_policies_leaveTypeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_policies_leaveTypeId_idx" ON public.leave_policies USING btree ("leaveTypeId");


--
-- Name: leave_requests_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "leave_requests_businessId_key" ON public.leave_requests USING btree ("businessId");


--
-- Name: leave_requests_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_requests_companyId_idx" ON public.leave_requests USING btree ("companyId");


--
-- Name: leave_requests_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_requests_employeeId_idx" ON public.leave_requests USING btree ("employeeId");


--
-- Name: leave_requests_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_requests_isDeleted_idx" ON public.leave_requests USING btree ("isDeleted");


--
-- Name: leave_requests_leaveTypeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_requests_leaveTypeId_idx" ON public.leave_requests USING btree ("leaveTypeId");


--
-- Name: leave_requests_startDate_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_requests_startDate_idx" ON public.leave_requests USING btree ("startDate");


--
-- Name: leave_requests_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX leave_requests_status_idx ON public.leave_requests USING btree (status);


--
-- Name: leave_types_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "leave_types_businessId_key" ON public.leave_types USING btree ("businessId");


--
-- Name: leave_types_companyId_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "leave_types_companyId_code_key" ON public.leave_types USING btree ("companyId", code);


--
-- Name: leave_types_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_types_companyId_idx" ON public.leave_types USING btree ("companyId");


--
-- Name: leave_types_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "leave_types_isDeleted_idx" ON public.leave_types USING btree ("isDeleted");


--
-- Name: notifications_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "notifications_businessId_key" ON public.notifications USING btree ("businessId");


--
-- Name: notifications_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "notifications_companyId_idx" ON public.notifications USING btree ("companyId");


--
-- Name: notifications_recipient_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX notifications_recipient_idx ON public.notifications USING btree (recipient);


--
-- Name: permissions_resource_action_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX permissions_resource_action_key ON public.permissions USING btree (resource, action);


--
-- Name: profiles_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "profiles_isDeleted_idx" ON public.profiles USING btree ("isDeleted");


--
-- Name: profiles_personalEmail_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "profiles_personalEmail_idx" ON public.profiles USING btree ("personalEmail");


--
-- Name: profiles_personalEmail_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "profiles_personalEmail_key" ON public.profiles USING btree ("personalEmail");


--
-- Name: resignations_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "resignations_companyId_idx" ON public.resignations USING btree ("companyId");


--
-- Name: resignations_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "resignations_employeeId_idx" ON public.resignations USING btree ("employeeId");


--
-- Name: resignations_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX resignations_status_idx ON public.resignations USING btree (status);


--
-- Name: roles_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "roles_businessId_key" ON public.roles USING btree ("businessId");


--
-- Name: roles_companyId_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "roles_companyId_code_key" ON public.roles USING btree ("companyId", code);


--
-- Name: roles_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "roles_companyId_idx" ON public.roles USING btree ("companyId");


--
-- Name: roles_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "roles_isDeleted_idx" ON public.roles USING btree ("isDeleted");


--
-- Name: template_placeholders_fieldDefinitionId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "template_placeholders_fieldDefinitionId_idx" ON public.template_placeholders USING btree ("fieldDefinitionId");


--
-- Name: template_placeholders_templateVersionId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "template_placeholders_templateVersionId_idx" ON public.template_placeholders USING btree ("templateVersionId");


--
-- Name: template_placeholders_templateVersionId_placeholderKey_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "template_placeholders_templateVersionId_placeholderKey_key" ON public.template_placeholders USING btree ("templateVersionId", "placeholderKey");


--
-- Name: template_versions_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "template_versions_businessId_key" ON public.template_versions USING btree ("businessId");


--
-- Name: template_versions_importStatus_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "template_versions_importStatus_idx" ON public.template_versions USING btree ("importStatus");


--
-- Name: template_versions_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "template_versions_isDeleted_idx" ON public.template_versions USING btree ("isDeleted");


--
-- Name: template_versions_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX template_versions_status_idx ON public.template_versions USING btree (status);


--
-- Name: template_versions_templateId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "template_versions_templateId_idx" ON public.template_versions USING btree ("templateId");


--
-- Name: template_versions_templateId_versionNumber_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "template_versions_templateId_versionNumber_key" ON public.template_versions USING btree ("templateId", "versionNumber");


--
-- Name: templates_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "templates_businessId_key" ON public.templates USING btree ("businessId");


--
-- Name: templates_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "templates_companyId_idx" ON public.templates USING btree ("companyId");


--
-- Name: templates_documentTypeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "templates_documentTypeId_idx" ON public.templates USING btree ("documentTypeId");


--
-- Name: templates_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "templates_isDeleted_idx" ON public.templates USING btree ("isDeleted");


--
-- Name: workflow_definitions_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "workflow_definitions_businessId_key" ON public.workflow_definitions USING btree ("businessId");


--
-- Name: workflow_definitions_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_definitions_companyId_idx" ON public.workflow_definitions USING btree ("companyId");


--
-- Name: workflow_definitions_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_definitions_isDeleted_idx" ON public.workflow_definitions USING btree ("isDeleted");


--
-- Name: workflow_history_stageId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_history_stageId_idx" ON public.workflow_history USING btree ("stageId");


--
-- Name: workflow_history_workflowInstanceId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_history_workflowInstanceId_idx" ON public.workflow_history USING btree ("workflowInstanceId");


--
-- Name: workflow_instances_businessId_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "workflow_instances_businessId_key" ON public.workflow_instances USING btree ("businessId");


--
-- Name: workflow_instances_candidateId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_instances_candidateId_idx" ON public.workflow_instances USING btree ("candidateId");


--
-- Name: workflow_instances_companyId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_instances_companyId_idx" ON public.workflow_instances USING btree ("companyId");


--
-- Name: workflow_instances_currentStageId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_instances_currentStageId_idx" ON public.workflow_instances USING btree ("currentStageId");


--
-- Name: workflow_instances_employeeId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_instances_employeeId_idx" ON public.workflow_instances USING btree ("employeeId");


--
-- Name: workflow_instances_isDeleted_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_instances_isDeleted_idx" ON public.workflow_instances USING btree ("isDeleted");


--
-- Name: workflow_instances_status_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX workflow_instances_status_idx ON public.workflow_instances USING btree (status);


--
-- Name: workflow_instances_workflowDefinitionId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_instances_workflowDefinitionId_idx" ON public.workflow_instances USING btree ("workflowDefinitionId");


--
-- Name: workflow_stages_workflowDefinitionId_code_key; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE UNIQUE INDEX "workflow_stages_workflowDefinitionId_code_key" ON public.workflow_stages USING btree ("workflowDefinitionId", code);


--
-- Name: workflow_stages_workflowDefinitionId_idx; Type: INDEX; Schema: public; Owner: abdul-razack-a
--

CREATE INDEX "workflow_stages_workflowDefinitionId_idx" ON public.workflow_stages USING btree ("workflowDefinitionId");


--
-- Name: audit_logs audit_logs_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: branches branches_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: candidates candidates_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT "candidates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: candidates candidates_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT "candidates_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: departments departments_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: departments departments_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: designations designations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT "designations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_snapshots document_snapshots_generatedDocumentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.document_snapshots
    ADD CONSTRAINT "document_snapshots_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES public.generated_documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_types document_types_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT "document_types_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_designationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES public.designations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_reportsToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employment_history employment_history_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT "employment_history_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employment_history employment_history_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT "employment_history_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exit_clearances exit_clearances_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.exit_clearances
    ADD CONSTRAINT "exit_clearances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: exit_clearances exit_clearances_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.exit_clearances
    ADD CONSTRAINT "exit_clearances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: field_definitions field_definitions_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_definitions
    ADD CONSTRAINT "field_definitions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_definitions field_definitions_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_definitions
    ADD CONSTRAINT "field_definitions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.field_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_options field_options_fieldDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_options
    ADD CONSTRAINT "field_options_fieldDefinitionId_fkey" FOREIGN KEY ("fieldDefinitionId") REFERENCES public.field_definitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: field_validations field_validations_fieldDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_validations
    ADD CONSTRAINT "field_validations_fieldDefinitionId_fkey" FOREIGN KEY ("fieldDefinitionId") REFERENCES public.field_definitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: field_values field_values_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_values
    ADD CONSTRAINT "field_values_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_values field_values_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_values
    ADD CONSTRAINT "field_values_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_values field_values_fieldDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_values
    ADD CONSTRAINT "field_values_fieldDefinitionId_fkey" FOREIGN KEY ("fieldDefinitionId") REFERENCES public.field_definitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: field_values field_values_leavePolicyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_values
    ADD CONSTRAINT "field_values_leavePolicyId_fkey" FOREIGN KEY ("leavePolicyId") REFERENCES public.leave_policies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_values field_values_leaveRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_values
    ADD CONSTRAINT "field_values_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES public.leave_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_values field_values_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.field_values
    ADD CONSTRAINT "field_values_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: generated_documents generated_documents_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: generated_documents generated_documents_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: generated_documents generated_documents_documentTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES public.document_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: generated_documents generated_documents_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: generated_documents generated_documents_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: generated_documents generated_documents_templateVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES public.template_versions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: generated_documents generated_documents_workflowInstanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES public.workflow_instances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: generated_documents generated_documents_workflowStageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT "generated_documents_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES public.workflow_stages(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: holidays holidays_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT "holidays_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: holidays holidays_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT "holidays_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: identity_users identity_users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.identity_users
    ADD CONSTRAINT "identity_users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: identity_users identity_users_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.identity_users
    ADD CONSTRAINT "identity_users_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_accruals leave_accruals_leaveBalanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_accruals
    ADD CONSTRAINT "leave_accruals_leaveBalanceId_fkey" FOREIGN KEY ("leaveBalanceId") REFERENCES public.leave_balances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT "leave_balances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_balances leave_balances_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_leaveTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT "leave_balances_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_carry_forwards leave_carry_forwards_leaveBalanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_carry_forwards
    ADD CONSTRAINT "leave_carry_forwards_leaveBalanceId_fkey" FOREIGN KEY ("leaveBalanceId") REFERENCES public.leave_balances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_history leave_history_leaveRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_history
    ADD CONSTRAINT "leave_history_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES public.leave_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_policies leave_policies_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_policies
    ADD CONSTRAINT "leave_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_policies leave_policies_leaveTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_policies
    ADD CONSTRAINT "leave_policies_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "leave_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_leaveTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "leave_requests_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_workflowInstanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "leave_requests_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES public.workflow_instances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_types leave_types_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT "leave_types_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: resignations resignations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.resignations
    ADD CONSTRAINT "resignations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: resignations resignations_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.resignations
    ADD CONSTRAINT "resignations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: template_placeholders template_placeholders_fieldDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.template_placeholders
    ADD CONSTRAINT "template_placeholders_fieldDefinitionId_fkey" FOREIGN KEY ("fieldDefinitionId") REFERENCES public.field_definitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: template_placeholders template_placeholders_templateVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.template_placeholders
    ADD CONSTRAINT "template_placeholders_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES public.template_versions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: template_versions template_versions_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.template_versions
    ADD CONSTRAINT "template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: templates templates_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT "templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: templates templates_documentTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT "templates_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES public.document_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_identityUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_identityUserId_fkey" FOREIGN KEY ("identityUserId") REFERENCES public.identity_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflow_definitions workflow_definitions_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT "workflow_definitions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_history workflow_history_stageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_history
    ADD CONSTRAINT "workflow_history_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES public.workflow_stages(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_history workflow_history_workflowInstanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_history
    ADD CONSTRAINT "workflow_history_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES public.workflow_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflow_instances workflow_instances_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT "workflow_instances_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workflow_instances workflow_instances_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT "workflow_instances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workflow_instances workflow_instances_workflowDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT "workflow_instances_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES public.workflow_definitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_stages workflow_stages_workflowDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abdul-razack-a
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT "workflow_stages_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES public.workflow_definitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: abdul-razack-a
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 10qatA9kUFjJwy0ib8gFVW0jMpQ3JAU4vBPaKV4owBAwJkil5TebL80GUO4EwhJ

