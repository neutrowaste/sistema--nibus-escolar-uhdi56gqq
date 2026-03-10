import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth()

  if (!user || !user.permissions.includes(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
