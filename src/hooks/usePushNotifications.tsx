import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { VAPID_PUBLIC_KEY } from '@/lib/push-config';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<PushPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      const currentPermission = Notification.permission as PushPermission;
      console.log('[Push] Initial permission state:', currentPermission);
      setPermission(currentPermission);
    } else {
      setPermission('unsupported');
    }
  }, []);

  // Register service worker and check subscription status
  useEffect(() => {
    if (!isSupported || !user) return;

    const registerSW = async () => {
      try {
        // Force update the service worker
        const reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        console.log('[Push] Service Worker registered:', reg);
        
        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('[Push] Service Worker ready');
        
        setRegistration(reg);

        // Check if already subscribed
        const subscription = await reg.pushManager.getSubscription();
        console.log('[Push] Existing subscription:', !!subscription);
        setIsSubscribed(!!subscription);
        
        // Re-check permission after SW registration
        const currentPermission = Notification.permission as PushPermission;
        console.log('[Push] Permission after SW ready:', currentPermission);
        setPermission(currentPermission);
      } catch (error) {
        console.error('[Push] Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, [isSupported, user]);

  const subscribe = useCallback(async () => {
    console.log('[Push] Subscribe called', { 
      hasRegistration: !!registration, 
      hasUser: !!user, 
      hasVapidKey: !!VAPID_PUBLIC_KEY,
      vapidKeyLength: VAPID_PUBLIC_KEY?.length,
      currentPermission: Notification.permission
    });
    
    if (!registration || !user) {
      console.error('[Push] Missing registration or user');
      return false;
    }
    
    if (!VAPID_PUBLIC_KEY) {
      console.error('[Push] VAPID_PUBLIC_KEY is empty! Check src/lib/push-config.ts');
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission
      console.log('[Push] Requesting permission...');
      const permissionResult = await Notification.requestPermission();
      console.log('[Push] Permission result:', permissionResult);
      setPermission(permissionResult as PushPermission);

      if (permissionResult !== 'granted') {
        console.log('[Push] Notification permission not granted:', permissionResult);
        setIsLoading(false);
        return false;
      }

      // Subscribe to push
      console.log('[Push] Creating push subscription...');
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      console.log('[Push] Push subscription created:', subscription.endpoint);

      // Extract keys
      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh;
      const auth = subscriptionJson.keys?.auth;

      if (!p256dh || !auth) {
        throw new Error('Missing subscription keys');
      }

      // Save to database
      console.log('[Push] Saving subscription to database...');
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        console.error('[Push] Error saving subscription:', error);
        throw error;
      }

      console.log('[Push] Subscription saved successfully!');
      setIsSubscribed(true);
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('[Push] Error subscribing to push:', error);
      setIsLoading(false);
      return false;
    }
  }, [registration, user]);

  const unsubscribe = useCallback(async () => {
    if (!registration || !user) return false;

    setIsLoading(true);

    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      setIsLoading(false);
      return false;
    }
  }, [registration, user]);

  // Force refresh permission state
  const refreshPermission = useCallback(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission as PushPermission;
      console.log('[Push] Refreshing permission state:', currentPermission);
      setPermission(currentPermission);
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    refreshPermission
  };
}
