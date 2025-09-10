'use client'

import { useState } from 'react'
import Calendar from './Calendar'

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource?: {
    status?: string
    [key: string]: unknown
  }
}

interface PatientCalendarWrapperProps {
  events: CalendarEvent[]
}

export default function PatientCalendarWrapper({ events }: PatientCalendarWrapperProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    // You can add more logic here for event selection
    console.log('Selected event:', event)
  }

  return (
    <div className="space-y-4">
      <Calendar 
        events={events}
        onSelectEvent={handleSelectEvent}
      />
      
      {selectedEvent && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900">Selected Session</h3>
          <p className="text-blue-800">{selectedEvent.title}</p>
          <p className="text-blue-600 text-sm">
            {new Date(selectedEvent.start).toLocaleString()} - {new Date(selectedEvent.end).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
