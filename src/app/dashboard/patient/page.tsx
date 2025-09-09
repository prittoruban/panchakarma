import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Calendar from '@/components/Calendar'
import SessionCard from '@/components/SessionCard'
import { Bell, Calendar as CalendarIcon, Clock, Star } from 'lucide-react'

export default async function PatientDashboard() {
  const profile = await requireRole(['patient'])
  const supabase = await createClient()
  
  // Fetch upcoming sessions
  const { data: sessions } = await supabase
    .from('therapy_sessions')
    .select(`
      *,
      therapy:therapies(*),
      doctor:profiles!therapy_sessions_doctor_id_fkey(full_name)
    `)
    .eq('patient_id', profile.id)
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })
    .limit(5)
  
  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_read', false)
    .order('send_at', { ascending: false })
    .limit(3)
  
  // Format sessions for calendar
  const calendarEvents = sessions?.map(session => ({
    id: session.id,
    title: session.therapy?.name || 'Therapy Session',
    start: new Date(session.scheduled_start),
    end: new Date(session.scheduled_end),
    resource: {
      status: session.status,
      session
    }
  })) || []

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.full_name || 'Patient'}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s an overview of your upcoming therapy sessions and notifications.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Next Session</p>
              <p className="text-sm font-bold text-gray-900">
                {sessions && sessions.length > 0 
                  ? new Date(sessions[0].scheduled_start).toLocaleDateString()
                  : 'No sessions scheduled'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Calendar</h2>
        <Calendar
          events={calendarEvents}
          onSelectEvent={(event) => {
            // Handle event selection
            console.log('Selected event:', event)
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
            <a
              href="/therapy"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Book New Session →
            </a>
          </div>
          
          <div className="space-y-4">
            {sessions && sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userRole="patient"
                  onViewDetails={(session) => {
                    // Handle view details
                    console.log('View details for session:', session)
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No upcoming sessions</p>
                <p className="text-sm">Book your first therapy session to get started</p>
                <a
                  href="/therapy"
                  className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Book Session
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          
          <div className="space-y-4">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.send_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No new notifications</p>
                <p className="text-sm">You&apos;re all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/therapy"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <CalendarIcon className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium text-gray-900">Book New Session</span>
          </a>
          
          <a
            href="/dashboard/patient/sessions"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">View All Sessions</span>
          </a>
          
          <a
            href="/dashboard/patient/feedback"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <Star className="h-6 w-6 text-yellow-600 mr-2" />
            <span className="font-medium text-gray-900">Give Feedback</span>
          </a>
        </div>
      </div>
    </div>
  )
}
