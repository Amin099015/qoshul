import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: '/auth', search: { redirect: location.pathname } });
    if (location.pathname !== '/onboarding') {
      const { data: p } = await supabase.from('profiles').select('onboarded').eq('id', data.user.id).maybeSingle();
      if (!p?.onboarded) throw redirect({ to: '/onboarding' });
    }
  },
  component: () => <Outlet />,
});
