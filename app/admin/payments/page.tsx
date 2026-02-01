'use client';
import { BaseTeamPayment, PAYMENT_STATUS, PaymentType } from '@/app/types/payment';
import { TeamMember } from '@/app/types/team';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  X,
  Download,
  Calendar,
  DollarSign,
  User,
  FileText,
} from 'lucide-react';
import { Input } from '@/app/src/components/ui/input';
import { Button } from '@/app/src/components/ui/button';
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

interface Props {
  initialPayment: BaseTeamPayment[];
  inititalTeamMembers: TeamMember[];
}

const PAYMENT_TYPES: { label: string; value: PaymentType }[] = [
  { label: 'Monthly Salary', value: 'monthly' },
  { label: 'Event Payment', value: 'event' },
  { label: 'Bonus', value: 'bonus' },
  { label: 'Advance', value: 'advance' },
];

export default function PaymentsAdminPage({ initialPayment, inititalTeamMembers }: Props) {
  const router = useRouter();
  const [payments, setPayments] = useState<BaseTeamPayment[]>(initialPayment || []);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(inititalTeamMembers || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<BaseTeamPayment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchingPayments, setIsFetchingPayments] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isViewMode, setIsViewMode] = useState(false);

  const [formData, setFormData] = useState({
    teamMemberId: '',
    amount: '',
    status: 'pending' as BaseTeamPayment['status'],
    type: 'monthly' as PaymentType,
    paymentDate: '',
    notes: '',
  });

  const fetchPayments = useCallback(async () => {
    setIsFetchingPayments(true);
    try {
      const res = await fetch('/api/admin/payment');
      if (!res.ok) {
        toast.error('Failed to fetch payments');
        throw new Error('Failed to fetch payments');
      }
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (error) {
      toast.error('Failed to fetch payments');
      console.error('Error fetching payments:', error);
    } finally {
      setIsFetchingPayments(false);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/team');
      if (!res.ok) {
        toast.error('Failed to fetch team members');
        throw new Error('Failed to fetch team members');
      }
      const data = await res.json();
      setTeamMembers(data.team || []);
    } catch (error) {
      toast.error('Failed to fetch team members');
      console.error('Error fetching team members:', error);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchTeamMembers();
  }, [fetchPayments, fetchTeamMembers]);

  const openCreateModal = () => {
    setSelectedPayment(null);
    setIsEditMode(false);
    setIsViewMode(false);
    setFormData({
      teamMemberId: '',
      amount: '',
      status: 'pending',
      type: 'monthly',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (payment: BaseTeamPayment) => {
    setSelectedPayment(payment);
    setIsEditMode(true);
    setIsViewMode(false);
    setFormData({
      teamMemberId: payment.teamMemberId,
      amount: payment.amount.toString(),
      status: payment.status,
      type: payment.type,
      paymentDate: payment.paymentDate,
      notes: payment.notes || '',
    });
    setIsModalOpen(true);
  };

  const openViewModal = (payment: BaseTeamPayment) => {
    setSelectedPayment(payment);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setIsEditMode(false);
    setIsViewMode(false);
    setFormData({
      teamMemberId: '',
      amount: '',
      status: 'pending',
      type: 'monthly',
      paymentDate: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teamMemberId || !formData.amount || !formData.paymentDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const url = isEditMode ? `/api/admin/payment/${selectedPayment?.id}` : '/api/admin/payment';
      const method = isEditMode ? 'PATCH' : 'POST';

      const payload = {
        teamMemberId: formData.teamMemberId,
        amount: parseFloat(formData.amount),
        status: formData.status,
        type: formData.type,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Operation failed');
        throw new Error('Operation failed');
      }

      toast.success(isEditMode ? 'Payment updated successfully' : 'Payment created successfully');
      closeModal();
      fetchPayments();
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePaymentId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/payment/${deletePaymentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        toast.error('Failed to delete payment');
        throw new Error('Failed to delete payment');
      }

      toast.success('Payment deleted successfully');
      setDeleteOpen(false);
      setDeletePaymentId(null);
      fetchPayments();
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete payment');
      console.error('Error deleting payment:', error);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (paymentId: string) => {
    setDeletePaymentId(paymentId);
    setDeleteOpen(true);
  };

  const handleStatusChange = async (id: string, status: BaseTeamPayment['status']) => {
    try {
      const response = await fetch(`/api/admin/payment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchPayments();
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getTeamMemberName = (memberId: string) => {
    return teamMembers.find((m) => m.id === memberId)?.name || 'Unknown';
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

  const filteredPayments = payments.filter((payment) => {
    const teamMemberName = getTeamMemberName(payment.teamMemberId).toLowerCase();
    const matchesSearch =
      teamMemberName.includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Payment ID',
      'Team Member',
      'Type',
      'Amount',
      'Status',
      'Payment Date',
      'Notes',
      'Created At',
    ];

    const rows = filteredPayments.map((payment) => [
      payment.id,
      getTeamMemberName(payment.teamMemberId),
      PAYMENT_TYPES.find((t) => t.value === payment.type)?.label || payment.type,
      payment.amount,
      payment.status,
      payment.paymentDate,
      payment.notes || '',
      formatDate(payment.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported successfully');
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedAmount = filteredPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <>
      <div className="space-y-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Payments</h1>
            <p className="text-muted-foreground">Track and manage team member payments.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredPayments.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(completedAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{formatPrice(pendingAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by team member or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Types</option>
            {PAYMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Status</option>
            {PAYMENT_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Team Member
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Payment Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isFetchingPayments ? (
                  <tr>
                    <td colSpan={6} className="h-72 text-center align-middle">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-72 text-center align-middle text-sm text-muted-foreground"
                    >
                      <FileText className="w-16 h-16 mx-auto mb-2 text-muted-foreground/50" />
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {getTeamMemberName(payment.teamMemberId)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {teamMembers.find((m) => m.id === payment.teamMemberId)?.role ||
                                'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                          {PAYMENT_TYPES.find((t) => t.value === payment.type)?.label ||
                            payment.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{formatPrice(payment.amount)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.paymentDate)}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={payment.status}
                          onChange={(e) =>
                            handleStatusChange(
                              payment.id,
                              e.target.value as BaseTeamPayment['status']
                            )
                          }
                          className={`text-xs px-2 py-1 rounded-full border-0 ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : payment.status === 'failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {PAYMENT_STATUS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="close"
                            size="icon"
                            onClick={() => openViewModal(payment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="close"
                            size="icon"
                            onClick={() => openEditModal(payment)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="close"
                            size="icon"
                            onClick={() => openDeleteModal(payment.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal (Create/Edit/View) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elegant animate-scale-in">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">
                {isViewMode ? 'Payment Details' : isEditMode ? 'Edit Payment' : 'Create Payment'}
              </h2>
              <Button variant="close" size="icon" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isViewMode && selectedPayment ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Team Member</Label>
                    <p className="font-medium">{getTeamMemberName(selectedPayment.teamMemberId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Type</Label>
                    <p className="font-medium capitalize">
                      {PAYMENT_TYPES.find((t) => t.value === selectedPayment.type)?.label ||
                        selectedPayment.type}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Amount</Label>
                    <p className="font-medium text-primary text-xl">
                      {formatPrice(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Payment Date</Label>
                    <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p
                    className={`inline-block mt-1 text-xs px-3 py-1 rounded-full ${
                      selectedPayment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : selectedPayment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : selectedPayment.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {PAYMENT_STATUS.find((s) => s.value === selectedPayment.status)?.label}
                  </p>
                </div>
                {selectedPayment.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="text-sm">{selectedPayment.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <Label className="text-sm text-muted-foreground">Created At</Label>
                    <p className="text-sm">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Updated At</Label>
                    <p className="text-sm">{formatDate(selectedPayment.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => openEditModal(selectedPayment)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Payment
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <Label className="text-sm">
                    Team Member <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={formData.teamMemberId}
                    onValueChange={(value) => setFormData({ ...formData, teamMemberId: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">
                      Payment Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value as PaymentType })
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">
                      Amount (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter amount"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">
                      Payment Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-sm">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as BaseTeamPayment['status'] })
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Notes</Label>
                  <Textarea
                    showWordCount
                    wordLimit={200}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes..."
                    className="w-full mt-1 min-h-[100px]"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2 pt-4 justify-end">
                  <Button type="button" variant="cancel" onClick={closeModal} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="min-w-[140px]">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : isEditMode ? (
                      'Update Payment'
                    ) : (
                      'Create Payment'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={deleteOpen}
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Payment"
        description="Are you sure you want to delete this payment record? This action cannot be undone."
      />
    </>
  );
}
