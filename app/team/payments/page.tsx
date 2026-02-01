'use client';
import { BaseTeamPayment, PAYMENT_STATUS, PaymentType } from '@/app/types/payment';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Loader2, X, Download, Calendar, DollarSign, FileText, Eye } from 'lucide-react';
import { Input } from '@/app/src/components/ui/input';
import { Button } from '@/app/src/components/ui/button';
import { Label } from '@/app/src/components/ui/label';
import { useAuth } from '@/app/lib/firebase/auth-context';

interface Props {
  initialPayments: BaseTeamPayment[];
}

const PAYMENT_TYPES: { label: string; value: PaymentType }[] = [
  { label: 'Monthly Salary', value: 'monthly' },
  { label: 'Event Payment', value: 'event' },
  { label: 'Bonus', value: 'bonus' },
  { label: 'Advance', value: 'advance' },
];

export default function TeamPaymentsPage({ initialPayments }: Props) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<BaseTeamPayment[]>(initialPayments || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<BaseTeamPayment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payment');
      if (!res.ok) {
        toast.error('Failed to fetch payments');
        throw new Error('Failed to fetch payments');
      }
      const data = await res.json();
      const myPayments: BaseTeamPayment[] = data.payments.filter(
        (payment: BaseTeamPayment) => payment.teamMemberId === user?.id
      );
      setPayments(myPayments);
    } catch (error) {
      toast.error('Failed to fetch payments');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
    const matchesSearch =
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openViewModal = (payment: BaseTeamPayment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedPayment(null);
    setIsViewModalOpen(false);
  };

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Payment ID',
      'Type',
      'Amount',
      'Status',
      'Payment Date',
      'Notes',
      'Created At',
    ];

    const rows = filteredPayments.map((payment) => [
      payment.id,
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
    link.setAttribute('download', `my_payments_${new Date().toISOString().split('T')[0]}.csv`);
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

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const yearToDatePayments = filteredPayments.filter((p) => {
    const paymentDate = new Date(p.paymentDate);
    return (
      paymentDate.getFullYear() === currentYear &&
      paymentDate.getMonth() <= currentMonth &&
      p.status === 'completed'
    );
  });
  const yearToDateAmount = yearToDatePayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <>
      <div className="space-y-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">My Payments</h1>
            <p className="text-muted-foreground">View and track your payment history.</p>
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={filteredPayments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
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
                <p className="text-sm text-muted-foreground">Received</p>
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
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Earnings</p>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(yearToDateAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by type or notes..."
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Notes</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
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
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                          {PAYMENT_TYPES.find((t) => t.value === payment.type)?.label ||
                            payment.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground text-lg">
                          {formatPrice(payment.amount)}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.paymentDate)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : payment.status === 'failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {PAYMENT_STATUS.find((s) => s.value === payment.status)?.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {payment.notes || '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <Button variant="close" size="icon" onClick={() => openViewModal(payment)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Payment Modal */}
      {isViewModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elegant animate-scale-in">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Payment Details</h2>
              <Button variant="close" size="icon" onClick={closeViewModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Info */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Payment Amount</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
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
                  </span>
                </div>
                <p className="text-4xl font-bold text-primary">
                  {formatPrice(selectedPayment.amount)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Type</Label>
                  <p className="font-medium mt-1">
                    {PAYMENT_TYPES.find((t) => t.value === selectedPayment.type)?.label ||
                      selectedPayment.type}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPayment.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 bg-muted/30 p-3 rounded-lg">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Created At</Label>
                    <p className="text-sm mt-1">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Last Updated</Label>
                    <p className="text-sm mt-1">{formatDate(selectedPayment.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      selectedPayment.status === 'completed'
                        ? 'bg-green-500'
                        : selectedPayment.status === 'pending'
                          ? 'bg-yellow-500'
                          : selectedPayment.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-purple-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {selectedPayment.status === 'completed'
                        ? 'Payment Completed'
                        : selectedPayment.status === 'pending'
                          ? 'Payment Pending'
                          : selectedPayment.status === 'failed'
                            ? 'Payment Failed'
                            : 'Payment Refunded'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedPayment.status === 'completed'
                        ? 'This payment has been successfully processed and credited to your account.'
                        : selectedPayment.status === 'pending'
                          ? 'This payment is currently being processed. Please check back later.'
                          : selectedPayment.status === 'failed'
                            ? 'This payment has failed. Please contact admin for assistance.'
                            : 'This payment has been refunded to the original source.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
