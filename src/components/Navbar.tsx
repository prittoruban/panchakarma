'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bell, LogOut, Menu, X } from 'lucide-react'

interface Notification {
  id: number
  title: string | null
  message: string | null
  send_at: string
}

interface NavbarProps {
  userRole?: string
  userName?: string
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (userRole) {
      fetchNotifications()
    }
  }, [userRole])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('send_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNavigationLinks = () => {
    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard' },
    ]

    switch (userRole) {
      case 'patient':
        return [
          ...baseLinks,
          { href: '/therapy', label: 'Book Therapy' },
        ]
      case 'doctor':
        return [
          ...baseLinks,
          { href: '/dashboard/doctor/patients', label: 'Patients' },
        ]
      case 'admin':
        return [
          ...baseLinks,
          { href: '/dashboard/admin/users', label: 'Users' },
          { href: '/dashboard/admin/analytics', label: 'Analytics' },
        ]
      default:
        return baseLinks
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-600">AyurSutra</h1>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {getNavigationLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-700 hover:text-green-600 relative"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                {userName || 'User'} ({userRole})
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-700 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {getNavigationLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
