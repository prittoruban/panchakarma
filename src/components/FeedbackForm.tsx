'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface FeedbackFormProps {
  sessionId: number
  onSubmit: (feedback: {
    rating: number
    symptoms: string
    improvement_notes: string
  }) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function FeedbackForm({ onSubmit, onCancel, isLoading }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [symptoms, setSymptoms] = useState('')
  const [improvementNotes, setImprovementNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (rating === 0) {
      newErrors.rating = 'Please provide a rating'
    }
    
    if (symptoms.trim().length < 10) {
      newErrors.symptoms = 'Please provide detailed symptoms (at least 10 characters)'
    }
    
    if (improvementNotes.trim().length < 10) {
      newErrors.improvementNotes = 'Please provide detailed improvement notes (at least 10 characters)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit({
        rating,
        symptoms: symptoms.trim(),
        improvement_notes: improvementNotes.trim()
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const renderStars = () => {
    const stars = []
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-8 w-8 ${
              i <= (hoveredRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } transition-colors duration-150`}
          />
        </button>
      )
    }
    
    return stars
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Session Feedback</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate this session?
          </label>
          <div className="flex space-x-1">
            {renderStars()}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              You rated: {rating} star{rating !== 1 ? 's' : ''}
            </p>
          )}
          {errors.rating && (
            <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Symptoms */}
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms Experienced
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Please describe any symptoms you experienced during or after the session..."
          />
          <p className="text-sm text-gray-500 mt-1">
            {symptoms.length}/500 characters
          </p>
          {errors.symptoms && (
            <p className="text-red-600 text-sm mt-1">{errors.symptoms}</p>
          )}
        </div>

        {/* Improvement Notes */}
        <div>
          <label htmlFor="improvementNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Improvements Noticed
          </label>
          <textarea
            id="improvementNotes"
            value={improvementNotes}
            onChange={(e) => setImprovementNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Please describe any improvements or changes you noticed after the session..."
          />
          <p className="text-sm text-gray-500 mt-1">
            {improvementNotes.length}/500 characters
          </p>
          {errors.improvementNotes && (
            <p className="text-red-600 text-sm mt-1">{errors.improvementNotes}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  )
}
