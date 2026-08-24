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
    eventProfiles,
    selectedMenuItemIds,
    customerDietaryRestrictions,
    selectedEventProfileId,
    selectMenuItem,
    deselectMenuItem,
    customerBookingDraft,
    createBooking,
    clearCustomerSession,
  } = useAppState();

  const selectedProfile = eventProfiles.find((p) => p.id === selectedEventProfileId);

  // Calculate total macros
  const totalMacros = selectedMenuItemIds.reduce(
    (acc, itemId) => {
      const item = menuItems.find((m) => m.id === itemId);
      if (item) {
        return {
          carbs: acc.carbs + item.macros.carbs,
          protein: acc.protein + item.macros.protein,
          fat: acc.fat + item.macros.fat,
        };
      }
      return acc;
    },
    { carbs: 0, protein: 0, fat: 0 }
  );

  // Check macro compliance
  const isMacroCompliant =
    selectedProfile &&
    totalMacros.carbs >= selectedProfile.macros.carbs.min &&
    totalMacros.carbs <= selectedProfile.macros.carbs.max &&
    totalMacros.protein >= selectedProfile.macros.protein.min &&
    totalMacros.protein <= selectedProfile.macros.protein.max &&
    totalMacros.fat >= selectedProfile.macros.fat.min &&
    totalMacros.fat <= selectedProfile.macros.fat.max;

  const macroWarnings = [];
  if (selectedProfile) {
    if (
      totalMacros.carbs < selectedProfile.macros.carbs.min ||
      totalMacros.carbs > selectedProfile.macros.carbs.max
    ) {
      macroWarnings.push('Carbs');
    }
    if (
      totalMacros.protein < selectedProfile.macros.protein.min ||
      totalMacros.protein > selectedProfile.macros.protein.max
    ) {
      macroWarnings.push('Protein');
    }
    if (
      totalMacros.fat < selectedProfile.macros.fat.min ||
      totalMacros.fat > selectedProfile.macros.fat.max
    ) {
      macroWarnings.push('Fat');
    }
  }

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
      eventProfileId: selectedEventProfileId,
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

                  <div className="grid grid-cols-3 gap-2 p-2 bg-muted/50 rounded mb-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {item.macros.carbs}g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {item.macros.protein}g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {item.macros.fat}g
                      </p>
                    </div>
                  </div>

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

        {/* Macro Tracker Sidebar */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-bold text-card-foreground mb-6">
              Macro Summary
            </h2>

            <div className="space-y-6 mb-8">
              {/* Selected Items Count */}
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Items Selected</p>
                <p className="text-3xl font-bold text-primary">
                  {selectedMenuItemIds.length}
                </p>
              </div>

              {/* Macro Targets */}
              {selectedProfile && (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-card-foreground">
                        Carbs
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          totalMacros.carbs >= selectedProfile.macros.carbs.min &&
                          totalMacros.carbs <= selectedProfile.macros.carbs.max
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {totalMacros.carbs}g
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Target: {selectedProfile.macros.carbs.min}-
                      {selectedProfile.macros.carbs.max}g
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          totalMacros.carbs <=
                          selectedProfile.macros.carbs.max
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (totalMacros.carbs /
                              selectedProfile.macros.carbs.max) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-card-foreground">
                        Protein
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          totalMacros.protein >=
                            selectedProfile.macros.protein.min &&
                          totalMacros.protein <=
                            selectedProfile.macros.protein.max
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {totalMacros.protein}g
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Target: {selectedProfile.macros.protein.min}-
                      {selectedProfile.macros.protein.max}g
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          totalMacros.protein <=
                          selectedProfile.macros.protein.max
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (totalMacros.protein /
                              selectedProfile.macros.protein.max) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-card-foreground">
                        Fat
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          totalMacros.fat >= selectedProfile.macros.fat.min &&
                          totalMacros.fat <= selectedProfile.macros.fat.max
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {totalMacros.fat}g
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Target: {selectedProfile.macros.fat.min}-
                      {selectedProfile.macros.fat.max}g
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          totalMacros.fat <= selectedProfile.macros.fat.max
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (totalMacros.fat /
                              selectedProfile.macros.fat.max) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {macroWarnings.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    ⚠️ Out of Range:
                  </p>
                  <p className="text-xs text-red-700">
                    {macroWarnings.join(', ')}
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={selectedMenuItemIds.length === 0}
              className={`w-full text-white font-medium hover:bg-brand ${
                isMacroCompliant ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              Submit Booking
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
