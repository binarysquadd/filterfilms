'use client';
import Link from 'next/link';
import {
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Target,
  Award,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/app/lib/firebase/auth-context';
import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/app/types/booking';
import { Attendance } from '@/app/types/attendance';
import toast from 'react-hot-toast';

export default function TeamDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Bookings assigned to the user
  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/booking');
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (err) {
      toast.error('Failed to load bookings. Please try again later.');
      console.error('Error fetching bookings:', err);
    }
  }, []);

  // Fetch Attendance records
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/attendance');
      const data = await res.json();

      if (res.ok && data.attendance) {
        const filteredAttendance = data.attendance.filter(
          (a: Attendance) => a.memberId === user?.id
        );
        setAttendance(filteredAttendance);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchAttendance()]);
      setLoading(false);
    };

    loadData();
  }, [fetchBookings, fetchAttendance]);

  // Calculate statistics
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const inProgressBookings = bookings.filter((b) => b.status === 'in-progress').length;
  const approvedBookings = bookings.filter((b) => b.status === 'approved').length;
  // const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const totalDaysTracked = attendance.length;
  const presentDays = attendance.filter((a) => a.status === 'present').length;
  // const absentDays = attendance.filter(a => a.status === 'absent').length;
  const attendanceRate =
    totalDaysTracked > 0 ? ((presentDays / totalDaysTracked) * 100).toFixed(1) : '0';

  // Calculate upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = bookings.filter((b) => {
    const eventDate = new Date(b.startDate);
    return eventDate >= today && eventDate <= nextWeek;
  }).length;

  // Calculate total working hours this month
  const calculateTotalHours = () => {
    let totalMinutes = 0;
    attendance.forEach((a) => {
      if (a.checkIn && a.checkOut) {
        const [inH, inM] = a.checkIn.split(':').map(Number);
        const [outH, outM] = a.checkOut.split(':').map(Number);
        totalMinutes += outH * 60 + outM - (inH * 60 + inM);
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const stats = [
    {
      label: 'Total Assignments',
      value: totalBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'Completed Tasks',
      value: completedBookings,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
    {
      label: 'In Progress',
      value: inProgressBookings,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
    },
    {
      label: 'Approved Events',
      value: approvedBookings,
      icon: Target,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
    },
    {
      label: 'Days Present',
      value: presentDays,
      icon: Users,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgLight: 'bg-teal-50',
    },
    {
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvents,
      icon: AlertCircle,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgLight: 'bg-pink-50',
    },
    {
      label: 'Total Hours',
      value: calculateTotalHours(),
      icon: Award,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      bgLight: 'bg-cyan-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Here are your assignments and attendance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border"
          >
            <div
              className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}
            >
              <stat.icon className={`w-6 h-6 text-muted`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* My Assignments */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">My Assignments</h2>
          <Link
            href="/team/bookings"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-muted mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
              <p className="text-muted-foreground">You have no assigned events at the moment</p>
            </div>
          ) : (
            bookings.slice(0, 5).map((assignment) => (
              <div
                key={assignment.id}
                className="p-6 hover:bg-gold/10 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{assignment.eventName}</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(assignment.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{assignment.eventType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : assignment.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700'
                            : assignment.status === 'approved'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {assignment.status === 'completed' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : assignment.status === 'in-progress' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {assignment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
