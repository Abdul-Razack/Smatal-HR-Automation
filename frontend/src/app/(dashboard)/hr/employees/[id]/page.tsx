import { EmployeeDetails } from '@/modules/employee/components/details/EmployeeDetails';

export default async function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeDetails employeeId={id} />;
}
