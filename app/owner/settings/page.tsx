'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import type { DayOfWeek } from '@/lib/types';
import { Card } from '@/components/ui/card';

const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export default function SettingsPage() {
  const { operatorSettings, updateOperatorSettings } = useAppState();

  const toggleDay = (day: DayOfWeek) => {
    const operatingDays = operatorSettings.operatingDays.includes(day)
      ? operatorSettings.operatingDays.filter((d) => d !== day)
      : [...operatorSettings.operatingDays, day].sort();
    updateOperatorSettings({ operatingDays });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">Operating Rules</h1>
          <p className="text-surface-muted-foreground mt-2">
            Configure availability and capacity thresholds used when validating bookings.
          </p>
        </div>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">Operating Days</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ALL_DAYS.map((day) => (
              <label
                key={day}
                className="flex items-center gap-2 cursor-pointer text-sm text-card-foreground"
              >
                <input
                  type="checkbox"
                  checked={operatorSettings.operatingDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="rounded border-border"
                />
                {DAY_LABELS[day]}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">Operating Hours</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Start</label>
              <input
                type="time"
                value={operatorSettings.operatingHoursStart}
                onChange={(e) =>
                  updateOperatorSettings({ operatingHoursStart: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">End</label>
              <input
                type="time"
                value={operatorSettings.operatingHoursEnd}
                onChange={(e) =>
                  updateOperatorSettings({ operatingHoursEnd: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">
            Max Events Per Day
          </h2>
          <div className="space-y-3">
            {ALL_DAYS.map((day) => (
              <div key={day} className="flex items-center justify-between gap-4">
                <span className="text-sm text-card-foreground w-28">{DAY_LABELS[day]}</span>
                <input
                  type="number"
                  min={0}
                  value={operatorSettings.maxEventsPerDay[day]}
                  onChange={(e) =>
                    updateOperatorSettings({
                      maxEventsPerDay: {
                        ...operatorSettings.maxEventsPerDay,
                        [day]: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                  className="w-24 px-3 py-2 border border-border rounded-lg text-right"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">Guest Limit</h2>
          <label className="text-sm text-muted-foreground">Max guests per event</label>
          <input
            type="number"
            min={1}
            value={operatorSettings.maxGuestsPerEvent}
            onChange={(e) =>
              updateOperatorSettings({
                maxGuestsPerEvent: parseInt(e.target.value, 10) || 1,
              })
            }
            className="mt-1 w-full max-w-xs px-3 py-2 border border-border rounded-lg"
          />
        </Card>

        <p className="text-sm text-surface-muted-foreground">
          Changes re-validate all pending bookings immediately and update alerts on the dashboard.
        </p>
      </div>
    </DashboardLayout>
  );
}
