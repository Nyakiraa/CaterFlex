'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function BrowsePage() {
  const router = useRouter();
  const {
    menuItems,
    selectedMenuItemIds,
    customerDietaryRestrictions,
    selectMenuItem,
    deselectMenuItem,
    customerBookingDraft,
    createBooking,
    clearCustomerSession,
  } = useAppState();


  const handleSubmit = () => {
    if (selectedMenuItemIds.length === 0) {
      alert('Please select at least one menu item');
      return;
    }

    const guestCount = parseInt(String(customerBookingDraft.guestCount) || '1', 10);
    const totalCost = selectedMenuItemIds.reduce((sum, itemId) => {
      const item = menuItems.find((m) => m.id === itemId);
      return sum + (item?.price || 0) * guestCount;
    }, 0);

    const newBooking = {
      id: `booking-${Date.now()}`,
      customerId: 'customer-temp',
      customerName: 'Customer',
      customerEmail: 'customer@example.com',
      eventDate: String(customerBookingDraft.eventDate ?? ''),
      eventTime: String(customerBookingDraft.eventTime ?? '12:00'),
      eventType: String(customerBookingDraft.eventType ?? ''),
      venue: String(customerBookingDraft.venue ?? ''),
      guestCount,
      specialRequests: String(customerBookingDraft.specialRequests ?? ''),
      selectedMenuItemIds,
      dietaryRestrictions: customerDietaryRestrictions,
      eventProfileId: String(customerBookingDraft.eventProfileId ?? 'corporate-buffet'),
      status: 'pending' as const,
      totalCost,
      paymentsReceived: 0,
      validationPassed: false,
      ruleViolations: [] as string[],
      createdAt: new Date().toISOString(),
    };

    createBooking(newBooking);
    clearCustomerSession();
    router.push('/customer/inquiry');
    alert(
      'Booking submitted! The owner will review it. You will be notified once rules are checked.'
    );
  };

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-surface-foreground">Menu Items</h1>
            <p className="text-surface-muted-foreground mt-2">
              Select items for your event
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {menuItems.map((item) => {
              const isSelected = selectedMenuItemIds.includes(item.id);
              const hasAllergyConflict = item.allergyTags.some((tag) =>
                customerDietaryRestrictions.includes(tag)
              );

              return (
                <Card
                  key={item.id}
                  className={`p-6 cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() =>
                    isSelected
                      ? deselectMenuItem(item.id)
                      : selectMenuItem(item.id)
                  }
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-card-foreground flex-1">
                      {item.name}
                    </h3>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary ml-2" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${item.price}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.inventoryStatus === 'available'
                          ? 'bg-green-100 text-green-800'
                          : item.inventoryStatus === 'limited'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.inventoryStatus}
                    </span>
                  </div>

                  {hasAllergyConflict && (
                    <div className="mt-3 p-2 bg-red-50 rounded border border-red-200 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">
                        Contains restricted allergens
                      </p>
                    </div>
                  )}

                  {item.allergyTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.allergyTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <Card className="sticky top-24 p-6">
            <h2 className="text-lg font-bold text-card-foreground">Review selection</h2>
            <p className="mt-2 text-sm text-muted-foreground">{selectedMenuItemIds.length} menu items selected. Dietary restrictions are checked separately.</p>
            <Button onClick={handleSubmit} disabled={selectedMenuItemIds.length === 0} className="mt-6 w-full">Submit Booking</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
