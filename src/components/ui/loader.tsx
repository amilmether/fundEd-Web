"use client";

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  text?: string;
}

export function Loader({ className, text }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}
