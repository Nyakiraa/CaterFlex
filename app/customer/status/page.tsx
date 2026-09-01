'use client';

import { useState } from 'react';
import { CustomerShell } from '@/app/customer/customer-shell';
import { useAppState } from '@/lib/state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Clock3, XCircle, Send } from 'lucide-react';

const statusCopy = {
  pending: { label: 'Pending review', icon: Clock3, tone: 'secondary' as const },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, tone: 'default' as const },
  rejected: { label: 'Rejected', icon: XCircle, tone: 'destructive' as const },
  completed: { label: 'Completed', icon: CheckCircle2, tone: 'default' as const },
};

export default function CustomerStatusPage() {
  const { bookings, menuItems, updateBooking } = useAppState();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sentId, setSentId] = useState<string | null>(null);

  const submitChangeRequest = (bookingId: string) => {
    const request = drafts[bookingId]?.trim();
    if (!request) return;
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    const prefix = booking.specialRequests ? `${booking.specialRequests}\n\n` : '';
    updateBooking(bookingId, { specialRequests: `${prefix}Change request: ${request}` });
    setDrafts((current) => ({ ...current, [bookingId]: '' }));
    setSentId(bookingId);
  };

  return (
    <CustomerShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">My bookings</h1>
          <p className="mt-2 text-surface-muted-foreground">Track inquiries, confirmations, and request updates.</p>
        </header>

        {bookings.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">No bookings yet. Start a new inquiry to see it here.</CardContent></Card>
        ) : bookings.map((booking) => {
          const status = statusCopy[booking.status];
          const StatusIcon = status.icon;
          return (
            <Card key={booking.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{booking.eventType || 'Catering request'}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{new Date(booking.eventDate).toLocaleDateString()} · {booking.guestCount} guests · {booking.venue}</p>
                </div>
                <Badge variant={status.tone}><StatusIcon data-icon="inline-start" />{status.label}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {booking.selectedMenuItemIds.map((id) => menuItems.find((item) => item.id === id)?.name).filter(Boolean).map((name) => <Badge key={name} variant="outline">{name}</Badge>)}
                </div>
                <div className="flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">Estimated total</span>
                  <span className="font-semibold text-foreground">${booking.totalCost.toLocaleString()}</span>
                </div>
                {booking.status !== 'rejected' && (
                  <div className="flex flex-col gap-3">
                    <label htmlFor={`change-${booking.id}`} className="text-sm font-medium">Request a change</label>
                    <Textarea id={`change-${booking.id}`} value={drafts[booking.id] ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="Tell the owner what you would like to update..." rows={3} />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">The owner will review your request before changing the booking.</p>
                      <Button onClick={() => submitChangeRequest(booking.id)} disabled={!drafts[booking.id]?.trim()}><Send data-icon="inline-start" />Send request</Button>
                    </div>
                    {sentId === booking.id && <p className="text-sm text-primary" role="status">Change request sent to the owner.</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </CustomerShell>
  );
}
