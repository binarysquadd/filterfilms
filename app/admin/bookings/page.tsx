'use client';
import { useState, useEffect } from 'react';
import { Search, X, Eye, Loader2, Edit2, Trash2, Calendar, Box, Plus } from 'lucide-react';
import { Input } from '@/app/src/components/ui/input';
import { Button } from '@/app/src/components/ui/button';
import { Booking, AssignmentCategory } from '@/app/types/booking';
import toast from 'react-hot-toast';
import { Label } from '@/app/src/components/ui/label';
import { Textarea } from '@/app/src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/src/components/ui/select';
import DeleteModal from '@/app/src/components/common/modal/delete-modal';

interface TeamMember {
  id: string;
  name: string;
}

const bookingStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const assignmentCategories = [
  { value: 'photo_edit', label: 'Photo Edit' },
  { value: 'video_edit_traditional', label: 'Video Edit Traditional' },
  { value: 'video_edit_cinematic', label: 'Video Edit Cinematic' },
];

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [removeAssignmentLoading, setRemoveAssignmentLoading] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    memberId: '',
    category: 'photo_edit' as AssignmentCategory,
    comments: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await fetch('/api/admin/booking');
      const bookingsData = await bookingsRes.json();

      const teamRes = await fetch('/api/admin/team');
      const teamData = await teamRes.json();

      if (bookingsRes.ok) {
        setBookings(bookingsData.bookings || []);
      }
      if (teamRes.ok) {
        setTeam(teamData.team || []);
      }
    } catch {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    setStatusLoadingId(id);
    try {
      const response = await fetch(`/api/admin/booking/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        setBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
        toast.success('Status updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedBooking) return;

    for (const pkg of editedBooking.packages) {
      if (new Date(pkg.startDate) > new Date(pkg.endDate)) {
        toast.error(`Invalid dates for ${pkg.name}: start date must be before end date`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/booking/${editedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packages: editedBooking.packages,
          eventName: editedBooking.eventName,
          eventType: editedBooking.eventType,
          startDate: editedBooking.startDate,
          endDate: editedBooking.endDate,
          venue: editedBooking.venue,
          totalAmount: editedBooking.totalAmount,
          paidAmount: editedBooking.paidAmount,
          notes: editedBooking.notes,
          status: editedBooking.status,
          assignments: editedBooking.assignments,
        }),
      });

      if (response.ok) {
        const { booking: updatedBooking } = await response.json();
        setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
        setSelectedBooking(updatedBooking);
        setIsEditMode(false);
        toast.success('Booking updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update booking');
      }
    } catch {
      toast.error('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!selectedBooking || !newAssignment.memberId) {
      toast.error('Please select a team member');
      return;
    }

    const assignmentExists = selectedBooking.assignments.some(
      (a) => a.memberId === newAssignment.memberId && a.category === newAssignment.category
    );

    if (assignmentExists) {
      toast.error('This team member is already assigned to this category');
      return;
    }

    setAddingAssignment(true);

    const updatedAssignments = [
      ...selectedBooking.assignments,
      {
        memberId: newAssignment.memberId,
        category: newAssignment.category,
        assignedDate: new Date().toISOString(),
        isCompleted: false,
        comments: newAssignment.comments,
      },
    ];

    try {
      const response = await fetch(`/api/admin/booking/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: updatedAssignments }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to add assignment');
        return;
      }

      const { booking } = await response.json();

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
      setSelectedBooking(booking);
      setShowAssignmentModal(false);
      setNewAssignment({ memberId: '', category: 'photo_edit', comments: '' });

      toast.success('Assignment added successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add assignment');
    } finally {
      setAddingAssignment(false);
    }
  };

  const handleRemoveAssignment = async (memberId: string, category: AssignmentCategory) => {
    if (!selectedBooking) return;

    const updatedAssignments = selectedBooking.assignments.filter(
      (a) => !(a.memberId === memberId && a.category === category)
    );
    setRemoveAssignmentLoading(true);
    try {
      const response = await fetch(`/api/admin/booking/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: updatedAssignments }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
        setSelectedBooking(booking);
        toast.success('Assignment removed successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove assignment');
      }
    } catch {
      toast.error('Failed to remove assignment');
    } finally {
      setRemoveAssignmentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBookingId) return;

    setDeleting(true);
    const bookingId = deleteBookingId;

    try {
      const response = await fetch(`/api/admin/booking/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setSelectedBooking(null);
        toast.success('Booking deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete booking');
      }
    } catch {
      toast.error('Failed to delete booking');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const openEditMode = (booking: Booking) => {
    setEditedBooking({ ...booking });
    setIsEditMode(true);
  };

  const openDeleteModal = (bookingId: string) => {
    setDeleteBookingId(bookingId);
    setDeleteOpen(true);
  };

  const cancelEdit = () => {
    setEditedBooking(null);
    setIsEditMode(false);
  };

  const getTeamMemberName = (memberId: string) => {
    return team.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  return (
    <>
      <div className="space-y-0 flex flex-col gap-6">
        <div className="flex item-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Bookings</h1>
            <p className="text-muted-foreground">View and manage all booking requests.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Status</option>
            {bookingStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Event</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Date Range
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Packages
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Assigned
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="h-72 text-center align-middle">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="h-72 text-center align-middle text-sm text-muted-foreground"
                    >
                      <Box className="w-16 h-16 mx-auto mb-2" />
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const assignedCount = booking.assignments.length;
                    return (
                      <tr key={booking.id} className="hover:bg-muted/30 cursor-pointer">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{booking.eventName}</p>
                          <p className="text-sm text-muted-foreground">{booking.venue}</p>
                        </td>
                        <td className="p-4 text-sm text-foreground">
                          {formatDateRange(booking.startDate, booking.endDate)}
                        </td>
                        <td className="p-4 text-sm text-foreground">
                          {booking.packages.length} package
                          {booking.packages.length !== 1 ? 's' : ''}
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium text-foreground">
                            {formatPrice(booking.totalAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Paid: {formatPrice(booking.paidAmount)}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${booking.progress.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {booking.progress.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking.id, e.target.value as Booking['status'])
                            }
                            className={`text-xs px-2 py-1 rounded-full border-0 ${
                              booking.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : booking.status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : booking.status === 'completed'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-red-100 text-red-700'
                            } ${statusLoadingId === booking.id ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {bookingStatuses.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          {statusLoadingId === booking.id && (
                            <Loader2 className="w-4 h-4 inline-block ml-2 animate-spin text-muted-foreground" />
                          )}
                        </td>
                        <td className="p-4">
                          {assignedCount > 0 ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              {assignedCount} task{assignedCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="close"
                            size="icon"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
            <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-elegant animate-scale-in">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">
                  {isEditMode ? 'Edit Booking' : 'Booking Details'}
                </h2>
                <div className="flex items-center gap-2">
                  {!isEditMode && (
                    <>
                      <Button
                        variant="close"
                        size="icon"
                        onClick={() => openEditMode(selectedBooking)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="close"
                        size="icon"
                        onClick={() => openDeleteModal(selectedBooking.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="close"
                    size="icon"
                    onClick={() => {
                      setSelectedBooking(null);
                      setIsEditMode(false);
                      setEditedBooking(null);
                    }}
                  >
                    <X className="w-5 h-5 " />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {isEditMode && editedBooking ? (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground">Event Name</Label>
                      <Input
                        value={editedBooking.eventName}
                        onChange={(e) =>
                          setEditedBooking({ ...editedBooking, eventName: e.target.value })
                        }
                        className="mt-1"
                        showWordCount
                        wordLimit={50}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Event Type</Label>
                        <Input
                          value={editedBooking.eventType}
                          onChange={(e) =>
                            setEditedBooking({ ...editedBooking, eventType: e.target.value })
                          }
                          className="mt-1"
                          showWordCount
                          wordLimit={20}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Venue</Label>
                        <Input
                          value={editedBooking.venue}
                          onChange={(e) =>
                            setEditedBooking({ ...editedBooking, venue: e.target.value })
                          }
                          className="mt-1"
                          showWordCount
                          wordLimit={20}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Overall Start Date</Label>
                        <Input
                          type="date"
                          value={editedBooking.startDate}
                          onChange={(e) =>
                            setEditedBooking({ ...editedBooking, startDate: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Overall End Date</Label>
                        <Input
                          type="date"
                          value={editedBooking.endDate}
                          onChange={(e) =>
                            setEditedBooking({ ...editedBooking, endDate: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Total Amount</Label>
                        <Input
                          type="number"
                          value={editedBooking.totalAmount}
                          onChange={(e) =>
                            setEditedBooking({
                              ...editedBooking,
                              totalAmount: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Paid Amount</Label>
                        <Input
                          type="number"
                          value={editedBooking.paidAmount}
                          onChange={(e) =>
                            setEditedBooking({
                              ...editedBooking,
                              paidAmount: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Status</Label>
                      <Select
                        required
                        value={editedBooking.status}
                        onValueChange={(value) =>
                          setEditedBooking({ ...editedBooking, status: value as Booking['status'] })
                        }
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {bookingStatuses.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Notes</Label>
                      <Textarea
                        showWordCount
                        wordLimit={50}
                        value={editedBooking.notes || ''}
                        onChange={(e) =>
                          setEditedBooking({ ...editedBooking, notes: e.target.value })
                        }
                        className="w-full mt-1 min-h-[80px] px-3 py-2"
                      />
                    </div>
                    <div className="flex gap-2 pt-4 justify-end">
                      <Button size="sm" variant="cancel" onClick={cancelEdit} disabled={loading}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={loading}
                        className="min-w-[140px] flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground">Event</Label>
                      <p className="font-medium">{selectedBooking.eventName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Date Range</Label>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDateRange(selectedBooking.startDate, selectedBooking.endDate)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Type</Label>
                        <p className="font-medium">{selectedBooking.eventType}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Venue</Label>
                      <p className="font-medium">{selectedBooking.venue}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">Packages</Label>
                      <div className="space-y-2">
                        {selectedBooking.packages.map((pkg, index) => (
                          <div key={index} className="bg-muted/30 rounded-lg p-3">
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {pkg.category}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDateRange(pkg.startDate, pkg.endDate)}
                            </p>
                            <p className="text-sm font-medium text-primary mt-1">
                              {formatPrice(pkg.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Total Amount</Label>
                        <p className="font-medium text-primary">
                          {formatPrice(selectedBooking.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Paid Amount</Label>
                        <p className="font-medium text-green-600">
                          {formatPrice(selectedBooking.paidAmount)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Progress</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex w-1/4 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${selectedBooking.progress.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {selectedBooking.progress.completedTasks}/
                          {selectedBooking.progress.totalTasks} (
                          {selectedBooking.progress.percentage}
                          %)
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <p
                        className={`inline-block mt-1 text-xs px-3 py-1 rounded-full ${
                          selectedBooking.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : selectedBooking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : selectedBooking.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-700'
                                : selectedBooking.status === 'completed'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {bookingStatuses.find((s) => s.value === selectedBooking.status)?.label}
                      </p>
                    </div>
                    {selectedBooking.notes && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Notes</Label>
                        <p className="text-sm">{selectedBooking.notes}</p>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-muted-foreground">Assignments</Label>
                        <Button
                          size="sm"
                          onClick={() => setShowAssignmentModal(true)}
                          className="min-w-[140px]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Assignment
                        </Button>
                      </div>
                      {selectedBooking.assignments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No assignments yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedBooking.assignments.map((assignment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                            >
                              <div>
                                <p className="font-medium">
                                  {getTeamMemberName(assignment.memberId)}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {assignment.category.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Assigned on:{' '}
                                  {formatDate(new Date(assignment.assignedDate).toISOString())}
                                </p>
                                {assignment.comments && (
                                  <p className="text-sm mt-1">Comments: {assignment.comments}</p>
                                )}
                              </div>
                              <div>
                                <Button
                                  variant="close"
                                  size="icon"
                                  onClick={() =>
                                    handleRemoveAssignment(assignment.memberId, assignment.category)
                                  }
                                  disabled={removeAssignmentLoading}
                                >
                                  {removeAssignmentLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {showAssignmentModal && selectedBooking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/50">
            <div className="bg-card rounded-2xl w-full max-w-md shadow-elegant animate-scale-in">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold">Add Team Assignment</h3>
                <Button
                  variant="close"
                  size="icon"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setNewAssignment({ memberId: '', category: 'photo_edit', comments: '' });
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-sm">Team Member</Label>
                  <Select
                    value={newAssignment.memberId}
                    onValueChange={(value) =>
                      setNewAssignment({ ...newAssignment, memberId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {team.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Category</Label>
                  <Select
                    value={newAssignment.category}
                    onValueChange={(value) =>
                      setNewAssignment({ ...newAssignment, category: value as AssignmentCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignmentCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Comments (Optional)</Label>
                  <Textarea
                    value={newAssignment.comments}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, comments: e.target.value })
                    }
                    placeholder="Any special instructions..."
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-row justify-center items-end gap-2 pt-4">
                  <Button
                    variant="cancel"
                    size="sm"
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setNewAssignment({ memberId: '', category: 'photo_edit', comments: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAssignment}
                    disabled={addingAssignment}
                    variant={'default'}
                    size={'sm'}
                  >
                    {addingAssignment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Assignment'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <DeleteModal
        open={deleteOpen}
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
      />
    </>
  );
}
