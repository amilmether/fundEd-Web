'use client';

import { Logo } from '@/components/icons';

export function BrandedLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-16 w-16 text-primary" />
        <div className="flex items-center gap-2">
            <h1 className="text-3xl font-headline font-bold text-primary animate-pulse">FundEd</h1>
        </div>
      </div>
      <div className="absolute bottom-8 text-center text-sm text-muted-foreground">
        <p>A Sub Product of SKSDM</p>
      </div>
    </div>
  );
}