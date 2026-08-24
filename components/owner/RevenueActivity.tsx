'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useAppState } from '@/lib/state';
import type { Booking } from '@/lib/types';

const chartConfig = {
  products: { label: 'Products', color: '#BA6A4C' },
  services: { label: 'Services', color: '#607456' },
} satisfies ChartConfig;

const AVATAR_COLORS = ['#BA6A4C', '#607456', '#7B2525', '#D9A05B', '#4C6EBA'];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function activityText(booking: Booking) {
  switch (booking.status) {
    case 'confirmed':
      return { verb: 'confirmed event', target: `#${booking.id}` };
    case 'completed':
      return { verb: 'completed event', target: `#${booking.id}` };
    case 'rejected':
      return { verb: 'had a booking declined', target: `#${booking.id}` };
    default:
      return { verb: 'requested a new booking', target: `#${booking.id}` };
  }
}

export function RevenueActivity() {
  const { bookings } = useAppState();

  const revenueData = useMemo(() => {
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalCost, 0);
    const dailyBase = Math.max(totalRevenue / 30, 1500);
    return Array.from({ length: 30 }, (_, i) => {
      const growth = 1 + i * 0.03;
      const wave = Math.sin(i / 1.5) * 0.08 + 1;
      const products = Math.round(dailyBase * 0.6 * growth * wave);
      const services = Math.round(dailyBase * 0.32 * growth * (2 - wave));
      return { day: `Day ${i + 1}`, products, services };
    });
  }, [bookings]);

  const recentActivity = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [bookings]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue trend */}
      <Card className="p-6 lg:col-span-2">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-card-foreground">Revenue trend</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Daily revenue over the past 30 days, products vs. services.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            aria-label="Revenue options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={revenueData} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillProducts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-products)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-products)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillServices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-services)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-services)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={3}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={48}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <span className="flex w-full justify-between gap-4">
                      <span className="capitalize text-muted-foreground">
                        {name}
                      </span>
                      <span className="font-mono font-medium">
                        ${Number(value).toLocaleString()}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="services"
              type="monotone"
              stroke="var(--color-services)"
              fill="url(#fillServices)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="products"
              type="monotone"
              stroke="var(--color-products)"
              fill="url(#fillProducts)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </Card>

      {/* Recent activity */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-card-foreground">Recent activity</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Latest booking updates.
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            View all
          </Button>
        </div>

        <div className="space-y-5">
          {recentActivity.length === 0 && (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
          {recentActivity.map((booking) => {
            const { verb, target } = activityText(booking);
            const color =
              AVATAR_COLORS[
                Math.abs(
                  booking.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                ) % AVATAR_COLORS.length
              ];
            return (
              <div key={booking.id} className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  {initials(booking.customerName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-card-foreground leading-snug">
                    <span className="font-semibold">{booking.customerName}</span>{' '}
                    {verb}{' '}
                    <span className="font-semibold">{target}</span>.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {relativeTime(booking.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
