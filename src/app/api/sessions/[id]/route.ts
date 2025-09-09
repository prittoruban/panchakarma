import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { status } = await request.json()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is a doctor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'doctor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Update session status
    const { data, error } = await supabase
      .from('therapy_sessions')
      .update({ status })
      .eq('id', id)
      .eq('doctor_id', user.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Session update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
