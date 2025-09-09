'use client'

import { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

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

interface CalendarProps {
  events: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  view?: View
  selectable?: boolean
}

export default function Calendar({ 
  events, 
  onSelectEvent, 
  onSelectSlot, 
  view = Views.MONTH,
  selectable = false 
}: CalendarProps) {
  const [currentView, setCurrentView] = useState<View>(view)

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource?.status
    let backgroundColor = '#3174ad'

    switch (status) {
      case 'scheduled':
        backgroundColor = '#3b82f6' // blue
        break
      case 'in_progress':
        backgroundColor = '#f59e0b' // yellow
        break
      case 'completed':
        backgroundColor = '#10b981' // green
        break
      case 'cancelled':
        backgroundColor = '#ef4444' // red
        break
      default:
        backgroundColor = '#6b7280' // gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="h-96 md:h-[600px] bg-white rounded-lg shadow p-4">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable={selectable}
        view={currentView}
        onView={(view) => setCurrentView(view)}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        eventPropGetter={eventStyleGetter}
        step={30}
        showMultiDayTimes
        popup
        className="react-big-calendar-custom"
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => 
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          dayHeaderFormat: 'dddd MMM DD',
          monthHeaderFormat: 'MMMM YYYY'
        }}
      />
      
      <style jsx global>{`
        .react-big-calendar-custom {
          font-family: inherit;
        }
        
        .rbc-toolbar {
          margin-bottom: 1rem;
          padding: 0.5rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
        
        .rbc-btn-group button {
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          border: 1px solid #d1d5db;
          background-color: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .rbc-btn-group button:hover {
          background-color: #f3f4f6;
        }
        
        .rbc-btn-group button.rbc-active {
          background-color: #10b981;
          color: white;
          border-color: #10b981;
        }
        
        .rbc-toolbar-label {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .rbc-header {
          padding: 0.75rem 0.5rem;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
        }
        
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        
        .rbc-day-bg {
          background-color: white;
        }
        
        .rbc-today {
          background-color: #fef3c7;
        }
        
        .rbc-event {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          border-radius: 0.25rem;
        }
        
        .rbc-slot-selection {
          background-color: rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </div>
  )
}
