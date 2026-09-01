'use client';

import { CustomerShell } from '@/app/customer/customer-shell';
import { useAppState } from '@/lib/state';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUpcomingFulfillmentDates } from '@/lib/rules/mealPrep';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export default function MealPrepPreviewPage() {
  const router = useRouter();
  const { customerBookingDraft, customerOrderType } = useAppState();

  const isMealPrep = customerOrderType === 'meal_prep' && customerBookingDraft.orderType === 'meal_prep';

  if (!isMealPrep || !customerBookingDraft.eventDate) {
    router.push('/customer/inquiry');
    return null;
  }

  const fulfillmentDates = getUpcomingFulfillmentDates(
    customerBookingDraft.eventDate,
    customerBookingDraft.mealPrepFrequency || 'weekly',
    8
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <CustomerShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">
            Meal Prep Schedule Preview
          </h1>
          <p className="text-surface-muted-foreground mt-2">
            Here&apos;s your recurring fulfillment schedule. Confirm to continue with menu selection.
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Servings per cycle</p>
                  <p className="text-lg font-bold text-card-foreground">{customerBookingDraft.guestCount}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Fulfillment time</p>
                  <p className="text-lg font-bold text-card-foreground">{customerBookingDraft.eventTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {customerBookingDraft.fulfillmentMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                  </p>
                  <p className="text-lg font-bold text-card-foreground">
                    {customerBookingDraft.fulfillmentMethod === 'delivery' 
                      ? customerBookingDraft.venue 
                      : 'Kitchen'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="text-lg font-bold text-card-foreground">
                    {customerBookingDraft.mealPrepFrequency === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Fulfillment Schedule */}
            <div>
              <h2 className="text-lg font-bold text-card-foreground mb-4">Upcoming fulfillment dates</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fulfillmentDates.map((date) => (
                  <div key={date} className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm font-medium text-card-foreground">{formatDate(date)}</p>
                  </div>
                ))}
              </div>
            </div>

            {customerBookingDraft.specialRequests && (
              <>
                <hr className="border-border" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Special requests</p>
                  <p className="text-card-foreground">{customerBookingDraft.specialRequests}</p>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/customer/inquiry')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={() => router.push('/customer/browse')}
            className="flex-1"
          >
            Continue to menu selection
          </Button>
        </div>
      </div>
    </CustomerShell>
  );
}
