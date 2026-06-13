import { useState } from 'react'
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const addressSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  address: z.string().min(5, 'Address too short'),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  postal_code: z.string().min(3, 'Required'),
  country: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Required'),
})

type AddressForm = z.infer<typeof addressSchema>

interface SavedAddress extends AddressForm {
  id: number
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) })

  const openNew = () => {
    setEditingId(null)
    reset({})
    setModalOpen(true)
  }

  const openEdit = (addr: SavedAddress) => {
    setEditingId(addr.id)
    reset(addr)
    setModalOpen(true)
  }

  const onSubmit = async (data: AddressForm) => {
    // In a real app, call an API
    if (editingId !== null) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...data, id: editingId } : a))
      )
      toast.success('Address updated')
    } else {
      setAddresses((prev) => [...prev, { ...data, id: Date.now() }])
      toast.success('Address added')
    }
    setModalOpen(false)
  }

  const removeAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast.success('Address removed')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">Addresses</h1>
        <Button onClick={openNew} size="sm">
          <Plus size={14} /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 border border-accent">
          <MapPin size={32} className="mx-auto text-accent mb-3" />
          <p className="text-sm text-muted uppercase tracking-wider mb-4">No addresses saved</p>
          <Button onClick={openNew} size="sm">
            <Plus size={14} /> Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-accent p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-bold">
                  {addr.first_name} {addr.last_name}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1 hover:bg-accent transition-colors"
                    aria-label="Edit address"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => removeAddress(addr.id)}
                    className="p-1 hover:bg-accent transition-colors text-[#D32F2F]"
                    aria-label="Delete address"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted space-y-0.5">
                <p>{addr.address}</p>
                <p>{addr.city}, {addr.postal_code}</p>
                <p>{addr.state}, {addr.country}</p>
                <p>{addr.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId !== null ? 'Edit Address' : 'Add Address'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={errors.first_name?.message} {...register('first_name')} />
            <Input label="Last Name" error={errors.last_name?.message} {...register('last_name')} />
          </div>
          <Input label="Street Address" error={errors.address?.message} {...register('address')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.city?.message} {...register('city')} />
            <Input label="Postal Code" error={errors.postal_code?.message} {...register('postal_code')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="State / Region" error={errors.state?.message} {...register('state')} />
            <Input label="Country" error={errors.country?.message} {...register('country')} />
          </div>
          <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>
              {editingId !== null ? 'Update' : 'Save'} Address
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
