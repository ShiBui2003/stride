// Opt-in row that lets the user enable or disable push notifications for this device
'use client';

import React from 'react';
import { BellRinging, BellSlash } from '@phosphor-icons/react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushOptInProps {
  userId: string | undefined;
}

export function PushOptIn({ userId }: PushOptInProps): React.JSX.Element | null {
  const { supported, enabled, loading, error, enable, disable } = usePushNotifications(userId);

  // Hide entirely on browsers that can't do Web Push rather than show a dead control
  if (!supported) return null;

  return (
    <div className="bg-surface rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-3">
      <div className="mt-0.5 flex-shrink-0">
        {enabled ? (
          <BellRinging size={18} weight="fill" className="text-accent" />
        ) : (
          <BellSlash size={18} className="text-textSecondary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading font-bold text-textPrimary text-sm">Push notifications</p>
        <p className="text-textSecondary font-body text-xs mt-0.5">
          {error ?? (enabled ? 'On for this device' : 'Get alerts when territory is at risk')}
        </p>
      </div>
      <button
        onClick={() => { void (enabled ? disable() : enable()); }}
        disabled={loading}
        className={`flex-shrink-0 font-heading font-bold text-xs px-4 py-2 rounded-lg active:scale-95 transition-transform disabled:opacity-50 ${
          enabled ? 'bg-background text-textSecondary' : 'bg-accent text-background'
        }`}
      >
        {loading ? '…' : enabled ? 'Turn off' : 'Turn on'}
      </button>
    </div>
  );
}
