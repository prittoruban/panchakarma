'use client'

import { useState } from 'react'
import { Calendar, Clock, User, FileText } from 'lucide-react'

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

interface SessionCardProps {
  session: Session
  userRole: string
  onUpdateStatus?: (sessionId: number, status: string) => void
  onViewDetails?: (session: Session) => void
}

export default function SessionCard({ session, userRole, onUpdateStatus, onViewDetails }: SessionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (onUpdateStatus) {
      setIsUpdating(true)
      try {
        await onUpdateStatus(session.id, newStatus)
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const startDateTime = formatDateTime(session.scheduled_start)
  const endDateTime = formatDateTime(session.scheduled_end)

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {session.therapy?.name || 'Therapy Session'}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{startDateTime.date}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{startDateTime.time} - {endDateTime.time}</span>
            </div>
            
            {userRole === 'doctor' && session.patient?.full_name && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Patient: {session.patient.full_name}</span>
              </div>
            )}
            
            {userRole === 'patient' && session.doctor?.full_name && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Doctor: {session.doctor.full_name}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
            {session.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {session.therapy?.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">{session.therapy.description}</p>
        </div>
      )}

      {session.notes && (
        <div className="mb-4">
          <div className="flex items-start">
            <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Notes:</p>
              <p className="text-sm text-gray-600">{session.notes}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          {userRole === 'doctor' && session.status === 'scheduled' && (
            <button
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isUpdating}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Start Session
            </button>
          )}
          
          {userRole === 'doctor' && session.status === 'in_progress' && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
            >
              Complete Session
            </button>
          )}
        </div>
        
        <button
          onClick={() => onViewDetails?.(session)}
          className="px-3 py-1 text-blue-600 text-sm border border-blue-600 rounded hover:bg-blue-50"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
