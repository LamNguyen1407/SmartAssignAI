import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import React from 'react'

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Upload and manage your assignment files</p>
        </div>

        {/* <FileUploadCard />
        <FilesList /> */}
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage