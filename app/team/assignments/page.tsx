'use client';
import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '@/app/src/components/ui/input';
import { Button } from '@/app/src/components/ui/button';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  userId: string;
  packageId: string;
  eventType: string;
  eventName: string;
  date: string;
  venue: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  assignedTeam?: string[];
  createdAt: string;
}

interface PackageInfo {
  id: string;
  name: string;
  price: number;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertCircle,
  },
};

export default function AssignmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await fetch('/api/admin/booking');
      const packagesRes = await fetch('/api/admin/package');

      const [bookingsData, packagesData] = await Promise.all([
        bookingsRes.json(),
        packagesRes.json(),
      ]);

      if (bookingsRes.ok) setBookings(bookingsData.bookings || []);
      if (packagesRes.ok) setPackages(packagesData.packages || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPackageById = (packageId: string) => {
    return packages.find((pkg) => pkg.id === packageId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // const completedBookings = bookings.filter(b => b.status === 'completed').length;
  // const inProgressBookings = bookings.filter(b => b.status === 'in-progress').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground ml-2">Loading...</span>
      </div>
    );
  }

  // Show booking details
  if (selectedBooking) {
    const pkg = getPackageById(selectedBooking.packageId);
    const StatusIcon = statusConfig[selectedBooking.status].icon;

    return (
      <div className="space-y-6 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedBooking(null)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </Button>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {selectedBooking.eventName}
                </h2>
                <p className="text-muted-foreground mt-1">{selectedBooking.eventType}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border ${statusConfig[selectedBooking.status].color}`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusConfig[selectedBooking.status].label}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex flex-col items-center justify-center border-2 border-primary/30">
                  <span className="text-2xl font-bold text-primary">
                    {new Date(selectedBooking.date).getDate()}
                  </span>
                  <span className="text-xs uppercase text-primary font-medium">
                    {new Date(selectedBooking.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Event Date</p>
                  <p className="font-semibold text-lg text-foreground">
                    {formatDate(selectedBooking.date)}
                  </p>
                  <p className="text-sm text-primary font-medium mt-1">
                    {getDaysUntil(selectedBooking.date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Venue</p>
                  <p className="font-semibold text-foreground">{selectedBooking.venue}</p>
                </div>
              </div>
            </div>

            {pkg && (
              <div className="bg-muted/30 rounded-xl p-5">
                <p className="text-sm text-muted-foreground mb-1">Package</p>
                <p className="font-semibold text-foreground">{pkg.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatPrice(pkg.price)}</p>
              </div>
            )}

            {selectedBooking.notes && (
              <div className="bg-muted/30 rounded-xl p-5">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm text-foreground">{selectedBooking.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">ID: {selectedBooking.id.slice(0, 8)}</span>
                {' • '}
                Created on{' '}
                {new Date(selectedBooking.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show assignments table
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">My Assignments</h1>
        <p className="text-muted-foreground">Events assigned to you</p>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-foreground min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {sortedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-20 h-20 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No assignments yet</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'No assignments match your filters'
                : 'You have no assigned events at the moment'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Event Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Days Until
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Venue</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedBookings.map((booking) => {
                  const StatusIcon = statusConfig[booking.status].icon;
                  const isUpcoming = new Date(booking.date) >= new Date();

                  return (
                    <tr
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-foreground">{booking.eventName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{booking.eventType}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{formatDate(booking.date)}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-sm font-medium ${
                            isUpcoming ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {getDaysUntil(booking.date)}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground truncate max-w-xs">{booking.venue}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[booking.status].color}`}
                        >
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
  );
}
