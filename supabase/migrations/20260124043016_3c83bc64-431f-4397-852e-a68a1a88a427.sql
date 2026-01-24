-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);