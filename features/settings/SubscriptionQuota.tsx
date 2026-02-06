'use client';

import React from 'react';
import { Box, Typography, LinearProgress, Button, Stack, Alert, Tooltip } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { STARTER_USER_LIMIT } from '@/features/auth/service';

type SubscriptionQuotaProps = {
  showUpgradeButton?: boolean;
  compact?: boolean;
};

export function SubscriptionQuota({ showUpgradeButton = true, compact = false }: SubscriptionQuotaProps) {
  const { session } = useSession();
  
  const subscriptionLevel = session?.subscriptionLevel || 'starter';
  const currentCount = session?.currentUserCount ?? 0;
  const limit = STARTER_USER_LIMIT;
  const isUnlimited = subscriptionLevel === 'unlimited';
  const isAtLimit = !isUnlimited && currentCount >= limit;
  const percentUsed = isUnlimited ? 0 : Math.min((currentCount / limit) * 100, 100);
  
  // Determine color based on usage
  const getProgressColor = () => {
    if (isUnlimited) return 'primary';
    if (percentUsed >= 100) return 'error';
    if (percentUsed >= 80) return 'warning';
    return 'primary';
  };

  if (compact) {
    return (
      <Tooltip 
        title={isUnlimited 
          ? 'Unlimited plan - no user limit' 
          : `${currentCount}/${limit} athletes used`
        }
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {isUnlimited ? '∞' : `${currentCount}/${limit}`}
          </Typography>
          {!isUnlimited && (
            <LinearProgress 
              variant="determinate" 
              value={percentUsed} 
              color={getProgressColor()}
              sx={{ width: 60, height: 6, borderRadius: 3 }}
            />
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 2, 
        bgcolor: isAtLimit ? 'error.light' : '#0A0A0A08', 
        borderRadius: 2,
        border: isAtLimit ? '1px solid' : 'none',
        borderColor: 'error.main',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={600}>
            Subscription: {isUnlimited ? 'Unlimited' : 'Starter'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isUnlimited ? 'Unlimited athletes' : `${currentCount} / ${limit} athletes`}
          </Typography>
        </Stack>
        
        {!isUnlimited && (
          <LinearProgress 
            variant="determinate" 
            value={percentUsed} 
            color={getProgressColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        )}
        
        {isAtLimit && (
          <Alert severity="warning" sx={{ py: 0.5 }}>
            You've reached your athlete limit. Upgrade to Unlimited to add more athletes.
          </Alert>
        )}
        
        {showUpgradeButton && !isUnlimited && (
          <Button 
            variant={isAtLimit ? 'contained' : 'outlined'}
            color={isAtLimit ? 'primary' : 'inherit'}
            size="small"
            href="mailto:support@myrecruiteragency.com?subject=Upgrade to Unlimited"
          >
            {isAtLimit ? 'Upgrade to Unlimited' : 'Contact us to Upgrade'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

/**
 * Hook to check if user can add more athletes
 */
export function useCanAddAthlete() {
  const { session } = useSession();
  
  const subscriptionLevel = session?.subscriptionLevel || 'starter';
  const currentCount = session?.currentUserCount ?? 0;
  const limit = STARTER_USER_LIMIT;
  
  const isUnlimited = subscriptionLevel === 'unlimited';
  const canAdd = isUnlimited || currentCount < limit;
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - currentCount);
  
  return {
    canAdd,
    remaining,
    currentCount,
    limit,
    isUnlimited,
    isAtLimit: !canAdd,
  };
}
