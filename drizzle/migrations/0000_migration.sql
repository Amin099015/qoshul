
-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  birth_date date,
  gender text,
  city text NOT NULL DEFAULT 'Bakı',
  avatar_url text,
  status text,
  school_name text, school_grade text,
  university text, faculty text, course text, degree text,
  work_field text, work_position text, company text, work_schedule text,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  interests text[] NOT NULL DEFAULT '{}',
  goals text[] NOT NULL DEFAULT '{}',
  personality_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  open_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  availability text[] NOT NULL DEFAULT '{}',
  group_size text, budget text,
  personality jsonb,
  moderation text NOT NULL DEFAULT 'ok',
  visibility jsonb NOT NULL DEFAULT '{"education":true,"work":true}'::jsonb,
  onboarded boolean NOT NULL DEFAULT false,
  xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Prevent users from editing xp / moderation directly
CREATE OR REPLACE FUNCTION public.protect_profile_fields() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('qoshul.internal', true) IS DISTINCT FROM 'on' AND auth.uid() IS NOT NULL THEN
    NEW.xp := OLD.xp;
    IF NEW.moderation <> OLD.moderation AND NEW.moderation <> 'review' THEN NEW.moderation := OLD.moderation; END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.add_xp(_user uuid, _amount int) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('qoshul.internal', 'on', true);
  UPDATE public.profiles SET xp = xp + _amount WHERE id = _user;
  PERFORM set_config('qoshul.internal', 'off', true);
END $$;
REVOKE EXECUTE ON FUNCTION public.add_xp(uuid, int) FROM PUBLIC, anon, authenticated;

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  host_name text NOT NULL DEFAULT '',
  title text NOT NULL,
  category text NOT NULL,
  image text NOT NULL DEFAULT 'friends',
  city text NOT NULL,
  location text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  starts_on date NOT NULL DEFAULT (now()::date),
  start_time text NOT NULL DEFAULT '18:00',
  capacity integer NOT NULL DEFAULT 10,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  age_limit text NOT NULL DEFAULT 'Hamı üçün',
  language text NOT NULL DEFAULT 'Azərbaycan dili',
  level text NOT NULL DEFAULT 'Hamı üçün',
  format text NOT NULL DEFAULT 'Oflayn',
  approval boolean NOT NULL DEFAULT false,
  recurring text NOT NULL DEFAULT 'Bir dəfəlik',
  tags text[] NOT NULL DEFAULT '{}',
  partner boolean NOT NULL DEFAULT false,
  is_sample boolean NOT NULL DEFAULT false,
  base_participants integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events readable" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events create own" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by AND is_sample = false);
CREATE POLICY "events update own" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by AND is_sample = false);
CREATE POLICY "events delete own" ON public.events FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TABLE public.event_participants (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.event_participants TO authenticated;
GRANT ALL ON public.event_participants TO service_role;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants readable" ON public.event_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "join self" ON public.event_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leave self" ON public.event_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.check_capacity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cap int; base int; cnt int;
BEGIN
  SELECT capacity, base_participants INTO cap, base FROM public.events WHERE id = NEW.event_id;
  SELECT count(*) INTO cnt FROM public.event_participants WHERE event_id = NEW.event_id;
  IF base + cnt >= cap THEN RAISE EXCEPTION 'Tədbirdə boş yer qalmayıb'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER participants_capacity BEFORE INSERT ON public.event_participants FOR EACH ROW EXECUTE FUNCTION public.check_capacity();

CREATE OR REPLACE FUNCTION public.xp_on_join() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE creator uuid;
BEGIN
  SELECT created_by INTO creator FROM public.events WHERE id = NEW.event_id;
  IF creator IS DISTINCT FROM NEW.user_id THEN PERFORM public.add_xp(NEW.user_id, 50); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER participants_xp AFTER INSERT ON public.event_participants FOR EACH ROW EXECUTE FUNCTION public.xp_on_join();

CREATE OR REPLACE FUNCTION public.xp_on_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    PERFORM public.add_xp(NEW.created_by, CASE WHEN NEW.partner THEN 150 ELSE 100 END);
    INSERT INTO public.event_participants (event_id, user_id) VALUES (NEW.id, NEW.created_by) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER events_xp AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.xp_on_event();

CREATE TABLE public.saved_events (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  PRIMARY KEY (event_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_events TO authenticated;
GRANT ALL ON public.saved_events TO service_role;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved own" ON public.saved_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews readable" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "review if joined" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.event_participants p WHERE p.event_id = reviews.event_id AND p.user_id = auth.uid()));
CREATE OR REPLACE FUNCTION public.xp_on_review() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.add_xp(NEW.user_id, 20); RETURN NEW; END $$;
CREATE TRIGGER reviews_xp AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.xp_on_review();

-- Friendships
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester uuid NOT NULL,
  addressee uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester, addressee)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friendship parties read" ON public.friendships FOR SELECT TO authenticated USING (auth.uid() IN (requester, addressee));
