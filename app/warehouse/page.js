"use client"
import React, { useEffect, Suspense } from 'react'
import { getAuthToken } from '@/utils/SessionHelper';
import { useRouter } from 'next/navigation';
import Warehouse from '@/components/warehouse/warehouse';
import ToastProvider from '@/components/common/ToastProvider';

function WarehouseContent() {
  return <Warehouse />;
}

function page() {
    const router = useRouter();
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, []);
  return (

    <div>
              <ToastProvider />
      
      <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin text-[#E67E22]">Loading...</div></div>}>
        <WarehouseContent />
      </Suspense>
    </div>
  )
}

export default page
