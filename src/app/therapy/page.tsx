'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Clock, User, AlertTriangle } from 'lucide-react'

interface Therapy {
  id: number
  name: string
  duration_days: number | null
  description: string | null
}

interface Doctor {
  id: string
  full_name: string | null
}

interface Session {
  id: number
  scheduled_start: string
  scheduled_end: string
  doctor_id: string
}

interface User {
  id: string
  email?: string
}

export default function TherapyBookingPage() {
  const [therapies, setTherapies] = useState<Therapy[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedTherapy, setSelectedTherapy] = useState<number | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState<number>(60)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  const router = useRouter()

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
  }, [router])

  useEffect(() => {
    fetchInitialData()
    checkUser()
  }, [checkUser])

  const fetchInitialData = async () => {
    try {
      // Fetch therapies
      const { data: therapiesData, error: therapiesError } = await supabase
        .from('therapies')
        .select('*')
        .order('name')

      if (therapiesError) throw therapiesError
      setTherapies(therapiesData || [])

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'doctor')
        .order('full_name')

      if (doctorsError) throw doctorsError
      setDoctors(doctorsData || [])

      // Fetch existing sessions for conflict checking
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('therapy_sessions')
        .select('id, scheduled_start, scheduled_end, doctor_id')
        .gte('scheduled_start', new Date().toISOString())

      if (sessionsError) throw sessionsError
      setSessions(sessionsData || [])

    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to load booking data')
    }
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  const isTimeSlotAvailable = (date: Date, time: string, doctorId: string): boolean => {
    const selectedDateTime = new Date(date)
    const [hours, minutes] = time.split(':').map(Number)
    selectedDateTime.setHours(hours, minutes, 0, 0)
    
    const endDateTime = new Date(selectedDateTime.getTime() + duration * 60000)
    
    return !sessions.some(session => {
      if (session.doctor_id !== doctorId) return false
      
      const sessionStart = new Date(session.scheduled_start)
      const sessionEnd = new Date(session.scheduled_end)
      
      return (
        (selectedDateTime >= sessionStart && selectedDateTime < sessionEnd) ||
        (endDateTime > sessionStart && endDateTime <= sessionEnd) ||
        (selectedDateTime <= sessionStart && endDateTime >= sessionEnd)
      )
    })
  }

  const getAvailableTimeSlots = (): string[] => {
    if (!selectedDate || !selectedDoctor) return []
    
    return timeSlots.filter(time => 
      isTimeSlotAvailable(selectedDate, time, selectedDoctor)
    )
  }

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !selectedTherapy || !selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const selectedDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':').map(Number)
      selectedDateTime.setHours(hours, minutes, 0, 0)
      
      const endDateTime = new Date(selectedDateTime.getTime() + duration * 60000)

      // Double-check availability
      if (!isTimeSlotAvailable(selectedDate, selectedTime, selectedDoctor)) {
        setError('This time slot is no longer available')
        return
      }

      // Create the session
      const { error } = await supabase
        .from('therapy_sessions')
        .insert({
          patient_id: currentUser.id,
          doctor_id: selectedDoctor,
          therapy_id: selectedTherapy,
          scheduled_start: selectedDateTime.toISOString(),
          scheduled_end: endDateTime.toISOString(),
          status: 'scheduled',
          notes: notes.trim() || null
        })
        .select()

      if (error) throw error

      // Create notification for the patient
      await supabase
        .from('notifications')
        .insert({
          user_id: currentUser.id,
          channel: 'inapp',
          title: 'Session Booked Successfully',
          message: `Your therapy session has been scheduled for ${selectedDateTime.toLocaleDateString()} at ${selectedTime}`,
        })

      // Create notification for the doctor
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedDoctor,
          channel: 'inapp',
          title: 'New Session Assigned',
          message: `A new therapy session has been scheduled for ${selectedDateTime.toLocaleDateString()} at ${selectedTime}`,
        })

      router.push('/dashboard/patient?booked=true')

    } catch (error) {
      console.error('Error booking session:', error)
      setError('Failed to book session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTherapyDetails = therapies.find(t => t.id === selectedTherapy)
  const selectedDoctorDetails = doctors.find(d => d.id === selectedDoctor)
  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Therapy Session</h1>
            <p className="text-gray-600">
              Schedule your Panchakarma therapy session with our experienced doctors.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleBookSession} className="space-y-8">
            {/* Therapy Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Therapy Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {therapies.map((therapy) => (
                  <div
                    key={therapy.id}
                    onClick={() => setSelectedTherapy(therapy.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTherapy === therapy.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{therapy.name}</h3>
                    {therapy.description && (
                      <p className="text-sm text-gray-600 mt-1">{therapy.description}</p>
                    )}
                    {therapy.duration_days && (
                      <p className="text-sm text-green-600 mt-1">
                        Duration: {therapy.duration_days} days
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Doctor *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDoctor === doctor.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {doctor.full_name || 'Dr. Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Date *
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() + i)
                  return date
                }).map((date) => (
                  <div
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {date.getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && selectedDoctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Time *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        selectedTime === time
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-sm font-medium">{time}</div>
                    </button>
                  ))}
                </div>
                
                {availableTimeSlots.length === 0 && (
                  <p className="text-red-600 text-sm mt-2">
                    No available time slots for the selected date and doctor.
                  </p>
                )}
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Session Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Any specific requirements or notes for your session..."
              />
            </div>

            {/* Booking Summary */}
            {selectedTherapyDetails && selectedDoctorDetails && selectedDate && selectedTime && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Therapy:</span>
                    <span className="font-medium">{selectedTherapyDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">{selectedDoctorDetails.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration} minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedTherapy || !selectedDoctor || !selectedDate || !selectedTime}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Booking...' : 'Book Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
