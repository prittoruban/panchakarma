'use client'

import SessionCard from './SessionCard'

interface Session {
  id: number
  scheduled_start: string
  scheduled_end: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string | null
  therapy?: {
    name: string
    description?: string | null
  }
  doctor?: {
    full_name: string | null
  }
  patient?: {
    full_name: string | null
  }
}

interface PatientSessionWrapperProps {
  sessions: Session[]
}

export default function PatientSessionWrapper({ sessions }: PatientSessionWrapperProps) {
  const handleViewDetails = (session: Session) => {
    // Handle view details
    console.log('View details for session:', session)
    // TODO: Add navigation to session details page or open modal
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="h-12 w-12 mx-auto mb-4 text-gray-300">
          {/* Calendar icon placeholder */}
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No upcoming sessions</p>
        <p className="text-sm">Book your first therapy session to get started</p>
        <a
          href="/therapy"
          className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Book Session
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          userRole="patient"
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  )
}
