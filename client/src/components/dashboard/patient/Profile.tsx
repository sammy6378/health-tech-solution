import { useState, useEffect } from 'react'
import { Camera, Shield, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserData } from '@/hooks/useDashboard'
import { useUpdatePatientProfile } from '@/hooks/usePatientProfile'

export default function ProfilePage() {
  const {profileData: profile} =useUserData()
  const {mutateAsync: updateProfile} = useUpdatePatientProfile()

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    prescriptionAlerts: true,
    healthUpdates: true,
    systemNotifications: true,
    promotionalUpdates: false,
  })

  const [isUpdating, setIsUpdating] = useState(false)

  // Load user data on component mount
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        profilePicture: profile.patientProfile?.avatar || '',
      })
    }
  }, [profile])

  const handleProfileUpdate = async () => {

    setIsUpdating(true)
    try {
      await updateProfile({
        id: profile?.patientProfile?.profile_id ?? '',
        data: {
          avatar: profileData.profilePicture,
        },
      })
      setIsUpdating(false)
    
    } catch (error) {

    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return
    }

    if (passwordData.newPassword.length < 6) {
      
      return
    }

    setIsUpdating(true)
    try {
      // TODO: Implement your API call to change password
      // Example:
      // const response = await fetch(`/api/users/${userId}/change-password`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword,
      //   }),
      // })

      // if (!response.ok) throw new Error('Failed to change password')

    

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
    
    } finally {
      setIsUpdating(false)
    }
  }

  const handleNotificationSave = async () => {
    try {
      // TODO: Implement your API call to save notification preferences
      // Example:
      // const response = await fetch(`/api/users/${userId}/notifications`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notifications),
      // })

      // if (!response.ok) throw new Error('Failed to save preferences')

     
    } catch (error) {
      
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' }
    if (password.length < 6)
      return { strength: 1, text: 'Weak', color: 'bg-red-500' }
    if (password.length < 10)
      return { strength: 2, text: 'Medium', color: 'bg-yellow-500' }
    return { strength: 3, text: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  const getUserInitials = () => {
    const firstName = profileData.firstName || ''
    const lastName = profileData.lastName || ''
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  const getFullName = () => {
    return `${profileData.firstName} ${profileData.lastName}`.trim()
  }

  return (
    <div className="space-y-6 px-4 py-8 bg-background text-foreground dark:bg-gray-900 dark:text-white min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2 dark:text-gray-400">
          Manage your account preferences and security settings.
        </p>
      </div>

      {/* Profile Info */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.profilePicture} />
              <AvatarFallback className="dark:bg-gray-700">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="dark:border-gray-600 dark:text-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={(e) =>
                  setProfileData({ ...profileData, firstName: e.target.value })
                }
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={(e) =>
                  setProfileData({ ...profileData, lastName: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (Display)</Label>
              <Input
                id="fullName"
                disabled
                value={getFullName()}
                className="bg-muted dark:bg-gray-700 dark:text-gray-400"
              />
            </div>
          </div>

          <Button onClick={handleProfileUpdate} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  passwordStrength.strength === 1
                    ? 'border-red-500'
                    : passwordStrength.strength === 2
                    ? 'border-yellow-500'
                    : 'border-green-500'
                }`}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
              {passwordStrength.text && (
                <p
                  className={`text-sm ${
                    passwordStrength.strength === 1
                      ? 'text-red-500'
                      : passwordStrength.strength === 2
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}
                >
                  {passwordStrength.text}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <Button onClick={handlePasswordChange} disabled={isUpdating}>
            {isUpdating ? 'Changing...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h4 className="font-medium mb-3">Health & Medical</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="appointmentReminders">
                Appointment reminders
              </Label>
              <Switch
                id="appointmentReminders"
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    appointmentReminders: checked,
                  }))
                }
              />
            </div>

            {/* Add more switch fields similarly... */}
          </div>

          <Button onClick={handleNotificationSave}>Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  )
}
