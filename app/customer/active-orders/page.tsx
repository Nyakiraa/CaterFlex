'use client';

import { CustomerShell } from '@/app/customer/customer-shell';
import { useAppState } from '@/lib/state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUpcomingFulfillmentDates } from '@/lib/rules/mealPrep';
import { Calendar, MapPin, Users, Clock, Pause, Play, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActiveOrdersPage() {
  const router = useRouter();
  const { bookings, updateBooking } = useAppState();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter for confirmed meal prep orders only
  const activeMealPrepOrders = bookings.filter(
    (b) => b.orderType === 'meal_prep' && b.status === 'confirmed'
  );

  const toggleOrderStatus = (bookingId: string, currentStatus: 'active' | 'paused') => {
    updateBooking(bookingId, {
      mealPrepStatus: currentStatus === 'active' ? 'paused' : 'active',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (activeMealPrepOrders.length === 0) {
    return (
      <CustomerShell>
        <div className="space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-surface-foreground">Active Orders</h1>
            <p className="text-surface-muted-foreground mt-2">Your recurring meal prep subscriptions</p>
          </div>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You don&apos;t have any active meal prep orders yet.</p>
            <Button onClick={() => router.push('/customer/inquiry')}>Start a meal prep plan</Button>
          </Card>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">Active Orders</h1>
          <p className="text-surface-muted-foreground mt-2">Your recurring meal prep subscriptions</p>
        </div>

        <div className="space-y-4">
          {activeMealPrepOrders.map((booking) => {
            const fulfillmentDates = getUpcomingFulfillmentDates(
              booking.eventDate,
              booking.mealPrepFrequency || 'weekly',
              4
            );
            const isActive = booking.mealPrepStatus === 'active';

            return (
              <Card key={booking.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div>
                      <p className="font-semibold text-card-foreground">{booking.eventType}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.guestCount} servings • {booking.mealPrepFrequency === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm text-muted-foreground">Next fulfillment</p>
                      <p className="font-medium text-card-foreground">{formatDate(fulfillmentDates[0])}</p>
                    </div>
                  </div>
                </button>

                {expandedId === booking.id && (
                  <div className="border-t border-border p-6 bg-muted/20">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Servings per cycle</p>
                          <p className="font-medium text-card-foreground">{booking.guestCount}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fulfillment time</p>
                          <p className="font-medium text-card-foreground">{booking.eventTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {booking.fulfillmentMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                          </p>
                          <p className="font-medium text-card-foreground">
                            {booking.fulfillmentMethod === 'delivery' ? booking.venue : 'Kitchen'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Frequency</p>
                          <p className="font-medium text-card-foreground">
                            {booking.mealPrepFrequency === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-border mb-6" />

                    <div className="mb-6">
                      <h3 className="font-semibold text-card-foreground mb-3">Upcoming fulfillments</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {fulfillmentDates.map((date) => (
                          <div key={date} className="p-2 bg-primary/5 rounded text-center text-sm text-card-foreground">
                            {formatDate(date)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => toggleOrderStatus(booking.id, booking.mealPrepStatus || 'active')}
                      >
                        {isActive ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause Order
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Resume Order
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Edit2 className="w-4 h-4" />
                        Modify
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </CustomerShell>
  );
}
