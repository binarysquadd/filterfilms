'use client';
import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { Input } from '@/app/src/components/ui/input';
import { Button } from '@/app/src/components/ui/button';
import { Textarea } from '@/app/src/components/ui/textarea';
import { Label } from '@/app/src/components/ui/label';
import toast from 'react-hot-toast';
import { Booking, AssignmentTeamMember } from '@/app/types/booking';
import { useAuth } from '@/app/lib/firebase/auth-context';

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

const assignmentCategories = {
  photo_edit: 'Photo Edit',
  video_edit_traditional: 'Video Edit Traditional',
  video_edit_cinematic: 'Video Edit Cinematic',
};

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentTeamMember | null>(null);
  const [updatingCommentLoading, setUpdatingCommentLoading] = useState(false);
  const [updateCommentSuccess, setUpdateCommentSuccess] = useState(false);
  const [assignmentComments, setAssignmentComments] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await fetch('/api/admin/booking');
      const bookingsData = await bookingsRes.json();

      if (bookingsRes.ok) {
        setBookings(bookingsData.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
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

  const getMyAssignments = (booking: Booking) => {
    if (!user?.id) return [];
    return booking.assignments.filter((a) => a.memberId === user.id);
  };

  const filteredBookings = bookings
    .filter((booking) => {
      const myAssignments = getMyAssignments(booking);
      if (myAssignments.length === 0) return false;

      const matchesSearch =
        booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.eventType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const handleToggleComplete = async (assignment: AssignmentTeamMember) => {
    if (!selectedBooking) return;

    setUpdateCommentSuccess(true);
    try {
      const updatedAssignments = selectedBooking.assignments.map((a) =>
        a.memberId === assignment.memberId && a.category === assignment.category
          ? {
              ...a,
              isCompleted: !a.isCompleted,
              completedDate: !a.isCompleted ? new Date().toISOString() : undefined,
              comments: assignmentComments || a.comments,
            }
          : a
      );

      const response = await fetch(`/api/admin/booking/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: updatedAssignments }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
        setSelectedBooking(booking);
        const updatedAssignment = booking.assignments.find(
          (a: AssignmentTeamMember) =>
            a.memberId === assignment.memberId && a.category === assignment.category
        );
        setSelectedAssignment(updatedAssignment || null);
        setAssignmentComments('');
        toast.success(
          assignment.isCompleted ? 'Task marked as incomplete' : 'Task marked as complete'
        );
      } else {
        toast.error('Failed to update assignment');
      }
    } catch {
      toast.error('Failed to update assignment');
    } finally {
      setUpdateCommentSuccess(false);
    }
  };

  const handleUpdateComments = async () => {
    if (!selectedBooking || !selectedAssignment) return;

    setUpdatingCommentLoading(true);
    try {
      const updatedAssignments = selectedBooking.assignments.map((a) =>
        a.memberId === selectedAssignment.memberId && a.category === selectedAssignment.category
          ? { ...a, comments: assignmentComments }
          : a
      );

      const response = await fetch(`/api/admin/booking/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: updatedAssignments }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
        setSelectedBooking(booking);
        const updatedAssignment = booking.assignments.find(
          (a: AssignmentTeamMember) =>
            a.memberId === selectedAssignment.memberId && a.category === selectedAssignment.category
        );
        setSelectedAssignment(updatedAssignment || null);
        toast.success('Comments updated successfully');
      } else {
        toast.error('Failed to update comments');
      }
    } catch {
      toast.error('Failed to update comments');
    } finally {
      setUpdatingCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground ml-2">Loading...</span>
      </div>
    );
  }

  if (selectedBooking) {
    const myAssignments = getMyAssignments(selectedBooking);
    const StatusIcon = statusConfig[selectedBooking.status].icon;

    return (
      <div className="space-y-6 animate-fade-in">
        <Button
          variant="cancel"
          size="sm"
          onClick={() => {
            setSelectedBooking(null);
            setSelectedAssignment(null);
            setAssignmentComments('');
          }}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </Button>

        {/* Event Header */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-primary/10 p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">
                  {selectedBooking.eventName}
                </h2>
                <p className="text-muted-foreground text-sm">{selectedBooking.eventType}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border ${statusConfig[selectedBooking.status].color}`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusConfig[selectedBooking.status].label}
              </span>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="p-6 grid md:grid-cols-3 gap-4">
            {/* Date */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {new Date(selectedBooking.startDate).getDate()}
                  </span>
                  <span className="text-[9px] uppercase text-primary font-medium">
                    {new Date(selectedBooking.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                    })}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Event Date</p>
                  <p className="font-semibold text-sm">
                    {formatDateRange(selectedBooking.startDate, selectedBooking.endDate)}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {getDaysUntil(selectedBooking.startDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Venue</p>
                  <p className="font-semibold text-sm">{selectedBooking.venue}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Tasks Progress</p>
                  <p className="font-semibold text-sm mb-2">
                    {myAssignments.filter((a) => a.isCompleted).length} / {myAssignments.length}{' '}
                    Completed
                  </p>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(myAssignments.filter((a) => a.isCompleted).length / myAssignments.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Packages & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Packages */}
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Assigned Packages
                  <span className="text-xs text-muted-foreground font-normal">
                    ({selectedBooking.packages.length})
                  </span>
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {selectedBooking.packages.map((pkg, index) => (
                  <div
                    key={index}
                    className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground mb-1">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground capitalize mb-2">
                          {pkg.category}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateRange(pkg.startDate, pkg.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  My Tasks
                  <span className="text-xs text-muted-foreground font-normal">
                    ({myAssignments.length})
                  </span>
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {myAssignments.map((assignment, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAssignment?.memberId === assignment.memberId &&
                      selectedAssignment?.category === assignment.category
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setAssignmentComments(assignment.comments || '');
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {assignmentCategories[assignment.category]}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned on {formatDate(assignment.assignedDate)}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.isCompleted
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}
                      >
                        {assignment.isCompleted ? 'Completed' : 'In Progress'}
                      </div>
                    </div>

                    {assignment.comments && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Comments</p>
                        <p className="text-sm">{assignment.comments}</p>
                      </div>
                    )}

                    {assignment.completedDate && (
                      <p className="text-xs text-muted-foreground">
                        Completed on {formatDate(assignment.completedDate)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Task Actions */}
            {selectedAssignment && (
              <div className="bg-card rounded-xl border border-border sticky top-6">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h4 className="font-semibold">Task Actions</h4>
                  <Button
                    variant="close"
                    size="icon"
                    className="mt-2"
                    onClick={() => setSelectedAssignment(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <Label className="text-sm mb-2">Comments</Label>
                    <Textarea
                      value={assignmentComments}
                      onChange={(e) => setAssignmentComments(e.target.value)}
                      placeholder="Add comments about your progress..."
                      className="mt-1"
                      rows={4}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUpdateComments}
                      disabled={updatingCommentLoading || updateCommentSuccess}
                      className="mt-2 w-full"
                    >
                      {updatingCommentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Comments'
                      )}
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      onClick={() => handleToggleComplete(selectedAssignment)}
                      disabled={updatingCommentLoading || updateCommentSuccess}
                      className="w-full"
                    >
                      {updateCommentSuccess ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : selectedAssignment.isCompleted ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Mark as Incomplete
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedBooking.notes && (
              <div className="bg-card rounded-xl border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <h4 className="font-semibold text-sm">Additional Notes</h4>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">My Assignments</h1>
        <p className="text-muted-foreground">Events assigned to you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 hover:shadow-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Assignments</p>
          <p className="text-2xl font-bold text-foreground">{filteredBookings.length}</p>
        </div>
        <div className="bg-card rounded-xl p-5 hover:shadow-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {
              filteredBookings.filter((b) => {
                const myAssignments = getMyAssignments(b);
                return myAssignments.some((a) => !a.isCompleted);
              }).length
            }
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 hover:shadow-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {
              filteredBookings.filter((b) => {
                const myAssignments = getMyAssignments(b);
                return myAssignments.length > 0 && myAssignments.every((a) => a.isCompleted);
              }).length
            }
          </p>
        </div>
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

      <div className="bg-card rounded-xl overflow-hidden">
        {filteredBookings.length === 0 ? (
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    My Tasks
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBookings.map((booking) => {
                  const StatusIcon = statusConfig[booking.status].icon;
                  const isUpcoming = new Date(booking.startDate) >= new Date();
                  const myAssignments = getMyAssignments(booking);
                  const completedTasks = myAssignments.filter((a) => a.isCompleted).length;

                  return (
                    <tr
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-foreground">{booking.eventName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{booking.eventType}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{formatDate(booking.startDate)}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-sm font-medium ${
                            isUpcoming ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {getDaysUntil(booking.startDate)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {completedTasks}/{myAssignments.length} completed
                        </span>
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
