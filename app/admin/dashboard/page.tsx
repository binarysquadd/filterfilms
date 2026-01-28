"use client";

import Link from 'next/link';
import { Calendar, Image, Users, TrendingUp, ArrowRight, Package2, IndianRupee, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Package } from '@/app/types/package';
import { Booking } from '@/app/types/booking';
import { Gallery } from '@/app/types/gallery';
import { User } from '@/app/types/user';
import { useAuth } from '@/app/lib/firebase/auth-context';

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [packagesRes, bookingsRes, galleryRes, teamRes] = await Promise.all([
        fetch('/api/admin/package'),
        fetch('/api/admin/booking'),
        fetch('/api/admin/gallery'),
        fetch('/api/admin/team'),
      ]);
      const [packagesData, bookingsData, galleryData, teamData] = await Promise.all([
        packagesRes.json(),
        bookingsRes.json(),
        galleryRes.json(),
        teamRes.json(),
      ]);
      
      // Extract nested arrays from API response
      setPackages(Array.isArray(packagesData?.packages) ? packagesData.packages : []);
      setBookings(Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : []);
      setGallery(Array.isArray(galleryData?.galleries) ? galleryData.galleries : []);
      setTeam(Array.isArray(teamData?.team) ? teamData.team : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error
      setPackages([]);
      setBookings([]);
      setGallery([]);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Packages',
      value: packages.length,
      icon: Package2,
      color: 'bg-blue-500',
      link: '/admin/packages',
    },
    {
      label: 'Active Bookings',
      value: bookings.filter(b => b.status !== 'completed' && b.status !== 'rejected').length,
      icon: Calendar,
      color: 'bg-green-500',
      link: '/admin/bookings',
    },
    {
      label: 'Gallery Items',
      value: gallery.length,
      icon: Image,
      color: 'bg-purple-500',
      link: '/admin/gallery',
    },
    {
      label: 'Team Members',
      value: team.length,
      icon: Users,
      color: 'bg-orange-500',
      link: '/admin/team',
    },
  ];

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const pendingPayments = bookings.reduce((sum, b) => {
    const remaining = (b.totalAmount || 0) - (b.paidAmount || 0);
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-maroon rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-border flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(pendingPayments)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
        <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-card cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{booking.eventName}</p>
                    <p className="text-sm text-gray-600">{booking.startDate} - {booking.endDate} • {booking.venue}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{formatPrice(booking.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}