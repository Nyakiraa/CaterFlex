'use client';

import { CustomerShell } from '@/app/customer/customer-shell';
import { useAppState } from '@/lib/state';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';


import {
  checkAllergenConflict,
  getUniqueConflictingAllergens,
} from '@/lib/rules/allergenFiltering';

import type { MenuItem } from '@/lib/types';

export default function BrowsePage() {
  const router = useRouter();

  const {
    currentUser,
    selectedMenuItemIds,
    customerDietaryRestrictions,
    selectMenuItem,
    deselectMenuItem,
    customerBookingDraft,
    clearCustomerSession,
  } = useAppState();

  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [showAllergenConfirm, setShowAllergenConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  /*
   * Load menu items from Supabase.
   *
   * MENU_ITEM contains the basic menu information.
   * MENU_ITEM_ALLERGY connects menu items to allergy tags.
   * ALLERGY_TAG contains the actual allergen names.
   */
  useEffect(() => {
    const loadMenuItems = async () => {
      setLoadingMenu(true);

      // Get menu items
      const { data: menuData, error: menuError } = await supabase
        .from('MENU_ITEM')
        .select(`
          MenuItemID,
          ItemName,
          Category,
          Price,
          PrepTimeDays,
          Description
        `)
        .order('MenuItemID');

      if (menuError) {
        console.error('Menu loading error:', menuError);
        alert('Failed to load menu items. Please try again.');
        setLoadingMenu(false);
        return;
      }

      // Get menu item ↔ allergy relationships
      const { data: allergyRelations, error: allergyRelationError } =
        await supabase
          .from('MENU_ITEM_ALLERGY')
          .select(`
            MenuItemID,
            AllergyTagID
          `);

      if (allergyRelationError) {
        console.error(
          'Allergy relationship loading error:',
          allergyRelationError
        );
        alert('Failed to load menu allergen information.');
        setLoadingMenu(false);
        return;
      }

      // Get allergy tag names
      const { data: allergyTags, error: allergyTagError } = await supabase
        .from('ALLERGY_TAG')
        .select(`
          AllergyTagID,
          AllergenName
        `);

      if (allergyTagError) {
        console.error('Allergy tag loading error:', allergyTagError);
        alert('Failed to load allergen information.');
        setLoadingMenu(false);
        return;
      }

      /*
       * Convert Supabase data into the existing MenuItem shape.
       *
       * The application uses string IDs for menu items.
       * Supabase uses numeric MenuItemID values.
       */
      const formattedItems: MenuItem[] = (menuData ?? []).map((item) => {
        const itemAllergyRelations = (allergyRelations ?? []).filter(
          (relation) => relation.MenuItemID === item.MenuItemID
        );

        const itemAllergyNames = itemAllergyRelations
          .map((relation) => {
            const allergyTag = (allergyTags ?? []).find(
              (tag) => tag.AllergyTagID === relation.AllergyTagID
            );

            return allergyTag?.AllergenName;
          })
          .filter((name): name is string => Boolean(name));

        return {
          id: String(item.MenuItemID),
          name: item.ItemName,
          description: item.Description ?? '',
          category: item.Category ?? '',
          price: Number(item.Price ?? 0),
          prepTimeDays: Number(item.PrepTimeDays ?? 0),
          allergyTags: itemAllergyNames as MenuItem['allergyTags'],

          /*
           * These fields are still required by the existing
           * MenuItem type used elsewhere in the application.
           *
           * They are not being used for the Supabase booking.
           */
          macros: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          },
          requiredIngredients: [],
          inventoryStatus: 'available',
        };
      });

      setDbMenuItems(formattedItems);
      setLoadingMenu(false);
    };

    loadMenuItems();
  }, []);

  /*
   * Get the actual menu objects that the customer selected.
   */
  const selectedItems = dbMenuItems.filter((item) =>
    selectedMenuItemIds.includes(item.id)
  );

  /*
   * Check selected menu items against the customer's
   * declared dietary restrictions.
   */
  const conflictingAllergens = getUniqueConflictingAllergens(
    selectedItems,
    customerDietaryRestrictions
  );

  const hasSelectionConflicts = conflictingAllergens.length > 0;

  /*
   * Submit the booking to Supabase.
   */
  const finalizeSubmit = async () => {
    if (isSubmitting) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const guestCount = parseInt(
        String(customerBookingDraft.guestCount || '1'),
        10
      );
  
      // Get the logged-in customer's real database ID.
      if (!currentUser?.id) {
        alert(
          'Unable to identify your customer account. Please log in again.'
        );
        return;
      }
  
      const customerId = Number(currentUser.id);
  
      if (Number.isNaN(customerId)) {
        alert('Invalid customer account. Please log in again.');
        return;
      }
  
      // CaterFlex currently has one business/operator.
      const operatorId = 2;
  
      // Only use menu IDs that actually exist in Supabase.
      const validMenuItemIds = selectedMenuItemIds.filter((menuItemId) =>
        dbMenuItems.some((item) => item.id === menuItemId)
      );
  
      if (validMenuItemIds.length === 0) {
        alert('Please select at least one valid menu item.');
        return;
      }
  
      // Create BOOKING.
      const { error: bookingError } = await supabase
        .from('BOOKING')
        .insert({
          CustomerID: customerId,
          OperatorID: operatorId,
          EventDate: String(customerBookingDraft.eventDate ?? ''),
          EventTime: String(customerBookingDraft.eventTime ?? ''),
          Venue: String(customerBookingDraft.venue ?? ''),
          GuestCount: guestCount,
          Status: 'pending',
        });
  
      if (bookingError) {
        console.error('BOOKING INSERT ERROR:', bookingError);
        alert(`Booking failed: ${bookingError.message}`);
        return;
      }
  
      console.log('BOOKING successfully inserted.');
      clearCustomerSession();
      setShowBookingSuccess(true);
  
    } catch (error) {
      console.error('Unexpected booking error:', error);
      alert('Something went wrong while submitting your booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * Handles the Submit Booking button.
   */
  const handleSubmit = () => {
    if (selectedMenuItemIds.length === 0) {
      alert('Please select at least one menu item.');
      return;
    }

    /*
     * If there is an allergen conflict,
     * ask the customer to confirm.
     */
    if (hasSelectionConflicts) {
      setShowAllergenConfirm(true);
      return;
    }

    finalizeSubmit();
  };

  return (
    <CustomerShell>
      <div className="grid lg:grid-cols-3 gap-8">

        {/* MENU ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-surface-foreground">
              Menu Items
            </h1>

            <p className="text-surface-muted-foreground mt-2">
              Select items for your event
            </p>
          </div>

          {loadingMenu ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Loading menu items...
              </p>
            </Card>
          ) : dbMenuItems.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No menu items are currently available.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {dbMenuItems.map((item) => {
                const isSelected = selectedMenuItemIds.includes(item.id);

                const itemConflicts = checkAllergenConflict(
                  item,
                  customerDietaryRestrictions
                );

                const hasAllergyConflict = itemConflicts.length > 0;

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
                    </div>

                    {hasAllergyConflict && (
                      <div className="mt-3 p-2 bg-red-50 rounded border border-red-200 flex gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />

                        <p className="text-xs text-red-700">
                          Conflicts with your declared{' '}
                          {itemConflicts.length === 1
                            ? 'allergy'
                            : 'allergies'}
                          :{' '}
                          {itemConflicts
                            .map((tag) =>
                              tag.replace('_', ' ')
                            )
                            .join(', ')}
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
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* BOOKING SUMMARY */}
        <div>
          <Card className="sticky top-24 p-6">
            <h2 className="text-lg font-bold text-card-foreground">
              Booking Summary
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {selectedMenuItemIds.length} menu items selected.
            </p>

            <div className="space-y-6 mb-8">

              {/* Selected Items */}
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Items Selected
                </p>

                <p className="text-3xl font-bold text-primary">
                  {selectedMenuItemIds.length}
                </p>
              </div>

              {/* Dietary Restrictions */}
              {customerDietaryRestrictions.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-semibold text-card-foreground mb-2">
                    Your Dietary Restrictions
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {customerDietaryRestrictions.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                      >
                        {tag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergen Conflict */}
              {hasSelectionConflicts && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />

                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-1">
                      Allergen Conflict:
                    </p>

                    <p className="text-xs text-red-700">
                      Your selection contains{' '}
                      {conflictingAllergens
                        .map((tag) =>
                          tag.replace('_', ' ')
                        )
                        .join(', ')}
                      , which you declared as a restriction.

                      You will be asked to confirm before submitting.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={
                selectedMenuItemIds.length === 0 ||
                loadingMenu ||
                isSubmitting
              }
              className="w-full text-white font-medium hover:bg-brand bg-primary"
            >
              {isSubmitting
                ? 'Submitting...'
                : 'Submit Booking'}
            </Button>
          </Card>
        </div>
      </div>

      {/* ALLERGEN CONFIRMATION MODAL */}
      {showAllergenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6 border-2 border-red-200">

            <div className="flex gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />

              <div>
                <h3 className="font-heading text-lg font-bold text-card-foreground">
                  Allergen Conflict
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Your selection includes items with declared allergens:{' '}

                  <span className="font-semibold text-red-700">
                    {conflictingAllergens
                      .map((tag) =>
                        tag.replace('_', ' ')
                      )
                      .join(', ')}
                  </span>

                  .
                  <br />
                  <br />
                  Are you sure you want to submit this booking?
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShowAllergenConfirm(false)
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setShowAllergenConfirm(false);
                  finalizeSubmit();
                }}
                disabled={isSubmitting}
              >
                Submit Anyway
              </Button>

            </div>
          </Card>
        </div>
      )}

      {/* BOOKING SUCCESS MODAL */}
        {showBookingSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-md p-6 border-2 border-green-200">
              <div className="flex gap-3 mb-4">

                <div>
                  <h3 className="font-heading text-lg font-bold text-card-foreground">
                    Booking Submitted
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Your booking has been successfully submitted.
                    <br />
                    <br />
                    The business owner will review your booking and confirm the
                    details.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    setShowBookingSuccess(false);
                    clearCustomerSession();
                    router.push('/customer/inquiry');
                  }}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        )}
    </CustomerShell>
  );
}