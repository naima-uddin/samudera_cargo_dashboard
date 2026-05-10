import React from 'react'
import ReceivedShipments from "@/components/warehouse/inceptionPage"
import ToastProvider from '@/components/common/ToastProvider'
function page() {
  return (
    <div>
              <ToastProvider />
      
      <ReceivedShipments />
    </div>
  )
}

export default page
