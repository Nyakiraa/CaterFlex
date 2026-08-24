'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, Check, X, AlertCircle } from 'lucide-react';
import { printInvoicePdf } from '@/lib/pdf/invoicePdf';

export default function BookingsPage() {
  const { bookings, menuItems, confirmBooking, rejectBooking, getInvoiceForBooking } =
    useAppState();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleConfirm = (bookingId: string) => {
    const ok = confirmBooking(bookingId);
    if (!ok) {
      setConfirmError(bookingId);
    } else {
      setConfirmError(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">Bookings</h1>
          <p className="text-surface-muted-foreground mt-2">
            Manage and track all customer bookings
          </p>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <button
                onClick={() =>
                  setExpandedId(expandedId === booking.id ? null : booking.id)
                }
                className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.eventType} • {booking.guestCount} guests •{' '}
                      {booking.eventTime}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                              ? booking.validationPassed
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status === 'pending' && !booking.validationPassed
                          ? 'Rule violation'
                          : booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ml-4 ${
                    expandedId === booking.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedId === booking.id && (
                <div className="border-t border-border p-6 bg-muted/20">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Contact
                      </p>
                      <p className="font-medium text-card-foreground">
                        {booking.customerEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Venue
                      </p>
                      <p className="font-medium text-card-foreground">
                        {booking.venue}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected Items
                    </p>
                    <div className="space-y-2">
                      {booking.selectedMenuItemIds.map((itemId) => {
                        const item = menuItems.find((m) => m.id === itemId);
                        return (
                          <div
                            key={itemId}
                            className="flex justify-between items-center p-3 bg-muted rounded-lg"
                          >
                            <span className="font-medium text-card-foreground">
                              {item?.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ${item?.price}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-card-foreground">
                        Total Cost:
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${booking.totalCost}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Paid:
                      </span>
                      <span className="font-medium text-card-foreground">
                        ${booking.paymentsReceived}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-accent mt-2">
                      <span className="text-sm text-muted-foreground">
                        Outstanding:
                      </span>
                      <span className="font-bold">
                        ${booking.totalCost - booking.paymentsReceived}
                      </span>
                    </div>
                  </div>

                  {!booking.validationPassed && booking.ruleViolations.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-sm font-semibold text-red-800">
                          Booking rule violations
                        </p>
                      </div>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {booking.ruleViolations.map((v) => (
                          <li key={v}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {booking.specialRequests && (
                    <div className="mb-6 p-3 bg-secondary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Special Requests
                      </p>
                      <p className="text-card-foreground">{booking.specialRequests}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="space-y-3">
                      {confirmError === booking.id && (
                        <p className="text-sm text-red-600">
                          Cannot confirm — resolve rule violations first or adjust
                          operating rules in Settings.
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleConfirm(booking.id)}
                          disabled={!booking.validationPassed}
                          className="flex-1 bg-green-600 text-white gap-2 disabled:opacity-50 hover:bg-brand"
                        >
                          <Check className="w-4 h-4" />
                          Confirm Booking
                        </Button>
                        <Button
                          onClick={() => rejectBooking(booking.id)}
                          variant="outline"
                          className="flex-1 gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {booking.status === 'confirmed' && getInvoiceForBooking(booking.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        const inv = getInvoiceForBooking(booking.id);
                        if (inv) printInvoicePdf(inv);
                      }}
                    >
                      Download Invoice (PDF)
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {bookings.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No bookings yet</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
