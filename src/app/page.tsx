import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { SectionCards } from '@/components/section-cards'

import data from './dashboard/data.json'

export default async function Home() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <DashboardLayout>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </DashboardLayout>
  )
}
