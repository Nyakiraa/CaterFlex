'use client';

import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/state';
import { Button } from '@/components/ui/button';

const features = [
  { title: 'Book with confidence', text: 'Send event or meal-prep requests in one place and avoid scheduling conflicts.' },
  { title: 'Menus that fit you', text: 'Browse dishes with dietary and allergen details so every guest can enjoy the meal.' },
  { title: 'Smarter meal planning', text: 'Get thoughtful dish suggestions shaped around your preferences and nutrition goals.' },
];

export default function Page() {
  const router = useRouter();
  const { setCurrentRole } = useAppState();

  const enterAsCustomer = () => {
    setCurrentRole('customer');
    router.push('/customer/inquiry');
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative flex min-h-[min(760px,92vh)] flex-col overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/background.webp')" }}>
        <div className="absolute inset-0 bg-brand/65" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-5 lg:px-10 lg:py-7">
          <header className="flex items-center justify-between">
            <img src="/logo.png" alt="CaterFlex" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push('/login')} className="border-on-dark/50 bg-card/90 text-card-foreground hover:bg-card">Sign in</Button>
              <Button onClick={() => router.push('/login')} className="bg-primary text-primary-foreground hover:bg-primary/90">Sign up</Button>
            </div>
          </header>
          <div className="flex flex-1 items-center py-12 lg:py-20">
            <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              <div className="max-w-2xl">
                <p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-on-dark-muted">Catering and meal-prep, made personal</p>
                <h1 className="font-heading text-5xl leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-8xl">Good food starts with a better plan.</h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-on-dark-muted sm:text-lg">CaterFlex helps you discover menus, plan memorable gatherings, and order meals that match your needs—all with a simple, organized experience.</p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Button onClick={enterAsCustomer} className="h-12 bg-primary px-7 text-primary-foreground hover:bg-primary/90">Plan your meal</Button>
                  <a href="#how-it-works" className="text-sm font-semibold text-on-dark underline decoration-on-dark/40 underline-offset-4 hover:text-foreground">See how it works</a>
                </div>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-on-dark/20 bg-card/20 shadow-2xl">
                <img src="/food-showcase.png" alt="A selection of catered dishes including grilled chicken, rice, vegetables, and salad" className="aspect-[4/3] w-full object-cover" />
                <div className="bg-card px-6 py-5 text-card-foreground"><p className="font-heading text-xl">Made for your table</p><p className="mt-1 text-sm leading-6 text-muted-foreground">From intimate meals to full celebrations.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="bg-card text-card-foreground"><div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">One place for every occasion</p><h2 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">From first idea to final plate.</h2><p className="mt-5 text-base leading-7 text-muted-foreground">Whether you are arranging a celebration or planning balanced meals for the week, CaterFlex keeps the details clear and the food at the center.</p></div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">{features.map((feature) => <article key={feature.title} className="border-t-2 border-primary pt-5"><h3 className="font-heading text-xl">{feature.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{feature.text}</p></article>)}</div>
      </div></section>
      <section className="border-t border-border bg-card text-card-foreground"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-10"><div><p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">Ready when you are</p><h2 className="mt-3 font-heading text-3xl sm:text-4xl">Let&apos;s plan something delicious.</h2></div><Button onClick={enterAsCustomer} className="h-12 w-fit bg-primary px-7 text-primary-foreground hover:bg-primary/90">Get started</Button></div></section>
    </main>
  );
}
