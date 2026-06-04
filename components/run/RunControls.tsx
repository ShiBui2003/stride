// Bottom sheet controls for pausing and ending an active run
'use client';

import React from 'react';
import { Pause, Play, StopCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface RunControlsProps {
  onPause: () => void;
  onStop: () => void;
  isPaused?: boolean;
}

export function RunControls({ onPause, onStop, isPaused = false }: RunControlsProps): React.JSX.Element {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 pt-8 bg-gradient-to-t from-background/95 to-transparent">
      <div className="flex gap-3 max-w-sm mx-auto">
        <Button variant="ghost" size="lg" className="flex-1" onClick={onPause}>
          {isPaused ? <Play size={20} weight="fill" /> : <Pause size={20} weight="fill" />}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="danger" size="lg" className="flex-1" onClick={onStop}>
          <StopCircle size={20} weight="fill" />
          End Run
        </Button>
      </div>
    </div>
  );
}
