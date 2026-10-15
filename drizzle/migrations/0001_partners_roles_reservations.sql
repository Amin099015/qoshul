CREATE TYPE public.app_role AS ENUM ('admin','partner','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  voen text NOT NULL CHECK (voen ~ '^[0-9]{10}$'),
  categories text[] NOT NULL DEFAULT '{}',
  city text NOT NULL DEFAULT 'Bakı',
  address text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  phone text NOT NULL DEFAULT '',
  hours text NOT NULL DEFAULT '',
  deal text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT 'coffee',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX partners_owner_unique ON public.partners(owner_id) WHERE owner_id IS NOT NULL;
GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved partners public" ON public.partners FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "owner reads partner" ON public.partners FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owner registers partner" ON public.partners FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND is_sample = false);
CREATE POLICY "owner updates partner" ON public.partners FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id AND is_sample = false);

CREATE OR REPLACE FUNCTION public.protect_partner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN NEW.status := 'pending';
    ELSE NEW.status := OLD.status; NEW.voen := OLD.voen; END IF;
  END IF;
  IF TG_OP = 'INSERT' AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.owner_id, 'partner') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER partners_protect BEFORE INSERT OR UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.protect_partner();

CREATE OR REPLACE FUNCTION public.owns_partner(_partner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partners WHERE id = _partner AND owner_id = auth.uid())
$$;

ALTER TABLE public.events ADD COLUMN partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL;

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  event_id uuid NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  organizer_name text NOT NULL DEFAULT '',
  people integer NOT NULL DEFAULT 2,
  starts_on date NOT NULL,
  start_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organizer reads reservation" ON public.reservations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "partner reads reservations" ON public.reservations FOR SELECT TO authenticated USING (public.owns_partner(partner_id));
CREATE POLICY "partner answers reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.owns_partner(partner_id)) WITH CHECK (public.owns_partner(partner_id) AND status IN ('confirmed','declined'));

CREATE OR REPLACE FUNCTION public.events_partner_flag()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.partners WHERE id = NEW.partner_id AND status = 'approved') THEN
    NEW.partner_id := NULL;
  END IF;
  NEW.partner := NEW.partner_id IS NOT NULL;
  RETURN NEW;
END $$;
CREATE TRIGGER events_partner_flag BEFORE INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.events_partner_flag();

CREATE OR REPLACE FUNCTION public.reservation_on_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.partner_id IS NOT NULL AND NEW.created_by IS NOT NULL THEN
    INSERT INTO public.reservations (partner_id, event_id, user_id, organizer_name, people, starts_on, start_time)
    VALUES (NEW.partner_id, NEW.id, NEW.created_by, NEW.host_name, NEW.capacity, NEW.starts_on, NEW.start_time)
    ON CONFLICT (event_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER events_reservation AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.reservation_on_event();

GRANT SELECT ON public.events TO anon;
CREATE POLICY "events public read" ON public.events FOR SELECT TO anon USING (true);
GRANT EXECUTE ON FUNCTION public.event_counts() TO anon;

INSERT INTO public.partners (name, voen, categories, city, address, lat, lng, phone, hours, deal, description, image, status, is_sample) VALUES
('Coffee Moffie','1000000001',ARRAY['Qəhvə','Çay söhbəti','Səhər yeməyi','Kitab klubu','Dil mübadiləsi','Networking','Stolüstü oyunlar'],'Bakı','Nizami küçəsi, Bakı',40.3777,49.8432,'+994 12 000 00 01','09:00–23:00','20% endirim 14:00–17:00','Söhbət və tanışlıq üçün rahat kafe.','coffee','approved',true),
('Baku Padel','1000000002',ARRAY['Padel','Tennis','Stolüstü tennis','Fitnes'],'Bakı','Ağ Şəhər, Bakı',40.3786,49.8906,'+994 12 000 00 02','08:00–24:00','15% endirim qrup oyunlarına','Qapalı padel meydançaları.','padel','approved',true),
('SABAH.HUB','1000000003',ARRAY['Süni intellekt','Proqramlaşdırma','Startap','Hakaton','Seminar','Mühazirə','Dizayn','Karyera','Sahibkarlıq'],'Bakı','Ü. Hacıbəyov küçəsi, Bakı',40.3725,49.8533,'+994 12 000 00 03','10:00–20:00','Tələbələrə pulsuz zal','Gənclər üçün innovasiya mərkəzi.','tech','approved',true),
('Muğam Lounge','1000000004',ARRAY['Konsert','Muğam','Caz','Karaoke','Şam yeməyi','Poeziya gecəsi'],'Bakı','İçərişəhər, Bakı',40.3667,49.8352,'+994 12 000 00 04','12:00–01:00','Qruplara 10% endirim','Canlı musiqi və milli mətbəx.','friends','approved',true),
('Gəncə Kitab Kafe','1000000005',ARRAY['Qəhvə','Kitab klubu','Stolüstü oyunlar','Kviz','Mafiya','Dil mübadiləsi'],'Gəncə','Cavad xan küçəsi, Gəncə',40.6828,46.3606,'+994 22 000 00 05','09:00–22:00','Tələbələrə 15% endirim','Kitab və qəhvə məkanı.','coffee','approved',true),
('Sumqayıt Sport Arena','1000000006',ARRAY['Futbol','Basketbol','Voleybol','Fitnes','Üzgüçülük'],'Sumqayıt','Sülh küçəsi, Sumqayıt',40.5897,49.6686,'+994 18 000 00 06','08:00–23:00','Komandalara 20% endirim','Çoxfunksiyalı idman kompleksi.','padel','approved',true);