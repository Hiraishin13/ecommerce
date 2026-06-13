import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService } from '../../services/order.service'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { formatPrice } from '../../utils/formatPrice'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Breadcrumb from '../../components/common/Breadcrumb'

const addressSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  postal_code: z.string().min(3, 'Required'),
  country: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Required'),
})

type AddressForm = z.infer<typeof addressSchema>

type Step = 1 | 2 | 3

const STEPS = [
  { n: 1 as Step, label: 'Address' },
  { n: 2 as Step, label: 'Shipping' },
  { n: 3 as Step, label: 'Payment' },
]

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1)
  const [shippingAddress, setShippingAddress] = useState<AddressForm | null>(null)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [placing, setPlacing] = useState(false)

  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const cartTotal = total()
  const shippingCost = shippingMethod === 'express' ? 9.99 : cartTotal >= 50 ? 0 : 4.99
  const orderTotal = cartTotal + shippingCost

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) })

  const onAddressSubmit = (data: AddressForm) => {
    setShippingAddress(data)
    setStep(2)
  }

  const placeOrder = async () => {
    if (!shippingAddress) return
    setPlacing(true)
    try {
      const order = await orderService.createOrder({
        shipping_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        shipping_email: user?.email ?? '',
        shipping_phone: shippingAddress.phone,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_zip: shippingAddress.postal_code,
        shipping_country: shippingAddress.country,
        payment_method: 'cash_on_delivery',
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      })
      clearCart()
      navigate(`/order-success/${order.id}`)
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout' },
        ]}
        className="mb-6"
      />
      <h1 className="text-2xl font-black uppercase tracking-wider mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, idx) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-black border-2 transition-colors ${
                  step > s.n
                    ? 'bg-[#388E3C] border-[#388E3C] text-white'
                    : step === s.n
                    ? 'bg-black border-black text-white'
                    : 'border-accent text-muted'
                }`}
              >
                {step > s.n ? <Check size={12} /> : s.n}
              </div>
              <span
                className={`hidden sm:block text-xs font-bold uppercase tracking-wider ${
                  step === s.n ? 'text-black' : 'text-muted'
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${step > s.n ? 'bg-black' : 'bg-accent'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Steps content */}
        <div className="flex-1">
          {/* Step 1: Address */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" error={errors.first_name?.message} {...register('first_name')} />
                <Input label="Last Name" error={errors.last_name?.message} {...register('last_name')} />
              </div>
              <Input label="Street Address" error={errors.address?.message} {...register('address')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" error={errors.city?.message} {...register('city')} />
                <Input label="Postal Code" error={errors.postal_code?.message} {...register('postal_code')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="State / Region" error={errors.state?.message} {...register('state')} />
                <Input label="Country" error={errors.country?.message} {...register('country')} />
              </div>
              <Input label="Phone Number" type="tel" error={errors.phone?.message} {...register('phone')} />
              <Button type="submit" size="lg">Continue to Shipping</Button>
            </form>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider mb-4">Shipping Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  {
                    id: 'standard' as const,
                    label: 'Standard Delivery',
                    desc: '3–5 business days',
                    price: cartTotal >= 50 ? 'Free' : formatPrice(4.99),
                  },
                  {
                    id: 'express' as const,
                    label: 'Express Delivery',
                    desc: '1–2 business days',
                    price: formatPrice(9.99),
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                      shippingMethod === opt.id ? 'border-black' : 'border-accent hover:border-black'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={shippingMethod === opt.id}
                      onChange={() => setShippingMethod(opt.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        shippingMethod === opt.id ? 'border-black bg-black' : 'border-accent'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.desc}</p>
                    </div>
                    <p className="text-sm font-bold">{opt.price}</p>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider mb-4">Payment</h2>
              <div className="border-2 border-black p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-black" />
                  <div>
                    <p className="text-sm font-bold">Cash on Delivery</p>
                    <p className="text-xs text-muted">Pay when your order arrives</p>
                  </div>
                </div>
              </div>

              {/* Address summary */}
              {shippingAddress && (
                <div className="mb-6 p-4 bg-[#FAFAFA] border border-accent text-xs">
                  <p className="font-bold uppercase tracking-wider mb-2">Shipping to:</p>
                  <p className="text-muted">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                  <p className="text-muted">{shippingAddress.address}, {shippingAddress.city}</p>
                  <p className="text-muted">{shippingAddress.postal_code}, {shippingAddress.country}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={placeOrder} loading={placing} size="lg">
                  Place Order — {formatPrice(orderTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="border border-accent p-5">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 text-xs">
                  <div className="w-10 h-10 bg-accent flex-shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-muted">×{item.quantity}</p>
                  </div>
                  <p className="font-bold flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-accent pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-black border-t border-black pt-2">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
