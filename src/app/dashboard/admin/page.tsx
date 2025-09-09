import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { Users, Building, Calendar, Activity, TrendingUp, Star } from 'lucide-react'

export default async function AdminDashboard() {
  const profile = await requireRole(['admin'])
  const supabase = await createClient()
  
  // Fetch dashboard stats
  const [
    { count: totalUsers },
    { count: totalDoctors },
    { count: totalPatients },
    { count: totalCenters },
    { count: totalSessions },
    { count: completedSessions },
    { data: recentSessions },
    { data: recentFeedback }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('centers').select('*', { count: 'exact', head: true }),
    supabase.from('therapy_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('therapy_sessions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase
      .from('therapy_sessions')
      .select(`
        *,
        therapy:therapies(name),
        patient:profiles!therapy_sessions_patient_id_fkey(full_name),
        doctor:profiles!therapy_sessions_doctor_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('feedbacks')
      .select(`
        *,
        session:therapy_sessions(
          therapy:therapies(name),
          patient:profiles!therapy_sessions_patient_id_fkey(full_name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  // Calculate completion rate
  const completionRate = totalSessions && totalSessions > 0 
    ? Math.round((completedSessions || 0) / totalSessions * 100) 
    : 0

  // Calculate average rating
  const avgRating = recentFeedback?.length 
    ? recentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / recentFeedback.length
    : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {profile.full_name || 'Administrator'}. Here&apos;s your system overview.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{totalDoctors || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Centers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCenters || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{totalSessions || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
            <a
              href="/dashboard/admin/sessions"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </a>
          </div>
          
          <div className="space-y-4">
            {recentSessions && recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.therapy?.name || 'Therapy Session'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Patient: {session.patient?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Doctor: {session.doctor?.full_name || 'Unassigned'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.scheduled_start).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No recent sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
            <a
              href="/dashboard/admin/feedback"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </a>
          </div>
          
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
                    </div>
                  </div>
                  
                  {feedback.improvement_notes && (
                    <p className="text-sm text-gray-600 mb-2">
                      {feedback.improvement_notes.substring(0, 100)}
                      {feedback.improvement_notes.length > 100 ? '...' : ''}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No recent feedback</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/dashboard/admin/users"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">Manage Users</span>
          </a>
          
          <a
            href="/dashboard/admin/centers"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Building className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium text-gray-900">Manage Centers</span>
          </a>
          
          <a
            href="/dashboard/admin/therapies"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Activity className="h-6 w-6 text-purple-600 mr-2" />
            <span className="font-medium text-gray-900">Manage Therapies</span>
          </a>
          
          <a
            href="/dashboard/admin/analytics"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
            <span className="font-medium text-gray-900">View Analytics</span>
          </a>
        </div>
      </div>
    </div>
  )
}
