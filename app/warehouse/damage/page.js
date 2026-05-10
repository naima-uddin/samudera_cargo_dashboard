import React from 'react'
import DamageReportsPage from '@/components/warehouse/damage'
import ToastProvider from '@/components/common/ToastProvider'
function page() {
  return (
    <div>
              <ToastProvider />
      
      <DamageReportsPage />
    </div>
  )
}

export default page