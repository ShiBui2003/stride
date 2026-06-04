// Rive stride character animation — used as app loader and territory capture celebration
'use client';

import { useRive } from '@rive-app/react-canvas';

interface RiveStrideProps {
  stateMachine?: string;
  className?: string;
}

export function RiveStride({ stateMachine = 'State Machine 1', className = '' }: RiveStrideProps) {
  const { RiveComponent } = useRive({
    src: '/animations/stride.riv',
    stateMachines: stateMachine,
    autoplay: true,
  });

  return <RiveComponent className={className} />;
}
