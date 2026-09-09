import { Booking, MenuItem, Ingredient, MealPrepFrequency } from './types';

/**
 * Represents a single prep cycle for either a catering event or meal-prep order.
 * For meal-prep orders, each recurrence generates its own prep cycle.
 */
export interface PrepCycle {
  id: string; // booking ID for catering, or `${mealPrepOrderId}-cycle-${cycleIndex}` for meal prep
  bookingId: string;
  orderType: 'catering' | 'meal_prep';
  customerName: string;
  itemsToPrep: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
  }>;
  fulfillmentDate: Date; // event date for catering, delivery date for meal prep
  prepStartDate: Date; // backward calculated from fulfillmentDate
  prepDaysNeeded: number; // max prep time across all items in this cycle
  stockStatus: 'ready' | 'shortage';
  shortages?: Array<{
    ingredientId: string;
    ingredientName: string;
    needed: number;
    current: number;
    unit: string;
    short: number;
  }>;
}

/**
 * For a given booking and menu items, compute the prep start date by working backward
 * from the event date, subtracting the maximum PrepTimeDays across all selected items.
 * This is the core backward-scheduling calculation.
 */
function calculatePrepStartDate(eventDate: Date, maxPrepTimeDays: number): Date {
  const prepStart = new Date(eventDate);
  // Subtract prepTimeDays from the event date to get the prep start date
  prepStart.setDate(prepStart.getDate() - maxPrepTimeDays);
  return prepStart;
}

/**
 * Get upcoming fulfillment dates for a meal-prep order based on recurrence pattern.
 * Returns the next N dates; for this demo, returns the next 5 cycles.
 */
function generateMealPrepCycles(
  startDate: Date,
  frequency: MealPrepFrequency,
  numberOfCycles: number = 5
): Date[] {
  const cycles: Date[] = [];
  const interval = frequency === 'weekly' ? 7 : 14;

  for (let i = 0; i < numberOfCycles; i++) {
    const cycleDate = new Date(startDate);
    cycleDate.setDate(cycleDate.getDate() + i * interval);
    cycles.push(cycleDate);
  }

  return cycles;
}

/**
 * Check if ingredients in stock are sufficient for a given order.
 * Returns both a status and a list of any shortages.
 */
function checkIngredientStock(
  itemsToPrep: Array<{ itemId: string; quantity: number }>,
  menuItems: MenuItem[],
  ingredients: Ingredient[]
): { status: 'ready' | 'shortage'; shortages: PrepCycle['shortages'] } {
  const shortages: PrepCycle['shortages'] = [];
  const ingredientNeeds: Record<string, { needed: number; unit: string }> = {};

  // Aggregate total ingredient needs across all items
  for (const item of itemsToPrep) {
    const menuItem = menuItems.find((m) => m.id === item.itemId);
    if (!menuItem) continue;

    for (const requiredIng of menuItem.requiredIngredients) {
      if (!ingredientNeeds[requiredIng.id]) {
        ingredientNeeds[requiredIng.id] = { needed: 0, unit: requiredIng.unit };
      }
      // Multiply by the quantity ordered
      ingredientNeeds[requiredIng.id].needed += requiredIng.qty * item.quantity;
    }
  }

  // Check each ingredient against current stock
  for (const [ingId, { needed, unit }] of Object.entries(ingredientNeeds)) {
    const ingredient = ingredients.find((i) => i.id === ingId);
    if (!ingredient) continue;

    if (ingredient.currentStock < needed) {
      const short = needed - ingredient.currentStock;
      shortages.push({
        ingredientId: ingId,
        ingredientName: ingredient.name,
        needed,
        current: ingredient.currentStock,
        unit,
        short,
      });
    }
  }

  return {
    status: shortages.length > 0 ? 'shortage' : 'ready',
    shortages: shortages.length > 0 ? shortages : undefined,
  };
}

/**
 * For a confirmed catering booking, compute a single prep cycle.
 */
