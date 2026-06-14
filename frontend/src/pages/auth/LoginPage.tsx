import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { m } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { stagger, staggerItem } from '../../utils/motion'

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

function getRedirectPath(role: string | undefined, from: string): string {
  if (role === 'superadmin') return '/superadmin'
  if (role === 'admin') return '/admin'
  if (from && from !== '/' && !from.startsWith('/admin') && !from.startsWith('/superadmin')) return from
  return '/account'
}

export default function LoginPage() {
  const { login, logout, isAuthenticated, user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
  const [switching, setSwitching] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (isAuthenticated && !switching) navigate(getRedirectPath(user?.role, from), { replace: true })
  }, [isAuthenticated, switching]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data.email, data.password)
      toast.success('Bienvenue !')
      navigate(getRedirectPath(result.user.role, from), { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Identifiants incorrects.'
      toast.error(msg)
    }
  }

  // Si l'utilisateur est déjà connecté et veut changer de compte
  if (isAuthenticated && !switching) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-sm text-muted">
            Connecté en tant que <strong>{user?.name}</strong> ({user?.email})
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(getRedirectPath(user?.role, from))}
              className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Continuer ({user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Mon compte'})
            </button>
            <button
              onClick={async () => { setSwitching(true); await logout() }}
              className="px-6 py-3 border border-accent text-xs font-black uppercase tracking-wider hover:border-black transition-colors"
            >
              Changer de compte
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <m.div
        className="w-full max-w-md"
        variants={stagger(0.06)}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <m.div variants={staggerItem} className="text-center mb-10">
          <Link to="/" className="text-2xl font-black uppercase tracking-[0.2em]">SHOP</Link>
          <h1 className="text-xl font-black uppercase tracking-wider mt-4">Sign In</h1>
          <p className="text-sm text-muted mt-1">Welcome back</p>
        </m.div>

        <m.form variants={staggerItem} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-muted hover:text-black transition-colors uppercase tracking-wider"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            Sign In
          </Button>
        </m.form>

        <m.div variants={staggerItem} className="mt-6 text-center">
          <p className="text-xs text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-black hover:underline uppercase tracking-wider">
              Register
            </Link>
          </p>
        </m.div>
      </m.div>
    </div>
  )
}
