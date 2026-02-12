'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, Users, TrendingUp, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Attendance } from '@/app/types/attendance';
import { Button } from '@/app/src/components/ui/button';
import { useAuth } from '@/app/lib/firebase/auth-context';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function TeamAttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'mark' | 'punchIn' | 'punchOut' | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/attendance');
      const data = await res.json();

      if (data.attendance) {
        setAttendance(data.attendance);

        const todayAtt = data.attendance.find(
          (a: Attendance) => a.memberId === user?.id && a.date === today
        );

        setTodayRecord(todayAtt || null);
      }
    } catch (error) {
      toast.error('Failed to load attendance data');
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [today, user?.id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Create today's attendance record
  const handleMarkAttendance = async () => {
    setActionLoading('mark');
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: user?.id,
          memberName: user?.name,
          date: today,
          status: 'present',
        }),
      });

      if (!res.ok) {
        toast.error('Failed to mark attendance');
        return;
      }

      toast.success('Attendance marked for today');
      router.refresh();
      fetchAttendance();
    } catch (error) {
      toast.error('Error marking attendance');
      console.error('Error marking attendance:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Punch In Handler
  const handlePunchIn = async () => {
    if (!todayRecord) {
      toast.error('Please mark attendance first');
      return;
    }

    const time = new Date().toTimeString().slice(0, 5);

    setActionLoading('punchIn');
    try {
      const res = await fetch(`/api/admin/attendance/${todayRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn: time }),
      });

      if (!res.ok) {
        toast.error('Punch in failed');
        return;
      }

      toast.success(`✓ Punched In at ${time}`);
      router.refresh();
      fetchAttendance();
    } catch (error) {
      console.error('Error punching in:', error);
      toast.error('Error punching in');
    } finally {
      setActionLoading(null);
    }
  };

  // Punch Out Handler
  const handlePunchOut = async () => {
    if (!todayRecord?.checkIn) {
      toast.error('Please punch in first');
      return;
    }

    if (todayRecord.checkOut) {
      toast.error('Already punched out for today');
      return;
    }

    const time = new Date().toTimeString().slice(0, 5);

    setActionLoading('punchOut');
    try {
      const res = await fetch(`/api/admin/attendance/${todayRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkOut: time }),
      });

      if (!res.ok) {
        toast.error('Punch out failed');
        return;
      }

      toast.success(`✓ Punched Out at ${time}`);
      router.refresh();
      fetchAttendance();
    } catch (error) {
      toast.error('Error punching out');
      console.error('Error punching out:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter attendance by selected month/year
  const filteredAttendance = attendance.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getMonth() === selectedMonth &&
      recordDate.getFullYear() === selectedYear &&
      record.memberId === user?.id
    );
  });

  // Group by date
  const groupedByDate = filteredAttendance.reduce(
    (acc, record) => {
      const date = record.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    },
    {} as Record<string, Attendance[]>
  );

  // Calculate working hours
  const calculateHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return '—';

    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);

    const totalMinutes = outH * 60 + outM - (inH * 60 + inM);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  // Stats
  const totalDays = filteredAttendance.length;
  const presentDays = filteredAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Track your daily attendance and working hours
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              {new Date(today).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                <p className="text-3xl font-bold text-foreground">{totalDays}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Present Days</p>
                <p className="text-3xl font-bold text-foreground">{presentDays}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold text-foreground">{attendanceRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Today&#39;s Attendance
            </h2>
          </div>

          <div className="p-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-lg font-semibold text-foreground capitalize">
                  {todayRecord?.status || 'Not Marked'}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Check In</p>
                <p className="text-lg font-semibold text-foreground">
                  {todayRecord?.checkIn || '—'}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Check Out</p>
                <p className="text-lg font-semibold text-foreground">
                  {todayRecord?.checkOut || '—'}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Working Hours</p>
                <p className="text-lg font-semibold text-foreground">
                  {calculateHours(todayRecord?.checkIn, todayRecord?.checkOut)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!todayRecord ? (
                <Button
                  onClick={handleMarkAttendance}
                  disabled={actionLoading === 'mark'}
                  size="sm"
                >
                  {actionLoading === 'mark' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Attendance
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={handlePunchIn}
                    disabled={!!todayRecord?.checkIn || actionLoading === 'punchIn'}
                    size={'sm'}
                  >
                    {actionLoading === 'punchIn' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Punching In...
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Punch In
                      </>
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handlePunchOut}
                    disabled={
                      !todayRecord?.checkIn ||
                      !!todayRecord?.checkOut ||
                      actionLoading === 'punchOut'
                    }
                    size={'sm'}
                  >
                    {actionLoading === 'punchOut' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Punching Out...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Punch Out
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-card rounded-xl border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-4 bg-muted/50">
            <h2 className="text-xl font-bold text-foreground">Attendance History</h2>

            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin " />
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No attendance records for {months[selectedMonth]} {selectedYear}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground text-sm">Date</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">Day</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">
                      Check In
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">
                      Check Out
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">Hours</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(groupedByDate)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([date, records]) => {
                      const record = records[0];
                      const dateObj = new Date(date);
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                      return (
                        <tr key={date} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium text-foreground text-sm">
                            {new Date(date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                          <td className="p-4 text-foreground text-sm">{dayName}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : record.status === 'absent'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="p-4 text-foreground text-sm font-medium">
                            {record.checkIn || '—'}
                          </td>
                          <td className="p-4 text-foreground text-sm font-medium">
                            {record.checkOut || '—'}
                          </td>
                          <td className="p-4 text-foreground text-sm font-semibold">
                            {calculateHours(record.checkIn, record.checkOut)}
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {record.notes || '—'}
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
    </div>
  );
}
