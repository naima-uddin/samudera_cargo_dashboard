'use client';

import React, { Suspense } from 'react' 
import TrackingPage from '@/components/trackingPage'

function TrackingPageWrapper() {
  return <TrackingPage />
}

function page() {
  return (
    <div> 
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <TrackingPageWrapper />
        </Suspense>
    </div>
  )
}

export default page
