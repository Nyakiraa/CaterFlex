'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import { getUpcomingPrepSchedule, PrepCycle } from '@/lib/scheduling';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock, PackageCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function StockStatus({ cycle }: { cycle: PrepCycle }) {
  if (cycle.stockStatus === 'ready') {
    return (
      <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800">
        <CheckCircle2 className="size-3" /> Ready
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1 bg-red-100 text-red-800">
      <AlertTriangle className="size-3" /> Shortage
    </Badge>
  );
}

function ShortageCard({ cycle }: { cycle: PrepCycle }) {
  if (!cycle.shortages?.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-700" />
        <div className="min-w-0">
          <p className="font-semibold text-red-900">Restock before prep begins</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-red-800">
            {cycle.shortages.map((shortage) => (
              <li key={shortage.ingredientId}>
                {shortage.ingredientName}: short {shortage.short} {shortage.unit} (need {shortage.needed} {shortage.unit}, have {shortage.current} {shortage.unit})
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-medium text-red-700">Suggested action: restock or use a scrap-based alternate.</p>
        </div>
      </div>
    </div>
  );
}

function PrepCycleCard({ cycle }: { cycle: PrepCycle }) {
  const [notified, setNotified] = useState(false);

  function sendPrepNotification() {
    setNotified(true);
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-card-foreground">{cycle.customerName}</h3>
            <Badge variant="outline">{cycle.orderType === 'meal_prep' ? 'Recurring meal prep' : 'Catering event'}</Badge>
            <StockStatus cycle={cycle} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Fulfillment: {formatDate(cycle.fulfillmentDate)} · {cycle.prepDaysNeeded} prep day{cycle.prepDaysNeeded === 1 ? '' : 's'} needed
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Clock className="size-4" />
          Prep starts {cycle.prepStartDate.toLocaleDateString()}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {cycle.itemsToPrep.map((item) => (
          <div key={item.itemId} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
            <span className="font-medium text-card-foreground">{item.itemName}</span>
            <span className="text-muted-foreground">Qty {item.quantity}</span>
          </div>
        ))}
      </div>

      <ShortageCard cycle={cycle} />

      {cycle.stockStatus === 'ready' && (
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <p className="text-xs text-muted-foreground">Stock check passed for this prep cycle.</p>
          <button
            type="button"
            onClick={sendPrepNotification}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <PackageCheck className="size-3.5" />
            {notified ? 'Notification queued' : 'Send prep notification'}
          </button>
        </div>
      )}
    </Card>
  );
}

export default function PrepSchedulePage() {
  const { bookings, menuItems, ingredients } = useAppState();
  const [showShortagesOnly, setShowShortagesOnly] = useState(false);

  const prepCycles = useMemo(
    () => getUpcomingPrepSchedule(bookings, menuItems, ingredients),
    [bookings, menuItems, ingredients]
  );

  const filteredCycles = showShortagesOnly
    ? prepCycles.filter((cycle) => cycle.stockStatus === 'shortage')
    : prepCycles;

  const groupedCycles = filteredCycles.reduce<Record<string, PrepCycle[]>>((groups, cycle) => {
    const key = cycle.prepStartDate.toISOString().slice(0, 10);
    groups[key] ??= [];
    groups[key].push(cycle);
    return groups;
  }, {});

  const shortageCount = prepCycles.filter((cycle) => cycle.stockStatus === 'shortage').length;
  const recurringCount = prepCycles.filter((cycle) => cycle.orderType === 'meal_prep').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-surface-foreground">Prep Schedule</h1>
            <p className="mt-2 text-surface-muted-foreground">Backward-scheduled preparation tasks for confirmed orders.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowShortagesOnly((current) => !current)}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {showShortagesOnly ? 'Show all cycles' : `Show shortages (${shortageCount})`}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5"><p className="text-sm text-muted-foreground">Prep cycles</p><p className="mt-1 text-2xl font-bold text-card-foreground">{prepCycles.length}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">Recurring cycles</p><p className="mt-1 text-2xl font-bold text-card-foreground">{recurringCount}</p></Card>
          <Card className="border-red-200 bg-red-50 p-5"><p className="text-sm text-red-700">Stock shortages</p><p className="mt-1 text-2xl font-bold text-red-900">{shortageCount}</p></Card>
        </div>

        {Object.entries(groupedCycles).length > 0 ? (
          <div className="flex flex-col gap-8">
            {Object.entries(groupedCycles).map(([dateKey, cycles]) => (
              <section key={dateKey} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <h2 className="font-heading text-xl font-bold text-surface-foreground">{formatDate(new Date(`${dateKey}T00:00:00`))}</h2>
                  <span className="text-sm text-muted-foreground">{cycles.length} task{cycles.length === 1 ? '' : 's'}</span>
                </div>
                <div className="flex flex-col gap-4">
                  {cycles.map((cycle) => <PrepCycleCard key={cycle.id} cycle={cycle} />)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Clock className="mx-auto size-12 text-muted-foreground opacity-50" />
            <p className="mt-4 text-muted-foreground">No preparation cycles match this view.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
