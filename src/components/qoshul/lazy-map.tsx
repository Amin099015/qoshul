import { lazy, Suspense, useEffect, useState, type ComponentProps } from 'react';
const EventMap = lazy(() => import('./event-map'));
export function LazyMap(props: ComponentProps<typeof EventMap>) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const fallback = <div className="event-map map-loading">Xəritə yüklənir...</div>;
  if (!ready) return fallback;
  return <Suspense fallback={fallback}><EventMap {...props} /></Suspense>;
}
