'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Trash2,
  UserCheck,
  UserX,
  AlertCircle,
  Loader2,
  Download,
  Filter,
  Loader,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { Attendance } from '@/app/types/attendance';
import { User } from '@/app/types/user';
import DeleteModal from '@/app/src/components/common/modal/delete-modal';

type RawTeamMember = {
  id: string;
  name: string;
  role?: string;
  image?: string;
  email?: string;
};

const AdminAttendancePage = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance');

      const data = await response.json();
      setAttendance(data.attendance || []);
      setError(null);
    } catch {
      setError('Failed to load attendance records');
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/team');
      if (!response.ok) throw new Error('Failed to fetch team members');

      const data = await response.json();
      const members = data.members || data.team || [];

      const mappedMembers = (members as RawTeamMember[]).map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        photo: member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`,
        email: member.email,
      }));

      setTeamMembers(mappedMembers);
    } catch (_err) {
      toast.error('Error loading team members');
      console.error('❌ Error loading team members:', _err);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleMarkAttendance = async (
    memberId: string,
    status: 'present' | 'absent' | 'half-day' | 'leave'
  ) => {
    try {
      setSaving(true);
      const existing = attendance.find((a) => a.memberId === memberId && a.date === selectedDate);
      const member = teamMembers.find((m) => m.id === memberId);

      if (existing) {
        // Update existing record
        const response = await fetch(`/api/admin/attendance/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            checkIn:
              status === 'present' || status === 'half-day'
                ? existing.checkIn || '09:00'
                : undefined,
            checkOut:
              status === 'present'
                ? existing.checkOut || '18:00'
                : status === 'half-day'
                  ? '13:00'
                  : undefined,
          }),
        });

        if (!response.ok) {
          toast.error('Failed to update attendance');
          throw new Error('Failed to update attendance');
        }
        toast.success('Attendance updated');
        await fetchAttendance();
      } else {
        // Create new record
        const response = await fetch('/api/admin/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId,
            memberName: member?.name || 'Unknown',
            date: selectedDate,
            status,
            checkIn: status === 'present' || status === 'half-day' ? '09:00' : undefined,
            checkOut: status === 'present' ? '18:00' : status === 'half-day' ? '13:00' : undefined,
          }),
        });

        if (!response.ok) {
          toast.error('Failed to create attendance');
          throw new Error('Failed to create attendance');
        }
        await fetchAttendance();
      }

      toast.success('Attendance marked');
    } catch (err) {
      toast.error('Failed to mark attendance');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTime = async (id: string, field: 'checkIn' | 'checkOut', value: string) => {
    try {
      const response = await fetch(`/api/admin/attendance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error('Failed to update time');
      toast.success('Time updated');
      await fetchAttendance();
    } catch (err) {
      toast.error('Failed to update time');
      console.error(err);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/attendance/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete attendance');
      await fetchAttendance();
      toast.success('Attendance deleted');
    } catch (err) {
      toast.error('Failed to delete attendance');
      console.error('❌ Error deleting attendance:', err);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const getAttendanceForDate = () => {
    let filtered = attendance.filter((a) => a.date === selectedDate);
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }
    return filtered;
  };

  const getStats = () => {
    const dateAttendance = attendance.filter((a) => a.date === selectedDate);
    return {
      present: dateAttendance.filter((a) => a.status === 'present').length,
      absent: dateAttendance.filter((a) => a.status === 'absent').length,
      halfDay: dateAttendance.filter((a) => a.status === 'half-day').length,
      leave: dateAttendance.filter((a) => a.status === 'leave').length,
    };
  };

  const filteredMembers = teamMembers.filter(
    (m) =>
      (m?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m?.role ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getStats();

  const exportToCSV = () => {
    const dateAttendance = getAttendanceForDate();
    const csv = [
      ['Name', 'Role', 'Status', 'Check In', 'Check Out', 'Date'],
      ...dateAttendance.map((a) => {
        const member = teamMembers.find((m) => m.id === a.memberId);
        return [
          a.memberName || 'Unknown',
          member?.role || 'N/A',
          a.status,
          a.checkIn || 'N/A',
          a.checkOut || 'N/A',
          a.date,
        ];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-popover-foreground bg-clip-text text-transparent mb-2">
                  Team Attendance
                </h1>
                <p className="text-muted-foreground">
                  Track and manage team member attendance records
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Error</p>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card text-muted-foreground rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.present}</span>
              </div>
              <p className="text-muted-foreground font-medium">Present Today</p>
            </div>

            <div className="bg-card text-muted-foreground rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <UserX className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.absent}</span>
              </div>
              <p className="text-muted-foreground font-medium">Absent Today</p>
            </div>

            <div className="bg-card text-muted-foreground rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.halfDay}</span>
              </div>
              <p className="text-muted-foreground font-medium">Half Day</p>
            </div>

            <div className="bg-card text-muted-foreground rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.leave}</span>
              </div>
              <p className="text-muted-foreground font-medium">On Leave</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card text-muted-foreground rounded-2xl shadow-sm border border-border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl transition-all outline-none bg-card text-muted-foreground"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-border rounded-xl transition-all outline-none bg-card text-muted-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-3 border border-border rounded-xl transition-all outline-none bg-card text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-muted-foreground">
                      Team Member
                    </th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Role</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Check In</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Check Out</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No team members found
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const record = attendance.find(
                        (a) => a.memberId === member.id && a.date === selectedDate
                      );
                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-popover transition-colors cursor-pointer"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {member.image ? (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                  <Image
                                    src={
                                      member.image ||
                                      'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
                                        member.name
                                    }
                                    alt={member.name || 'Member'}
                                    width={90}
                                    height={90}
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                                  {member?.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-slate-800">{member.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{member.role}</td>
                          <td className="p-4">
                            {record ? (
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  record.status === 'present'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : record.status === 'absent'
                                      ? 'bg-rose-100 text-rose-700'
                                      : record.status === 'half-day'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                <CheckCircle className="w-3 h-3" />
                                {record.status.replace('-', ' ').toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">Not marked</span>
                            )}
                          </td>
                          <td className="p-4">
                            {record?.checkIn ? (
                              <input
                                type="time"
                                value={record.checkIn}
                                onChange={(e) =>
                                  handleUpdateTime(record.id, 'checkIn', e.target.value)
                                }
                                className="px-3 py-1.5 border border-border rounded-lg text-sm outline-none bg-card text-muted-foreground"
                              />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            {record?.checkOut ? (
                              <input
                                type="time"
                                value={record.checkOut}
                                onChange={(e) =>
                                  handleUpdateTime(record.id, 'checkOut', e.target.value)
                                }
                                className="px-3 py-1.5 border border-border rounded-lg text-sm outline-none bg-card text-muted-foreground"
                              />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleMarkAttendance(member.id, 'present')}
                                disabled={saving}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  record?.status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700'
                                }`}
                                title="Present"
                              >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'P'}
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(member.id, 'absent')}
                                disabled={saving}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  record?.status === 'absent'
                                    ? 'bg-rose-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-700'
                                }`}
                                title="Absent"
                              >
                                A
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(member.id, 'half-day')}
                                disabled={saving}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  record?.status === 'half-day'
                                    ? 'bg-amber-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-700'
                                }`}
                                title="Half Day"
                              >
                                H
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(member.id, 'leave')}
                                disabled={saving}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  record?.status === 'leave'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                                }`}
                                title="Leave"
                              >
                                L
                              </button>
                              {record && (
                                <button
                                  onClick={() => openDeleteModal(record.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              Status Legend
            </h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 shadow-sm"></span>
                <span className="text-slate-700 font-medium">P = Present</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 shadow-sm"></span>
                <span className="text-slate-700 font-medium">A = Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 shadow-sm"></span>
                <span className="text-slate-700 font-medium">H = Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 shadow-sm"></span>
                <span className="text-slate-700 font-medium">L = Leave</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteModal
        open={deleteOpen}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance record? This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
};

export default AdminAttendancePage;
