'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import { Card } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function CalendarPage() {
  const { bookings } = useAppState();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6)); // July 2026

  const goToPreviousMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getBookingsForDate = (day: number) => {
    return bookings.filter((b) => {
      const bookingDate = new Date(b.eventDate);
      return (
        bookingDate.getDate() === day &&
        bookingDate.getMonth() === currentDate.getMonth() &&
        bookingDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">Calendar</h1>
          <p className="text-surface-muted-foreground mt-2">
            View all events scheduled for {monthName}
          </p>
        </div>

        <Card className="p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-heading text-2xl font-bold text-card-foreground">{monthName}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={goToPreviousMonth} aria-label="View previous month" className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={goToToday} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
                Today
              </button>
              <button type="button" onClick={goToNextMonth} aria-label="View next month" className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronRight className="size-5" />
              </button>
              <Calendar className="ml-2 size-6 text-primary" />
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayLabels.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const dayBookings = getBookingsForDate(day);

              return (
                <div
                  key={day}
                  className="aspect-square p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-sm font-medium text-card-foreground mb-1">
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <div
                        key={booking.id}
                        className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded truncate"
                      >
                        {booking.customerName}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-8">
          <h2 className="font-heading text-lg font-bold text-card-foreground mb-6">
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {bookings
              .filter((b) => new Date(b.eventDate) >= new Date())
              .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
              .slice(0, 5)
              .map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-card-foreground">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.eventType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block text-xs font-medium mt-1 px-2 py-1 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
