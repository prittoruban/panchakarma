import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { session_id, rating, symptoms, improvement_notes } = await request.json()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify the session belongs to the user
    const { data: session } = await supabase
      .from('therapy_sessions')
      .select('patient_id')
      .eq('id', session_id)
      .single()
    
    if (!session || session.patient_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Create feedback
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        session_id,
        patient_id: user.id,
        rating,
        symptoms,
        improvement_notes
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Feedback creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
