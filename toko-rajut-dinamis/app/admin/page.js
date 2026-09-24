'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';

export default function AdminPage() {
  const { adminSession } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (adminSession) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  }, [adminSession, router]);

  return null;
}