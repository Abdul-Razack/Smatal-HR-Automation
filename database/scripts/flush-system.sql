-- Smatal HR System: Clean Slate / Production Flush Script
-- Flushes all dynamic transactional and master data while preserving core auth, roles, permissions, and tenant

BEGIN;

-- 1. Document Snapshots & Generated Documents
DELETE FROM document_snapshots;
DELETE FROM generated_documents;

-- 2. Template Placeholders, Versions & Templates
DELETE FROM template_placeholders;
DELETE FROM template_versions;
DELETE FROM templates;

-- 3. Workflow Instances, Stages & History
DELETE FROM workflow_history;
DELETE FROM workflow_stages;
DELETE FROM workflow_instances;

-- 4. Leave & Resignation Records
DELETE FROM leave_history;
DELETE FROM leave_accruals;
DELETE FROM leave_requests;
DELETE FROM leave_balances;
DELETE FROM exit_clearances;
DELETE FROM resignations;

-- 5. Field Values & Candidates
DELETE FROM field_values;
DELETE FROM candidates;

-- 6. Employment History & Employees
DELETE FROM employment_history;
DELETE FROM employees;

-- 7. Organization Structure (Departments, Designations, Branches)
DELETE FROM departments;
DELETE FROM designations;
DELETE FROM branches;

-- 8. Notifications & Audit Logs
DELETE FROM notifications;
DELETE FROM audit_logs;

-- 9. Profiles (delete non-admin employee profiles)
DELETE FROM profiles WHERE id NOT IN (SELECT "profileId" FROM identity_users);

-- 10. Business ID Counters (reset so fresh entity IDs start at 1)
DELETE FROM business_id_counters;

COMMIT;