export function computeBookingPrepCycle(
  booking: Booking,
  menuItems: MenuItem[],
  ingredients: Ingredient[]
): PrepCycle {
  const itemsToPrep = booking.selectedMenuItemIds.map((itemId) => {
    const item = menuItems.find((m) => m.id === itemId);
    return {
      itemId,
      itemName: item?.name || 'Unknown',
      quantity: 1, // For bookings, we prep one unit per selected item
    };
  });

  // Find the maximum prep time needed
  const maxPrepTimeDays = Math.max(
    ...booking.selectedMenuItemIds
      .map((itemId) => menuItems.find((m) => m.id === itemId)?.prepTimeDays || 0)
      .filter((days) => days > 0),
    0
  );

  const eventDate = new Date(booking.eventDate);
  const prepStartDate = calculatePrepStartDate(eventDate, maxPrepTimeDays);

  // Check stock at the prep start date
  const { status, shortages } = checkIngredientStock(itemsToPrep, menuItems, ingredients);

  return {
    id: booking.id,
    bookingId: booking.id,
    orderType: 'catering',
    customerName: booking.customerName,
    itemsToPrep,
    fulfillmentDate: eventDate,
    prepStartDate,
    prepDaysNeeded: maxPrepTimeDays,
    stockStatus: status,
    shortages,
  };
}

/**
 * For a confirmed meal-prep order, compute prep cycles for the next N recurrences.
 * Simulates meal-prep by generating upcoming cycles based on frequency.
 */
export function computeMealPrepOrderCycles(
  booking: Booking,
  menuItems: MenuItem[],
  ingredients: Ingredient[],
  numberOfCycles: number = 5
): PrepCycle[] {
  if (booking.orderType !== 'meal_prep' || !booking.mealPrepFrequency) {
    return [];
  }

  const itemsToPrep = booking.selectedMenuItemIds.map((itemId) => {
    const item = menuItems.find((m) => m.id === itemId);
    return {
      itemId,
      itemName: item?.name || 'Unknown',
      quantity: 1, // Simplified: 1 serving per item per cycle
    };
  });

  const maxPrepTimeDays = Math.max(
    ...booking.selectedMenuItemIds
      .map((itemId) => menuItems.find((m) => m.id === itemId)?.prepTimeDays || 0)
      .filter((days) => days > 0),
    0
  );

  // Generate upcoming fulfillment dates
  const startDate = new Date(booking.eventDate);
  const fulfillmentDates = generateMealPrepCycles(startDate, booking.mealPrepFrequency, numberOfCycles);

  // For each fulfillment date, create a prep cycle
  return fulfillmentDates.map((fulfillmentDate, cycleIndex) => {
    const prepStartDate = calculatePrepStartDate(fulfillmentDate, maxPrepTimeDays);
    const { status, shortages } = checkIngredientStock(itemsToPrep, menuItems, ingredients);

    return {
      id: `${booking.id}-cycle-${cycleIndex}`,
      bookingId: booking.id,
      orderType: 'meal_prep',
      customerName: booking.customerName,
      itemsToPrep,
      fulfillmentDate,
      prepStartDate,
      prepDaysNeeded: maxPrepTimeDays,
      stockStatus: status,
      shortages,
    };
  });
}

/**
 * Get all upcoming prep items for the business owner, grouped by prep start date.
 * Includes both catering and meal-prep orders.
 */
export function getUpcomingPrepSchedule(
  bookings: Booking[],
  menuItems: MenuItem[],
  ingredients: Ingredient[]
): PrepCycle[] {
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const allPrepCycles: PrepCycle[] = [];

  for (const booking of confirmedBookings) {
    if (booking.orderType === 'catering') {
      const cycle = computeBookingPrepCycle(booking, menuItems, ingredients);
      allPrepCycles.push(cycle);
    } else if (booking.orderType === 'meal_prep') {
      const cycles = computeMealPrepOrderCycles(booking, menuItems, ingredients);
      allPrepCycles.push(...cycles);
    }
  }

  // Sort by prep start date
  return allPrepCycles.sort((a, b) => a.prepStartDate.getTime() - b.prepStartDate.getTime());
}

/**
 * Get prep cycles for a specific date or date range.
 */
export function getPrepCyclesForDateRange(
  allPrepCycles: PrepCycle[],
  startDate: Date,
  endDate: Date
): PrepCycle[] {
  return allPrepCycles.filter(
    (cycle) =>
      cycle.prepStartDate >= startDate && cycle.prepStartDate <= endDate
  );
}
