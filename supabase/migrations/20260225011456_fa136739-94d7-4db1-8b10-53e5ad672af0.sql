
-- Create notifications table for real-time attendance notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'attendance',
  read BOOLEAN NOT NULL DEFAULT false,
  subject_name TEXT,
  status TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Students can view their own notifications
CREATE POLICY "Students can view own notifications"
ON public.notifications FOR SELECT
USING (student_id = auth.uid());

-- Students can update their own notifications (mark as read)
CREATE POLICY "Students can update own notifications"
ON public.notifications FOR UPDATE
USING (student_id = auth.uid());

-- Admins can manage all notifications
CREATE POLICY "Admins can manage notifications"
ON public.notifications FOR ALL
USING (public.is_admin());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