CREATE POLICY "friendship request" ON public.friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester AND status = 'pending' AND requester <> addressee);
CREATE POLICY "friendship respond" ON public.friendships FOR UPDATE TO authenticated USING (auth.uid() = addressee) WITH CHECK (auth.uid() = addressee AND status IN ('accepted','declined'));
CREATE POLICY "friendship remove" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() IN (requester, addressee));

-- Messages (event group chat or friend chat)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  friendship_id uuid REFERENCES public.friendships(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  sender_name text NOT NULL DEFAULT '',
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((event_id IS NULL) <> (friendship_id IS NULL))
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.can_access_chat(_event uuid, _friendship uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN _event IS NOT NULL THEN EXISTS (SELECT 1 FROM public.event_participants WHERE event_id = _event AND user_id = auth.uid())
    ELSE EXISTS (SELECT 1 FROM public.friendships WHERE id = _friendship AND status = 'accepted' AND auth.uid() IN (requester, addressee))
  END
$$;
CREATE POLICY "chat read" ON public.messages FOR SELECT TO authenticated USING (public.can_access_chat(event_id, friendship_id));
CREATE POLICY "chat write" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.can_access_chat(event_id, friendship_id));
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Match cache
CREATE TABLE public.match_cache (
  user_id uuid PRIMARY KEY,
  people jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_cache TO authenticated;
GRANT ALL ON public.match_cache TO service_role;
ALTER TABLE public.match_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own matches" ON public.match_cache FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Safe public cards for other users
CREATE OR REPLACE FUNCTION public.public_profile_cards(_ids uuid[] DEFAULT NULL)
RETURNS TABLE (id uuid, first_name text, last_name text, city text, avatar_url text, status text, school_name text, university text, faculty text, work_field text, interests text[], goals text[], languages jsonb, personality_type text, personality_summary text, is_minor boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.first_name, left(p.last_name, 1) || '.', p.city, p.avatar_url, p.status,
    CASE WHEN (p.visibility->>'education')::boolean THEN p.school_name END,
    CASE WHEN (p.visibility->>'education')::boolean THEN p.university END,
    CASE WHEN (p.visibility->>'education')::boolean THEN p.faculty END,
    CASE WHEN (p.visibility->>'work')::boolean THEN p.work_field END,
    p.interests, p.goals, p.languages, p.personality->>'type', p.personality->>'summary',
    (p.birth_date IS NOT NULL AND p.birth_date > (now() - interval '18 years')::date)
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.onboarded AND p.moderation = 'ok'
    AND (_ids IS NULL OR p.id = ANY(_ids))
$$;
REVOKE EXECUTE ON FUNCTION public.public_profile_cards(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.public_profile_cards(uuid[]) TO authenticated;

-- Candidate prefilter for AI matching (same age group; same city or shared interests)
CREATE OR REPLACE FUNCTION public.match_candidates()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH me AS (SELECT * FROM public.profiles WHERE id = auth.uid())
  SELECT p.id FROM public.profiles p, me
  WHERE p.id <> me.id AND p.onboarded AND p.moderation = 'ok'
    AND ((p.birth_date > (now() - interval '18 years')::date) IS NOT DISTINCT FROM (me.birth_date > (now() - interval '18 years')::date))
    AND (p.city = me.city OR p.interests && me.interests)
  ORDER BY (p.city = me.city) DESC, cardinality(ARRAY(SELECT unnest(p.interests) INTERSECT SELECT unnest(me.interests))) DESC
  LIMIT 20
$$;
REVOKE EXECUTE ON FUNCTION public.match_candidates() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_candidates() TO authenticated;

-- Participant counts
CREATE OR REPLACE FUNCTION public.event_counts()
RETURNS TABLE (event_id uuid, joined bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT event_id, count(*) FROM public.event_participants GROUP BY event_id
$$;
REVOKE EXECUTE ON FUNCTION public.event_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.event_counts() TO authenticated;

-- Sample events
INSERT INTO public.events (host_name, title, category, image, city, location, lat, lng, starts_on, start_time, capacity, base_participants, description, price, level, is_sample) VALUES
('Rəşad Əliyev','İşdən sonra padel oynayaq','Padel','padel','Bakı','Baku Padel, Ağ Şəhər',40.3786,49.8906,current_date,'19:00',8,5,'Günü hərəkət və yeni tanışlıqlarla bitirək! Təcrübən olmasa da, qoşula bilərsən. Raketləri məkan verir.',15,'Başlanğıc',true),
('Leyla Məmmədova','Bir fincan qəhvə, yeni dostlar','Qəhvə','coffee','Bakı','Coffee Moffie, Nizami küçəsi',40.3777,49.8432,current_date,'18:30',10,4,'Qəhvə sevənlər üçün səmimi görüş. Hobbilərimizdən, şəhərdən və həyatın kiçik sevinclərindən danışacağıq.',0,'Hamı üçün',true),
('Orxan Həsənov','Süni intellekt və yeni ideyalar','Süni intellekt','tech','Bakı','SABAH.HUB, Bakı',40.3725,49.8533,current_date + 1,'14:00',16,10,'Süni intellekt, yeni layihələr və texnologiya haqqında rahat söhbət. Öz ideyanı gətir.',0,'Hamı üçün',true),
('Nigar Quliyeva','Bulvarda günbatımı gəzintisi','Şəhər turu','friends','Bakı','Dənizkənarı Milli Park',40.3667,49.8458,current_date + 1,'17:30',12,6,'Bakının gözəl günbatımını birlikdə izləyək. Yüngül gəzinti və maraqlı söhbətlər.',0,'Hamı üçün',true);

INSERT INTO public.events (host_name, title, category, image, city, location, lat, lng, starts_on, start_time, capacity, base_participants, description, is_sample)
SELECT t.host, replace(t.title, '{c}', c.name), t.category, t.image, c.name, t.place || ', ' || c.name, c.lat + t.dlat, c.lng + t.dlng, current_date + t.days, t.tm, t.cap, 2 + (c.n % 4), t.descr, true
FROM (VALUES
 (1,'Sumqayıt',40.5897,49.6686),(2,'Xırdalan',40.4481,49.7553),(3,'Xızı',40.9108,49.0747),(4,'Gəncə',40.6828,46.3606),(5,'Göygöl',40.5856,46.3189),(6,'Daşkəsən',40.5203,46.0778),(7,'Goranboy',40.6103,46.7897),(8,'Samux',40.7647,46.4086),(9,'Mingəçevir',40.7703,47.0489),(10,'Yevlax',40.6172,47.15),(11,'Ağdaş',40.6503,47.4761),(12,'Göyçay',40.6531,47.7406),(13,'Ucar',40.5186,47.6542),(14,'Zərdab',40.2183,47.7083),(15,'Kürdəmir',40.3456,48.1608),(16,'Şirvan',39.9319,48.9203),(17,'Salyan',39.5961,48.9847),(18,'Neftçala',39.3586,49.2469),(19,'Hacıqabul',40.0386,48.9403),(20,'Şəki',41.1919,47.1706),(21,'Zaqatala',41.6336,46.6433),(22,'Qax',41.4228,46.9242),(23,'Balakən',41.7261,46.4083),(24,'Oğuz',41.0728,47.4653),(25,'Qəbələ',40.9814,47.8458),(26,'Quba',41.3611,48.5133),(27,'Qusar',41.4275,48.4303),(28,'Xaçmaz',41.4636,48.8061),(29,'Siyəzən',41.0781,49.1119),(30,'Şabran',41.2158,48.9867),(31,'Şamaxı',40.6303,48.6414),(32,'İsmayıllı',40.7872,48.1519),(33,'Ağsu',40.5703,48.3994),(34,'Qobustan',40.5325,48.9264),(35,'Lənkəran',38.7529,48.8475),(36,'Astara',38.4561,48.875),(37,'Lerik',38.7739,48.4153),(38,'Yardımlı',38.9058,48.2403),(39,'Masallı',39.0342,48.6658),(40,'Cəlilabad',39.2089,48.4986),(41,'Sabirabad',40.0128,48.4789),(42,'Saatlı',39.9322,48.3689),(43,'İmişli',39.8697,48.06),(44,'Beyləqan',39.7756,47.6186),(45,'Biləsuvar',39.4583,48.545),(46,'Bərdə',40.3747,47.1264),(47,'Ağcabədi',40.0528,47.4597),(48,'Tərtər',40.3419,46.9325),(49,'Ağdam',39.9911,46.9278),(50,'Füzuli',39.6008,47.1431),(51,'Xankəndi',39.8153,46.7519),(52,'Şuşa',39.7608,46.7517),(53,'Xocalı',39.9131,46.7903),(54,'Xocavənd',39.795,47.1128),(55,'Ağdərə',40.2117,46.8156),(56,'Laçın',39.6408,46.5469),(57,'Kəlbəcər',40.1036,46.0367),(58,'Qubadlı',39.3439,46.5797),(59,'Zəngilan',39.0858,46.6525),(60,'Cəbrayıl',39.3992,47.0264),(61,'Qazax',41.0933,45.3661),(62,'Ağstafa',41.1189,45.4539),(63,'Tovuz',40.9922,45.6289),(64,'Şəmkir',40.8297,46.0189),(65,'Gədəbəy',40.57,45.8106),(66,'Naftalan',40.5067,46.825),(67,'Naxçıvan',39.2089,45.4122),(68,'Ordubad',38.9086,46.0228),(69,'Culfa',38.9558,45.6308),(70,'Şərur',39.5536,44.9847),(71,'Babək',39.15,45.4486),(72,'Kəngərli',39.3881,45.1639),(73,'Sədərək',39.7172,44.8836),(74,'Şahbuz',39.4072,45.5739)
) AS c(n, name, lat, lng)
CROSS JOIN (VALUES
 ('{c} gəncləri ilə qəhvə və tanışlıq','Qəhvə','coffee','Mərkəzi kafe','18:00',0,10,-0.003,0.003,'Aysel İsmayılova','Şəhərin gənclərini bir masa ətrafında toplayırıq. Səmimi söhbət, yeni dostlar və isti qəhvə.'),
 ('{c} gəncləri ilə mini futbol','Futbol','padel','Şəhər stadionu','19:30',1,14,0.004,-0.004,'Rəşad Əliyev','Mini futbol oyunu üçün komanda yığırıq. Səviyyə önəmli deyil, əsas olan hərəkət və əyləncədir.')
) AS t(title, category, image, place, tm, days, cap, dlat, dlng, host, descr);
