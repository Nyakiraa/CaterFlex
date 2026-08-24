import type { Booking, Invoice, MenuItem, Payment } from '../types';

export function calculateBookingTotal(
  booking: Pick<Booking, 'selectedMenuItemIds' | 'guestCount'>,
  menuItems: MenuItem[]
): number {
  const guestCount = Number(booking.guestCount) || 1;
  return booking.selectedMenuItemIds.reduce((sum, itemId) => {
    const item = menuItems.find((m) => m.id === itemId);
    return sum + (item?.price ?? 0) * guestCount;
  }, 0);
}

export function generateInvoice(
  booking: Booking,
  menuItems: MenuItem[],
  payments: Payment[]
): Invoice {
  const guestCount = Number(booking.guestCount) || 1;
  const lineItems = booking.selectedMenuItemIds
    .map((itemId) => {
      const item = menuItems.find((m) => m.id === itemId);
      if (!item) return null;
      return {
        name: item.name,
        unitPrice: item.price,
        quantity: guestCount,
        total: item.price * guestCount,
      };
    })
    .filter(Boolean) as Invoice['lineItems'];

  const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
  const paymentsMade = payments
    .filter((p) => p.bookingId === booking.id)
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    id: `inv-${booking.id}-${Date.now()}`,
    bookingId: booking.id,
    generatedAt: new Date().toISOString(),
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    eventDate: booking.eventDate,
    eventType: booking.eventType,
    lineItems,
    guestCount,
    subtotal,
    totalDue: subtotal,
    paymentsMade,
    balanceDue: Math.max(subtotal - paymentsMade, 0),
  };
}

export function getPaymentsTotal(payments: Payment[], bookingId: string): number {
  return payments
    .filter((p) => p.bookingId === bookingId)
    .reduce((sum, p) => sum + p.amount, 0);
}

export function getRevenueInPeriod(
  payments: Payment[],
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime() + 86400000;
  return payments
    .filter((p) => {
      const t = new Date(p.date).getTime();
      return t >= start && t < end;
    })
    .reduce((sum, p) => sum + p.amount, 0);
}
