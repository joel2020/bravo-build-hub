-- Roles enum + table for admin moderation
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Blog comments
CREATE TABLE public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  body TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_comments_slug_approved ON public.blog_comments (post_slug, approved, created_at DESC);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Public can read only approved comments
CREATE POLICY "Anyone can read approved comments"
ON public.blog_comments FOR SELECT
TO anon, authenticated
USING (approved = true);

-- Admins can read all (for moderation)
CREATE POLICY "Admins can read all comments"
ON public.blog_comments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can submit (with validation)
CREATE POLICY "Anyone can submit comments"
ON public.blog_comments FOR INSERT
TO anon, authenticated
WITH CHECK (
  approved = false
  AND length(author_name) BETWEEN 1 AND 80
  AND length(author_email) BETWEEN 3 AND 255
  AND author_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(body) BETWEEN 2 AND 2000
  AND length(post_slug) BETWEEN 1 AND 200
);

-- Admins can update (approve) and delete
CREATE POLICY "Admins can update comments"
ON public.blog_comments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete comments"
ON public.blog_comments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));