// Rive stride character animation — app loader, run countdown, territory capture celebration
'use client';

import React, { useState } from 'react';
import { useRive } from '@rive-app/react-canvas';

interface RiveStrideProps {
  // Name of the state machine to activate. When omitted, plays the default animation.
  stateMachine?: string;
  className?: string;
}

export function RiveStride({ stateMachine, className = '' }: RiveStrideProps): React.JSX.Element | null {
  const [loadError, setLoadError] = useState(false);

  const { RiveComponent } = useRive({
    src: '/animations/stride.riv',
    ...(stateMachine ? { stateMachines: stateMachine } : {}),
    autoplay: true,
    onLoadError: () => setLoadError(true),
  });

  if (loadError) return null;
  return <RiveComponent className={className} />;
}
