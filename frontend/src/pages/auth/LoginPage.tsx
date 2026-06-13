import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

function getRedirectPath(role: string | undefined, from: string): string {
  if (from !== '/') return from
  return role === 'admin' || role === 'superadmin' ? '/admin' : '/account'
}

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRedirectPath(user?.role, from), { replace: true })
    }
  }, [isAuthenticated, navigate, from, user?.role])

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate(getRedirectPath(result.user.role, from), { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid credentials. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-black uppercase tracking-[0.2em]">SHOP</Link>
          <h1 className="text-xl font-black uppercase tracking-wider mt-4">Sign In</h1>
          <p className="text-sm text-muted mt-1">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-black hover:underline uppercase tracking-wider">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
