import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { userService } from '../../services/user.service'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (user) resetProfile({ name: user.name, email: user.email })
  }, [user, resetProfile])

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const updated = await userService.updateProfile(data)
      updateUser(updated)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    try {
      await userService.changePassword(data)
      toast.success('Password changed successfully')
      resetPassword()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password'
      toast.error(msg)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-black uppercase tracking-wider mb-8">Profile</h1>

      {/* Profile form */}
      <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4 mb-10">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b border-accent pb-2">
          Personal Information
        </h2>
        <Input
          label="Full Name"
          error={profileErrors.name?.message}
          {...regProfile('name')}
        />
        <Input
          label="Email"
          type="email"
          error={profileErrors.email?.message}
          {...regProfile('email')}
        />
        <Button type="submit" loading={savingProfile}>
          Save Changes
        </Button>
      </form>

      {/* Password form */}
      <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b border-accent pb-2">
          Change Password
        </h2>
        <Input
          label="Current Password"
          type="password"
          error={passwordErrors.current_password?.message}
          {...regPassword('current_password')}
        />
        <Input
          label="New Password"
          type="password"
          error={passwordErrors.password?.message}
          {...regPassword('password')}
        />
        <Input
          label="Confirm New Password"
          type="password"
          error={passwordErrors.password_confirmation?.message}
          {...regPassword('password_confirmation')}
        />
        <Button type="submit" loading={savingPassword} variant="secondary">
          Change Password
        </Button>
      </form>
    </div>
  )
}
