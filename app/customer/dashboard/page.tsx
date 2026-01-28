'use client';
import Link from 'next/link';
import { Calendar, Package, Clock, CheckCircle, AlertCircle, DollarSign, TrendingUp, Loader2, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '@/app/lib/firebase/auth-context';
import { useState, useEffect } from 'react';
import { Booking } from '@/app/types/booking';
import { Package as PackageType } from '@/app/types/package';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchPackages()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/booking');
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (err) {
      toast.error('Failed to load bookings.');
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/package');
      const data = await res.json();
      if (res.ok) setPackages(data.packages || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  const inProgressBookings = bookings.filter(b => b.status === 'in-progress').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  // const rejectedBookings = bookings.filter(b => b.status === 'rejected').length;

  // Financial statistics
  const totalAmountSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  // const totalPaidAmount = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalPendingAmount = bookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  // Upcoming events (next 30 days)
  const today = new Date();
  const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingEvents = bookings.filter(b => {
    const eventDate = new Date(b.startDate);
    return eventDate >= today && eventDate <= next30Days && b.status !== 'rejected';
  });

  // Next event
  const nextEvent = bookings
    .filter(b => new Date(b.startDate) >= today && b.status !== 'rejected' && b.status !== 'completed')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  // Recent bookings (last 5)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      link: '/customer/bookings',
    },
    {
      label: 'Pending Approval',
      value: pendingBookings,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      link: '/customer/bookings',
    },
    {
      label: 'Approved Events',
      value: approvedBookings,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      link: '/customer/bookings',
    },
    {
      label: 'In Progress',
      value: inProgressBookings,
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      link: '/customer/bookings',
    },
    {
      label: 'Completed',
      value: completedBookings,
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      link: '/customer/bookings',
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvents.length,
      icon: AlertCircle,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgLight: 'bg-pink-50',
      link: '/customer/bookings',
    },
    {
      label: 'Total Spent',
      value: formatPrice(totalAmountSpent),
      icon: DollarSign,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      link: '/customer/bookings',
    },
    {
      label: 'Pending Payment',
      value: formatPrice(totalPendingAmount),
      icon: DollarSign,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      link: '/customer/bookings',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your bookings and events</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 group"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Next Event Highlight */}
      {nextEvent && (
        <div className="bg-gradient-to-r from-primary to-primary rounded-xl shadow-lg p-6 text-popover">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-popover" />
                <h2 className="text-xl font-semibold">Your Next Event</h2>
              </div>
              <h3 className="text-2xl font-bold mb-2">{nextEvent.eventName}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(nextEvent.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{getDaysUntil(nextEvent.startDate)}</span>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {nextEvent.eventType}
                </div>
              </div>
            </div>
            <Link
              href="/customer/bookings"
              className="px-4 py-2 bg-card text-muted-foreground rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}


      {/* Recent Bookings */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Bookings</h2>
          <Link 
            href="/customer/bookings" 
            className="text-sm text-muted-foreground hover:text-primary font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gold mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start by browsing our packages and creating your first booking!</p>
              <Link
                href="/customer/packages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-popover rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Package className="w-4 h-4" />
                Browse Packages
              </Link>
            </div>
          ) : (
            recentBookings.map((booking) => {
              const pkg = packages.find(p => 
                booking.packages.some(bp => bp.packageId.includes(p.id))
              );
              const StatusIcon = statusConfig[booking.status].icon;

              return (
                <div 
                  key={booking.id} 
                  className="p-6 hover:bg-popover cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{booking.eventName}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[booking.status].color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[booking.status].label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{pkg?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-gray-900">{formatPrice(booking.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}