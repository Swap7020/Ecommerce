import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Package, Heart, MapPin, Bell, LogOut, Camera } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile } from '@/store/slices/authSlice'
import { useDispatch } from 'react-redux'
import { authService } from '@/services/authService'
import { formatDate } from '@/utils/formatters'
import Breadcrumb from '@/components/common/Breadcrumb'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const NAV_ITEMS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
]

export default function AccountPage() {
  const { user, logout } = useAuth()
  const dispatch = useDispatch()
  const [activeSection, setActiveSection] = useState('profile')
  const [addresses, setAddresses] = useState([])
  const [editingAddress, setEditingAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.profile?.phone || '',
    }
  })

  useEffect(() => {
    authService.getAddresses().then(data => setAddresses(data.results || data || [])).catch(() => {})
  }, [])

  const onProfileSave = async (data) => {
    await dispatch(updateProfile(data))
  }

  const deleteAddress = async (id) => {
    try {
      await authService.deleteAddress(id)
      setAddresses(a => a.filter(x => x.id !== id))
      toast.success('Address deleted.')
    } catch { toast.error('Failed to delete address.') }
  }

  const setDefaultAddress = async (id) => {
    try {
      await authService.setDefaultAddress(id)
      setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })))
      toast.success('Default address updated.')
    } catch { toast.error('Failed to update.') }
  }

  return (
    <div className="min-h-screen bg-ivory-100">
      <div className="container-aura py-6">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'My Account' }]} />
        <h1 className="font-display text-3xl text-charcoal mt-3 mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-soft">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-5 pb-5 border-b border-nude-100">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-nude/20 flex items-center justify-center">
                    {user?.profile?.profile_image ? (
                      <img src={user.profile.profile_image} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="font-serif text-2xl text-nude">{user?.first_name?.[0]}</span>
                    )}
                  </div>
                </div>
                <p className="font-medium text-sm text-charcoal mt-2">{user?.full_name}</p>
                <p className="text-xs text-charcoal-400">{user?.email}</p>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                      activeSection === id ? 'bg-nude text-white' : 'text-charcoal-500 hover:bg-ivory'
                    )}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
                <Link
                  to="/account/orders"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal-500 hover:bg-ivory transition-colors"
                >
                  <Package size={16} /> My Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal-500 hover:bg-ivory transition-colors"
                >
                  <Heart size={16} /> Wishlist
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="md:col-span-3">
            {/* Profile */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-2xl p-6 shadow-soft animate-fade-in">
                <h2 className="font-serif text-xl text-charcoal mb-6">Personal Information</h2>
                <form onSubmit={handleSubmit(onProfileSave)} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">First Name</label>
                    <input {...register('first_name', { required: true })} className="input" />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input {...register('last_name')} className="input" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input value={user?.email} disabled className="input bg-ivory cursor-not-allowed" />
                    {!user?.is_email_verified && (
                      <p className="text-xs text-amber-600 mt-1">Email not verified</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input {...register('phone')} className="input" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Member Since</label>
                    <input value={formatDate(user?.date_joined)} disabled className="input bg-ivory cursor-not-allowed" />
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <button type="submit" disabled={isSubmitting} className="btn-primary px-8">
                      {isSubmitting ? 'Saving…' : 'Save Changes'}
                    </button>
                    <Link to="/account/orders" className="btn-ghost px-6">View Orders</Link>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses */}
            {activeSection === 'addresses' && (
              <div className="bg-white rounded-2xl p-6 shadow-soft animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-charcoal">Saved Addresses</h2>
                  <button onClick={() => { setShowAddressForm(true); setEditingAddress(null) }} className="btn-secondary py-2 px-4 text-xs">
                    + Add New
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className={clsx(
                      'p-4 rounded-xl border',
                      addr.is_default ? 'border-nude bg-nude-50' : 'border-nude-100'
                    )}>
                      {addr.is_default && <span className="badge-nude text-2xs mb-2 inline-block">Default</span>}
                      <p className="font-medium text-sm text-charcoal">{addr.full_name}</p>
                      <p className="text-xs text-charcoal-400 mt-1">{addr.address_line1}</p>
                      <p className="text-xs text-charcoal-400">{addr.city}, {addr.state} {addr.pincode}</p>
                      <p className="text-xs text-charcoal-400">{addr.phone}</p>
                      <div className="flex gap-3 mt-3">
                        <button onClick={() => { setEditingAddress(addr); setShowAddressForm(true) }} className="text-xs text-nude hover:underline">Edit</button>
                        <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                        {!addr.is_default && (
                          <button onClick={() => setDefaultAddress(addr.id)} className="text-xs text-charcoal-400 hover:text-nude">Set Default</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {showAddressForm && (
                  <AddressForm
                    address={editingAddress}
                    onSave={async (data) => {
                      try {
                        if (editingAddress) {
                          const updated = await authService.updateAddress(editingAddress.id, data)
                          setAddresses(a => a.map(x => x.id === updated.id ? updated : x))
                          toast.success('Address updated.')
                        } else {
                          const created = await authService.createAddress(data)
                          setAddresses(a => [...a, created])
                          toast.success('Address saved.')
                        }
                        setShowAddressForm(false)
                      } catch { toast.error('Failed to save address.') }
                    }}
                    onCancel={() => setShowAddressForm(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddressForm({ address, onSave, onCancel }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: address || {} })
  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-6 pt-6 border-t border-nude-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <h3 className="sm:col-span-2 font-medium text-charcoal">{address ? 'Edit Address' : 'Add New Address'}</h3>
      <div><label className="label">Full Name</label><input {...register('full_name', { required: true })} className="input" /></div>
      <div><label className="label">Phone</label><input {...register('phone', { required: true })} className="input" /></div>
      <div className="sm:col-span-2"><label className="label">Address Line 1</label><input {...register('address_line1', { required: true })} className="input" /></div>
      <div className="sm:col-span-2"><label className="label">Landmark</label><input {...register('address_line2')} className="input" /></div>
      <div><label className="label">City</label><input {...register('city', { required: true })} className="input" /></div>
      <div><label className="label">State</label><input {...register('state', { required: true })} className="input" /></div>
      <div><label className="label">Pincode</label><input {...register('pincode', { required: true })} className="input" /></div>
      <div className="sm:col-span-2 flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-6">{isSubmitting ? 'Saving…' : 'Save Address'}</button>
        <button type="button" onClick={onCancel} className="btn-ghost px-6">Cancel</button>
      </div>
    </form>
  )
}
