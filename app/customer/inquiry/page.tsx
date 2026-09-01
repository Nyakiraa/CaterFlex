'use client';

import { CustomerShell } from '@/app/customer/customer-shell';
import { useAppState } from '@/lib/state';
import type { AllergenType, FulfillmentMethod, MealPrepFrequency, OrderType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CalendarDays, UtensilsCrossed } from 'lucide-react';

const ALLERGEN_OPTIONS: AllergenType[] = [
  'shellfish',
  'peanuts',
  'dairy',
  'gluten',
  'eggs',
  'soy',
  'tree_nuts',
  'other',
];

export default function InquiryPage() {
  const router = useRouter();
  const {
    eventProfiles,
    customerOrderType,
    setCustomerOrderType,
    setCustomerBookingDraft,
    setDietaryRestrictions,
    setSelectedEventProfile,
  } = useAppState();

  const isMealPrep = customerOrderType === 'meal_prep';

  const [cateringForm, setCateringForm] = useState({
    eventType: '',
    eventDate: '',
    eventTime: '12:00',
    venue: '',
    guestCount: '',
    specialRequests: '',
    eventProfileId: eventProfiles[0]?.id || '',
  });

  const [mealPrepForm, setMealPrepForm] = useState({
    planName: '',
    startDate: '',
    fulfillmentTime: '10:00',
    frequency: 'weekly' as MealPrepFrequency,
    fulfillmentMethod: 'pickup' as FulfillmentMethod,
    servingsPerCycle: '',
    address: '',
    specialRequests: '',
    eventProfileId: eventProfiles[0]?.id || '',
  });

  const [dietary, setDietary] = useState<string[]>([]);

  const switchOrderType = (type: OrderType) => {
    setCustomerOrderType(type);
  };

  const toggleAllergen = (allergen: AllergenType) => {
    setDietary((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDietaryRestrictions(dietary);

    if (isMealPrep) {
      setSelectedEventProfile(mealPrepForm.eventProfileId);
      setCustomerBookingDraft({
        orderType: 'meal_prep',
        eventType: mealPrepForm.planName,
        eventDate: mealPrepForm.startDate,
        eventTime: mealPrepForm.fulfillmentTime,
        venue:
          mealPrepForm.fulfillmentMethod === 'delivery'
            ? mealPrepForm.address
            : 'Pickup at kitchen',
        guestCount: parseInt(mealPrepForm.servingsPerCycle, 10) || 1,
        mealPrepFrequency: mealPrepForm.frequency,
        fulfillmentMethod: mealPrepForm.fulfillmentMethod,
        specialRequests: mealPrepForm.specialRequests,
        eventProfileId: mealPrepForm.eventProfileId,
      });
    } else {
      setSelectedEventProfile(cateringForm.eventProfileId);
      setCustomerBookingDraft({
        orderType: 'catering',
        eventType: cateringForm.eventType,
        eventDate: cateringForm.eventDate,
        eventTime: cateringForm.eventTime,
        venue: cateringForm.venue,
        guestCount: parseInt(cateringForm.guestCount, 10) || 1,
        specialRequests: cateringForm.specialRequests,
        eventProfileId: cateringForm.eventProfileId,
      });
    }

    router.push(isMealPrep ? '/customer/meal-prep-preview' : '/customer/browse');
  };

  const inputClass =
    'w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent';

  return (
    <CustomerShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">
            {isMealPrep ? 'Start Meal Prep Plan' : 'Book Catering'}
          </h1>
          <p className="text-surface-muted-foreground mt-2">
            {isMealPrep
              ? 'Set up a recurring weekly or bi-weekly meal prep order'
              : 'Tell us about your one-time catering event'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => switchOrderType('catering')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              !isMealPrep
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <CalendarDays className="w-6 h-6 text-primary mb-2" />
            <p className="font-heading font-bold text-card-foreground">Catering Event</p>
            <p className="text-xs text-muted-foreground mt-1">
              Weddings, corporate events, parties
            </p>
          </button>
          <button
            type="button"
            onClick={() => switchOrderType('meal_prep')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              isMealPrep
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <UtensilsCrossed className="w-6 h-6 text-secondary mb-2" />
            <p className="font-heading font-bold text-card-foreground">Meal Prep Plan</p>
            <p className="text-xs text-muted-foreground mt-1">
              Recurring weekly or bi-weekly meals
            </p>
          </button>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {!isMealPrep ? (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-card-foreground">Event Details</h2>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Event Type *
                  </label>
                  <input
                    type="text"
                    placeholder="Wedding, Corporate Lunch, Birthday Party, etc."
                    value={cateringForm.eventType}
                    onChange={(e) =>
                      setCateringForm({ ...cateringForm, eventType: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={cateringForm.eventDate}
                      onChange={(e) =>
                        setCateringForm({ ...cateringForm, eventDate: e.target.value })
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Event Time *
                    </label>
                    <input
                      type="time"
                      value={cateringForm.eventTime}
                      onChange={(e) =>
                        setCateringForm({ ...cateringForm, eventTime: e.target.value })
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={cateringForm.guestCount}
                      onChange={(e) =>
                        setCateringForm({ ...cateringForm, guestCount: e.target.value })
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    placeholder="Location of your event"
                    value={cateringForm.venue}
                    onChange={(e) =>
                      setCateringForm({ ...cateringForm, venue: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={cateringForm.specialRequests}
                    onChange={(e) =>
                      setCateringForm({
                        ...cateringForm,
                        specialRequests: e.target.value,
                      })
                    }
                    rows={4}
                    className={inputClass}
                  />
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-card-foreground">Meal Prep Plan</h2>
                <p className="text-sm text-muted-foreground">
                  Your plan repeats on a schedule. The operator validates fulfillment day
                  capacity separately from catering events.
                </p>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly Fitness Meals, Family Lunch Prep"
                    value={mealPrepForm.planName}
                    onChange={(e) =>
                      setMealPrepForm({ ...mealPrepForm, planName: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      First Fulfillment Date *
                    </label>
                    <input
                      type="date"
                      value={mealPrepForm.startDate}
                      onChange={(e) =>
                        setMealPrepForm({ ...mealPrepForm, startDate: e.target.value })
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Pickup / Delivery Time *
                    </label>
                    <input
                      type="time"
                      value={mealPrepForm.fulfillmentTime}
                      onChange={(e) =>
                        setMealPrepForm({
                          ...mealPrepForm,
                          fulfillmentTime: e.target.value,
                        })
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Frequency *
                    </label>
                    <select
                      value={mealPrepForm.frequency}
                      onChange={(e) =>
                        setMealPrepForm({
                          ...mealPrepForm,
                          frequency: e.target.value as MealPrepFrequency,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 weeks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Servings per Cycle *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Meals per fulfillment"
                      value={mealPrepForm.servingsPerCycle}
                      onChange={(e) =>
                        setMealPrepForm({
                          ...mealPrepForm,
                          servingsPerCycle: e.target.value,
                        })
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Fulfillment Method *
                  </label>
                  <div className="flex gap-4">
                    {(['pickup', 'delivery'] as FulfillmentMethod[]).map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-2 cursor-pointer text-sm text-card-foreground"
                      >
                        <input
                          type="radio"
                          name="fulfillmentMethod"
                          checked={mealPrepForm.fulfillmentMethod === method}
                          onChange={() =>
                            setMealPrepForm({ ...mealPrepForm, fulfillmentMethod: method })
                          }
                        />
                        <span className="capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {mealPrepForm.fulfillmentMethod === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      placeholder="Street, city, delivery notes"
                      value={mealPrepForm.address}
                      onChange={(e) =>
                        setMealPrepForm({ ...mealPrepForm, address: e.target.value })
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={mealPrepForm.specialRequests}
                    onChange={(e) =>
                      setMealPrepForm({
                        ...mealPrepForm,
                        specialRequests: e.target.value,
                      })
                    }
                    rows={3}
                    className={inputClass}
                  />
                </div>

              </div>
            )}

            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-lg font-bold text-card-foreground">Dietary Restrictions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {ALLERGEN_OPTIONS.map((allergen) => (
                  <label
                    key={allergen}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={dietary.includes(allergen)}
                      onChange={() => toggleAllergen(allergen)}
                      className="w-4 h-4 border-border rounded"
                    />
                    <span className="text-sm text-card-foreground capitalize">
                      {allergen.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <Button
                type="submit"
                className="flex-1 bg-primary text-white font-medium hover:bg-brand"
              >
                Continue to Menu Selection
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </CustomerShell>
  );
}
