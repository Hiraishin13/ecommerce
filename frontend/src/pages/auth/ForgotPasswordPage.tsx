import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/auth.service'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to send reset email. Please try again.'
      toast.error(msg)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <CheckCircle size={48} className="mx-auto text-[#388E3C] mb-4" />
          <h2 className="text-xl font-black uppercase tracking-wider mb-2">Check Your Email</h2>
          <p className="text-sm text-muted mb-2">
            We sent a password reset link to
          </p>
          <p className="text-sm font-bold mb-6">{getValues('email')}</p>
          <Link to="/login">
            <Button variant="secondary">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-black uppercase tracking-[0.2em]">SHOP</Link>
          <h1 className="text-xl font-black uppercase tracking-wider mt-4">Reset Password</h1>
          <p className="text-sm text-muted mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
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

          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-muted hover:text-black transition-colors uppercase tracking-wider"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
