'use client';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Loader2, CheckCircle, Clock, AlertCircle, X, ShoppingCart, Trash2, ArrowRight, Plus } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { Button } from '@/app/src/components/ui/button';
import { Input } from '@/app/src/components/ui/input';
import { Textarea } from '@/app/src/components/ui/textarea';
import { Booking, BookingStatus } from '@/app/types/booking';
import { Label } from '@/app/src/components/ui/label';
import { useRouter } from 'next/navigation';

interface CartItem {
  groupId: string;
  packageId: string[];
  name: string;
  category: string;
  price: number;
  startDate: string;
  endDate: string;
  description?: string;
  deliverables?: string[];
  duration?: string;
  preview?: string;
}

interface BookingDetailsModal {
  open: boolean;
  booking: Booking | null;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
};

export default function CustomerBookingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [bookingDetailsModal, setBookingDetailsModal] = useState<BookingDetailsModal>({
    open: false,
    booking: null,
  });

  const [formData, setFormData] = useState({
    eventType: '',
    eventName: '',
    venue: '',
    notes: '',
  });

  useEffect(() => {
    fetchBookings();
    loadCartFromStorage();
  }, []);

  // Load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('bookingCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Save cart to localStorage
  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem('bookingCart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/booking');
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openBookingDetails = (booking: Booking) => {
    setBookingDetailsModal({
      open: true,
      booking,
    });
  };

  const closeBookingDetails = () => {
    setBookingDetailsModal({
      open: false,
      booking: null,
    });
  };

  const removeFromCart = (packageId: string) => {
    const updatedCart = cart.filter(item => !item.packageId.includes(packageId));
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
    toast({
      title: 'Removed from Cart',
      description: 'Package removed from your cart',
    });
  };

  const updateCartItemDates = (packageId: string, startDate: string, endDate: string) => {
    const updatedCart = cart.map(item =>
      item.packageId.includes(packageId) ? { ...item, startDate, endDate } : item
    );
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is Empty',
        description: 'Please add packages to your cart first',
        variant: 'destructive',
      });
      return;
    }
    setShowCheckout(true);
    setShowCart(false);
  };

  const handleSubmitBooking = async () => {
    // Validate cart items
    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one package to your cart',
        variant: 'destructive',
      });
      return;
    }

    // Validate all packages have dates
    const missingDates = cart.filter(item => !item.startDate || !item.endDate);
    if (missingDates.length > 0) {
      toast({
        title: 'Error',
        description: 'Please set start and end dates for all packages in your cart',
        variant: 'destructive',
      });
      return;
    }

    // Validate form data
    if (!formData.eventType || !formData.eventName || !formData.venue) {
      toast({
        title: 'Error',
        description: 'Please fill in all required event details',
        variant: 'destructive',
      });
      return;
    }

    // Validate dates
    for (const item of cart) {
      if (new Date(item.startDate) > new Date(item.endDate)) {
        toast({
          title: 'Error',
          description: `Invalid dates for ${item.name}: start date must be before end date`,
          variant: 'destructive',
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Calculate overall event dates from packages
      const allStartDates = cart.map(item => new Date(item.startDate));
      const allEndDates = cart.map(item => new Date(item.endDate));
      const overallStartDate = new Date(Math.min(...allStartDates.map(d => d.getTime())));
      const overallEndDate = new Date(Math.max(...allEndDates.map(d => d.getTime())));

      const response = await fetch('/api/admin/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packages: cart.map(item => ({
            groupId: item.groupId,
            packageId: item.packageId,
            name: item.name,
            category: item.category,
            price: item.price,
            startDate: item.startDate,
            endDate: item.endDate,
          })),
          eventType: formData.eventType,
          eventName: formData.eventName,
          startDate: overallStartDate.toISOString().split('T')[0],
          endDate: overallEndDate.toISOString().split('T')[0],
          venue: formData.venue,
          totalAmount: getTotalAmount(),
          paidAmount: 0,
          notes: formData.notes,
          status: 'pending' as BookingStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Booking Created',
          description: 'Your booking request has been submitted successfully.',
        });
        // Clear cart
        setCart([]);
        saveCartToStorage([]);
        setShowCheckout(false);
        setFormData({
          eventType: '',
          eventName: '',
          venue: '',
          notes: '',
        });
        fetchBookings();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create booking',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  const goToPackages = () => {
    router.push('/customer/packages');
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Cart Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your event bookings</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goToPackages}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Browse Packages
            </Button>
            <Button
              variant="default"
              onClick={() => setShowCart(true)}
              className="gap-2 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground rounded-full">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 hover:shadow-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 hover:shadow-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 hover:shadow-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'approved' || b.status === 'in-progress').length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 hover:shadow-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-purple-600">{bookings.filter(b => b.status === 'completed').length}</p>
          </div>
        </div>

        {/* My Bookings Section */}
        <div className="bg-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6">Start by browsing our packages!</p>
              <Button onClick={goToPackages} className="gap-2">
                <Plus className="w-4 h-4" />
                Browse Packages
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Event Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Event Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date Range</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Venue</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Packages</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map(booking => {
                    const StatusIcon = statusConfig[booking.status].icon;
                    return (
                      <tr key={booking.id} onClick={() => openBookingDetails(booking)} className="hover:bg-muted/30 cursor-pointer transition-colors">
                        <td className="p-4 font-medium text-foreground">{booking.eventName}</td>
                        <td className="p-4 text-sm text-foreground">{booking.eventType}</td>
                        <td className="p-4 text-sm text-foreground">{formatDateRange(booking.startDate, booking.endDate)}</td>
                        <td className="p-4 text-sm text-foreground truncate max-w-xs">{booking.venue}</td>
                        <td className="p-4 text-sm text-foreground">
                          {booking.packages.length} package{booking.packages.length !== 1 ? 's' : ''}
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-semibold text-foreground">{formatPrice(booking.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">Paid: {formatPrice(booking.paidAmount)}</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[booking.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[booking.status].label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative bg-card w-full max-w-md h-full overflow-hidden flex flex-col shadow-2xl">
            {/* Cart Header */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
                  <p className="text-md text-muted-foreground">{cart.length} package{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Button variant="close" onClick={() => setShowCart(false)} size="icon">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-20 h-20 text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground mb-4">Browse packages to get started!</p>
                  <Button onClick={goToPackages} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Packages
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.packageId[0]}
                      className="bg-muted/30 rounded-lg p-4 border border-border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.category}</p>
                          <p className="text-lg font-bold text-primary mt-2">{formatPrice(item.price)}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.packageId[0])}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Date Selection */}
                      <div className="space-y-3 pt-3 border-t border-border">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-muted-foreground">
                            Start Date & Time <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="datetime-local"
                            value={item.startDate}
                            onChange={(e) => updateCartItemDates(item.packageId[0], e.target.value, item.endDate)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1 text-muted-foreground">
                            End Date & Time <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="datetime-local"
                            value={item.endDate}
                            onChange={(e) => updateCartItemDates(item.packageId[0], item.startDate, e.target.value)}
                            min={item.startDate || new Date().toISOString().slice(0, 16)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t px-6 py-4 bg-muted/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(getTotalAmount())}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full gap-2" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Complete Your Booking</h2>
                <p className="text-sm text-muted-foreground">Fill in event details</p>
              </div>
              <Button variant="ghost" onClick={() => setShowCheckout(false)} size="sm">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Event Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Event Type <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.eventType}
                      onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                      placeholder="e.g., Wedding, Birthday"
                    />
                  </div>
                  <div>
                    <Label>Event Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.eventName}
                      onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                      placeholder="e.g., John & Jane's Wedding"
                    />
                  </div>
                </div>

                <div>
                  <Label>Venue <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Event venue address"
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Order Summary</h3>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.packageId[0]} className="flex justify-between items-start p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        {item.startDate && item.endDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateRange(item.startDate.split('T')[0], item.endDate.split('T')[0])}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-foreground">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(getTotalAmount())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t px-6 py-4 bg-muted/20 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCheckout(false)}
                className="flex-1"
                disabled={submitting}
              >
                Back to Cart
              </Button>
              <Button
                onClick={handleSubmitBooking}
                className="flex-1"
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {bookingDetailsModal.open && bookingDetailsModal.booking && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:bg-white print:p-0">
          <div
            id="invoice"
            className="
        bg-white text-black
        w-full max-w-4xl
        max-h-[95vh]
        overflow-y-auto
        rounded-xl shadow-2xl
        print:max-h-none
        print:overflow-visible
        print:shadow-none
        print:rounded-none
      "
          >
            {/* HEADER */}
            <div className="px-6 md:px-8 py-6 border-b">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  <p className="text-sm text-gray-500">
                    #{bookingDetailsModal.booking.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Issued on {formatDate(bookingDetailsModal.booking.createdAt)}
                  </p>
                </div>

                <div className="md:text-right">
                  <Button
                    variant="close"
                    size={'icon'}
                    onClick={closeBookingDetails}
                    className="print:hidden"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* BILLING INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  {/* Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-28 text-xs text-gray-500">Name</span>
                    <span className="font-semibold text-sm">
                      {bookingDetailsModal.booking.eventName}
                    </span>
                  </div>

                  {/* Event Type */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-28 text-xs text-gray-500">Event Type</span>
                    <span className="text-sm text-gray-700">
                      {bookingDetailsModal.booking.eventType}
                    </span>
                  </div>

                  {/* Venue */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-28 text-xs text-gray-500">Venue</span>
                    <span className="text-sm text-gray-700">
                      {bookingDetailsModal.booking.venue}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Event Duration</p>
                  <p className="text-sm">
                    {formatDateRange(
                      bookingDetailsModal.booking.startDate,
                      bookingDetailsModal.booking.endDate
                    )}
                  </p>
                </div>
              </div>

              {/* LINE ITEMS */}
              {/* Desktop / Print Table */}
              <div className="hidden md:block print:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="py-2 text-left">Package</th>
                      <th className="py-2 text-left">Category</th>
                      <th className="py-2 text-left">Duration</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingDetailsModal.booking.packages.map(pkg => (
                      <tr key={pkg.packageId[0]} className="border-b text-sm">
                        <td className="py-3 font-medium">{pkg.name}</td>
                        <td className="py-3 capitalize">
                          {pkg.category || "General"}
                        </td>
                        <td className="py-3">
                          {formatDateRange(pkg.startDate, pkg.endDate)}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatPrice(pkg.price || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Line Items */}
              <div className="space-y-4 md:hidden print:hidden">
                {bookingDetailsModal.booking.packages.map(pkg => (
                  <div
                    key={pkg.packageId[0]}
                    className="border rounded-lg p-4 space-y-1"
                  >
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {pkg.category || "General"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateRange(pkg.startDate, pkg.endDate)}
                    </p>
                    <p className="font-semibold mt-2">
                      {formatPrice(pkg.price || 0)}
                    </p>
                  </div>
                ))}
              </div>

              {/* PAYMENT SUMMARY */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span>{formatPrice(bookingDetailsModal.booking.totalAmount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid</span>
                    <span className="text-green-600">
                      {formatPrice(bookingDetailsModal.booking.paidAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Balance Due</span>
                    <span className="text-orange-600">
                      {formatPrice(
                        bookingDetailsModal.booking.totalAmount -
                        bookingDetailsModal.booking.paidAmount
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              {bookingDetailsModal.booking.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">
                    {bookingDetailsModal.booking.notes}
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t px-6 md:px-8 py-4 flex justify-between items-center text-xs text-gray-500 print:hidden">
              <span>Status: {bookingDetailsModal.booking.status}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
                <Button variant="ghost" onClick={closeBookingDetails}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}