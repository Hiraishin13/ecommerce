import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { isAuthenticated, setAuth } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.register(data)
      setAuth(res.user, res.token)
      toast.success('Account created! Welcome!')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-black uppercase tracking-[0.2em]">SHOP</Link>
          <h1 className="text-xl font-black uppercase tracking-wider mt-4">Create Account</h1>
          <p className="text-sm text-muted mt-1">Join us today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            autoComplete="name"
            {...register('name')}
          />

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
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            autoComplete="new-password"
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            error={errors.password_confirmation?.message}
            autoComplete="new-password"
            {...register('password_confirmation')}
          />

          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-black hover:underline uppercase tracking-wider">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
