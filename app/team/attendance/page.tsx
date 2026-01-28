'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, Users, TrendingUp, Loader2 } from 'lucide-react';
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
    setLoading(true);
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
        alert('Failed to mark attendance');
        return;
      }

      toast.success('Attendance marked for today');
      router.refresh();
      fetchAttendance();
    } catch (error) {
      toast.error('Error marking attendance');
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Punch In Handler
  const handlePunchIn = async () => {
    if (!todayRecord) {
      toast.error('Please mark attendance first');
      return;
    }

    const time = new Date().toTimeString().slice(0, 5);

    setLoading(true);
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
      alert('Error punching in');
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

    setLoading(true);
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
      setLoading(false);
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
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Tracker</h1>
            <p className="text-muted-foreground">Track your daily attendance and working hours</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow">
            <Calendar className="w-5 h-5 text-foreground" />
            <span className="font-medium text-foreground">{today}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl shadow-lg p-6 border-t-4 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Days</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalDays}</p>
              </div>
              <Calendar className="w-12 h-12 text-foreground opacity-20" />
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border-t-4 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Present Days</p>
                <p className="text-3xl font-bold text-foreground mt-1">{presentDays}</p>
              </div>
              <Users className="w-12 h-12 text-foreground opacity-20" />
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border-t-4 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Attendance Rate</p>
                <p className="text-3xl font-bold text-foreground mt-1">{attendanceRate}%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-foreground opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-popover rounded-xl shadow-xl p-8 text-foreground">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Today&apos;s Attendance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card backdrop-blur rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Status</p>
              <p className="text-xl font-semibold">{todayRecord?.status || 'Not Marked'}</p>
            </div>

            <div className="bg-card backdrop-blur rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Check In</p>
              <p className="text-xl font-semibold">{todayRecord?.checkIn || '—'}</p>
            </div>

            <div className="bg-card backdrop-blur rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Check Out</p>
              <p className="text-xl font-semibold">{todayRecord?.checkOut || '—'}</p>
            </div>

            <div className="bg-card backdrop-blur rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Working Hours</p>
              <p className="text-xl font-semibold">
                {calculateHours(todayRecord?.checkIn, todayRecord?.checkOut)}
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {!todayRecord ? (
              <Button
                variant="royal"
                size="lg"
                onClick={handleMarkAttendance}
                className="w-1/4 bg-card text-muted-foreground px-6 py-3 border border-border rounded-lg font-semibold transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Marking Attendance...</span>
                  </div>
                ) : (
                  <span>Mark Attendance for Today</span>
                )}
              </Button>
            ) : (
              <div className="flex flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePunchIn}
                  disabled={!!todayRecord?.checkIn}
                  className="cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Punching...</span>
                    </div>
                  ) : (
                    <span>Punch In</span>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handlePunchOut}
                  disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                  className="cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Punching...</span>
                    </div>
                  ) : (
                    <span>Punch Out</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>

            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-border rounded-lg"
              >
                {months.map((month, index) => (
                  <option
                    key={index}
                    value={index}
                    className="border border-border rounded-lg bg-muted text-muted-foreground"
                  >
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-border rounded-lg"
              >
                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                    className="border border-border rounded-lg bg-muted text-muted-foreground"
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-foreground">Loading...</div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-12 text-foreground">
              No attendance records for {months[selectedMonth]} {selectedYear}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-card border-b-2 border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Date</th>
                    <th className="text-left p-4 font-semibold text-foreground">Day</th>
                    <th className="text-left p-4 font-semibold text-foreground">Status</th>
                    <th className="text-left p-4 font-semibold text-foreground">Check In</th>
                    <th className="text-left p-4 font-semibold text-foreground">Check Out</th>
                    <th className="text-left p-4 font-semibold text-foreground">Hours</th>
                    <th className="text-left p-4 font-semibold text-foreground">Notes</th>
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
                        <tr
                          key={date}
                          className="hover:bg-popover transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-medium text-foreground">{date}</td>
                          <td className="p-4 text-foreground">{dayName}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : record.status === 'absent'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="p-4 text-foreground">
                            {record.checkIn || <span className="text-foreground">—</span>}
                          </td>
                          <td className="p-4 text-foreground">
                            {record.checkOut || <span className="text-foreground">—</span>}
                          </td>
                          <td className="p-4 text-foreground font-medium">
                            {calculateHours(record.checkIn, record.checkOut)}
                          </td>
                          <td className="p-4 text-foreground text-sm">
                            {record.notes || <span className="text-foreground">—</span>}
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
