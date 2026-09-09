'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default function PrepSchedulePage() {
  const { bookings, menuItems } = useAppState();

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const mealPrepBookings = confirmedBookings.filter((b) => b.orderType === 'meal_prep');

  const prepItems = confirmedBookings.flatMap((booking) =>
    booking.selectedMenuItemIds.map((itemId) => {
      const item = menuItems.find((m) => m.id === itemId);
      const eventDate = new Date(booking.eventDate);
      const prepStartDate = new Date(eventDate);
      prepStartDate.setDate(prepStartDate.getDate() - (item?.prepTimeDays || 0));

      return {
        itemId,
        itemName: item?.name || '',
        eventDate,
        prepStartDate,
        prepDays: item?.prepTimeDays || 0,
        customerName: booking.customerName,
        orderType: booking.orderType,
      };
    })
  );

  const today = new Date();
  const upcomingPrep = prepItems.filter((p) => p.prepStartDate >= today);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">Prep Schedule</h1>
          <p className="text-surface-muted-foreground mt-2">
            Upcoming items to prepare for confirmed bookings and meal-prep orders ({mealPrepBookings.length} recurring)
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-card-foreground">
              Upcoming Preparations
            </h2>
          </div>

          {upcomingPrep.length > 0 ? (
            <div className="space-y-4">
              {upcomingPrep
                .sort(
                  (a, b) =>
                    a.prepStartDate.getTime() - b.prepStartDate.getTime()
                )
                .map((item, index) => {
                  const daysUntilPrep = Math.ceil(
                    (item.prepStartDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysUntilPrep <= 2;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isUrgent
                          ? 'border-red-300 bg-red-50'
                          : 'border-border bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-card-foreground">
                            {item.itemName}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            For {item.customerName} · {item.orderType === 'meal_prep' ? 'Meal prep' : 'Catering event'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              isUrgent
                                ? 'text-red-700'
                                : 'text-muted-foreground'
                            }`}
                          >
                            Start: {item.prepStartDate.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Event: {item.eventDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {isUrgent && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="text-xs font-semibold text-red-700">
                            ⚠️ Prep starts soon!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No upcoming preparations scheduled
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
