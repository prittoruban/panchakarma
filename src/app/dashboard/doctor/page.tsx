import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import SessionCard from '@/components/SessionCard'
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react'

export default async function DoctorDashboard() {
  const profile = await requireRole(['doctor'])
  const supabase = await createClient()
  
  // Fetch today's sessions
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  
  const { data: todaySessions } = await supabase
    .from('therapy_sessions')
    .select(`
      *,
      therapy:therapies(*),
      patient:profiles!therapy_sessions_patient_id_fkey(full_name, phone)
    `)
    .eq('doctor_id', profile.id)
    .gte('scheduled_start', startOfDay.toISOString())
    .lt('scheduled_start', endOfDay.toISOString())
    .order('scheduled_start', { ascending: true })
  
  // Fetch upcoming sessions (next 7 days)
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const { data: upcomingSessions } = await supabase
    .from('therapy_sessions')
    .select(`
      *,
      therapy:therapies(*),
      patient:profiles!therapy_sessions_patient_id_fkey(full_name, phone)
    `)
    .eq('doctor_id', profile.id)
    .gte('scheduled_start', endOfDay.toISOString())
    .lte('scheduled_start', nextWeek.toISOString())
    .order('scheduled_start', { ascending: true })
    .limit(10)
  
  // Fetch recent feedback
  const { data: recentFeedback } = await supabase
    .from('feedbacks')
    .select(`
      *,
      session:therapy_sessions(
        therapy:therapies(name),
        patient:profiles!therapy_sessions_patient_id_fkey(full_name)
      )
    `)
    .in('session_id', (await supabase
      .from('therapy_sessions')
      .select('id')
      .eq('doctor_id', profile.id)
    ).data?.map(s => s.id) || [])
    .order('created_at', { ascending: false })
    .limit(5)
  
  // Calculate stats
  const totalPatients = new Set(todaySessions?.map(s => s.patient_id) || []).size
  const completedToday = todaySessions?.filter(s => s.status === 'completed').length || 0
  const inProgressToday = todaySessions?.filter(s => s.status === 'in_progress').length || 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Good day, Dr. {profile.full_name || 'Doctor'}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s your schedule and patient updates for today.
        </p>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today&apos;s Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{todaySessions?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Patients Today</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressToday}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Sessions</h2>
          
          <div className="space-y-4">
            {todaySessions && todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userRole="doctor"
                  onUpdateStatus={async (sessionId, status) => {
                    // This would be handled by a client component or API route
                    console.log('Update session status:', sessionId, status)
                  }}
                  onViewDetails={(session) => {
                    console.log('View session details:', session)
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No sessions scheduled for today</p>
                <p className="text-sm">Enjoy your day off!</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
          
          <div className="space-y-4">
            {upcomingSessions && upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.therapy?.name || 'Therapy Session'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Patient: {session.patient?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.scheduled_start).toLocaleDateString()} at{' '}
                        {new Date(session.scheduled_start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {session.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No upcoming sessions</p>
                <p className="text-sm">Your schedule is clear for the next week</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Patient Feedback */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Patient Feedback</h2>
        
        <div className="space-y-4">
          {recentFeedback && recentFeedback.length > 0 ? (
            recentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {feedback.session?.patient?.full_name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feedback.session?.therapy?.name || 'Therapy Session'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < (feedback.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {feedback.rating}/5
                    </span>
                  </div>
                </div>
                
                {feedback.symptoms && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                    <p className="text-sm text-gray-600">{feedback.symptoms}</p>
                  </div>
                )}
                
                {feedback.improvement_notes && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Improvements:</p>
                    <p className="text-sm text-gray-600">{feedback.improvement_notes}</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-400">
                  {new Date(feedback.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No recent feedback</p>
              <p className="text-sm">Patient feedback will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
