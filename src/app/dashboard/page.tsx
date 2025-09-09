import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth'

export default async function DashboardPage() {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/login')
  }
  
  // Redirect to role-specific dashboard
  switch (profile.role) {
    case 'admin':
      redirect('/dashboard/admin')
    case 'doctor':
      redirect('/dashboard/doctor')
    case 'patient':
      redirect('/dashboard/patient')
    default:
      redirect('/login')
  }
}
