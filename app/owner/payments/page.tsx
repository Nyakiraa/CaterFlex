'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import type { PaymentType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import { DollarSign, FileDown } from 'lucide-react';
import { getRevenueInPeriod } from '@/lib/rules/invoices';
import { printInvoicePdf } from '@/lib/pdf/invoicePdf';

export default function PaymentsPage() {
  const { bookings, payments, recordPayment, getInvoiceForBooking } = useAppState();
  const [paymentForm, setPaymentForm] = useState<{
    bookingId: string;
    amount: number;
    type: PaymentType;
    notes: string;
  } | null>(null);
  const [periodStart, setPeriodStart] = useState('2026-06-01');
  const [periodEnd, setPeriodEnd] = useState('2026-07-31');

  const handleRecordPayment = () => {
    if (paymentForm && paymentForm.amount > 0) {
      recordPayment(
        paymentForm.bookingId,
        paymentForm.amount,
        paymentForm.type,
        paymentForm.notes || undefined
      );
      setPaymentForm(null);
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = bookings.reduce(
    (sum, b) => sum + (b.totalCost - b.paymentsReceived),
    0
  );
  const periodRevenue = useMemo(
    () => getRevenueInPeriod(payments, periodStart, periodEnd),
    [payments, periodStart, periodEnd]
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">Payments</h1>
          <p className="text-surface-muted-foreground mt-2">
            Record payments, track balances, and export invoices per booking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-primary mt-2">${totalRevenue}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="text-3xl font-bold text-accent mt-2">${outstanding}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Period Revenue</p>
            <p className="text-3xl font-bold text-secondary mt-2">${periodRevenue}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">
            Financial Summary (date range)
          </h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm text-muted-foreground">From</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="block mt-1 px-3 py-2 border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">To</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="block mt-1 px-3 py-2 border border-border rounded-lg"
              />
            </div>
            <p className="text-sm text-card-foreground pb-2">
              <span className="font-semibold">${periodRevenue}</span> received in this period
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-6 font-semibold text-card-foreground">Customer</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Event</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Total</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Paid</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Outstanding</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const bookingOutstanding = booking.totalCost - booking.paymentsReceived;
                  const invoice = getInvoiceForBooking(booking.id);

                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-6 font-medium text-card-foreground">
                        {booking.customerName}
                      </td>
                      <td className="p-6 text-muted-foreground">{booking.eventType}</td>
                      <td className="p-6 font-semibold text-card-foreground">
                        ${booking.totalCost}
                      </td>
                      <td className="p-6 text-green-600 font-medium">
                        ${booking.paymentsReceived}
                      </td>
                      <td
                        className={`p-6 font-semibold ${
                          bookingOutstanding > 0 ? 'text-destructive' : 'text-green-600'
                        }`}
                      >
                        ${bookingOutstanding}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          {bookingOutstanding > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setPaymentForm({
                                  bookingId: booking.id,
                                  amount: bookingOutstanding,
                                  type: 'partial',
                                  notes: '',
                                })
                              }
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Record
                            </Button>
                          )}
                          {invoice && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => printInvoicePdf(invoice)}
                            >
                              <FileDown className="w-4 h-4 mr-1" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {payments.length > 0 && (
          <Card className="p-6">
            <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">
              Payment History
            </h2>
            <div className="space-y-2">
              {[...payments]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((payment) => {
                  const booking = bookings.find((b) => b.id === payment.bookingId);
                  return (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg text-sm"
                    >
                      <span className="text-card-foreground">
                        {booking?.customerName ?? payment.bookingId} —{' '}
                        <span className="capitalize">{payment.type.replace('_', ' ')}</span>
                        {payment.notes ? ` (${payment.notes})` : ''}
                      </span>
                      <span className="font-semibold text-green-600">
                        +${payment.amount}{' '}
                        <span className="text-muted-foreground font-normal">
                          {new Date(payment.date).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {paymentForm && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Record Payment</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground">Payment type</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      type: e.target.value as PaymentType,
                    })
                  }
                  className="block mt-1 w-full max-w-xs px-3 py-2 border border-border rounded-lg"
                >
                  <option value="down_payment">Down payment</option>
                  <option value="partial">Partial payment</option>
                  <option value="full_payment">Full payment</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Amount</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-border rounded-lg"
                    placeholder="Amount"
                  />
                  <input
                    type="text"
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, notes: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-border rounded-lg"
                    placeholder="Notes (optional)"
                  />
                  <Button
                    onClick={handleRecordPayment}
                    className="bg-green-600 text-white hover:bg-brand"
                  >
                    Confirm
                  </Button>
                  <Button onClick={() => setPaymentForm(null)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
