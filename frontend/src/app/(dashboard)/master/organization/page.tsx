'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrganizationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/master/organization/departments');
  }, [router]);

  return null;
}
