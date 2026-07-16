'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterRootPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/master/organization/departments');
  }, [router]);

  return null;
}
