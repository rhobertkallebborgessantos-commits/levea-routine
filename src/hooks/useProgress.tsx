import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface WeightLog {
  id: string;
  weight: number;
  date: string;
  notes: string | null;
  created_at: string;
}

interface BodyMeasurement {
  id: string;
  date: string;
  chest: number | null;
  waist: number | null;
  hip: number | null;
  arm: number | null;
  thigh: number | null;
  notes: string | null;
}

interface ProgressPhoto {
  id: string;
  date: string;
  photo_url: string;
  photo_type: string | null;
  notes: string | null;
}

export function useProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch weight logs (last 30 days)
  const { data: weightLogs = [], isLoading: loadingWeight } = useQuery({
    queryKey: ['weight-logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true });
      if (error) throw error;
      return data as WeightLog[];
    },
    enabled: !!user,
  });

  // Fetch body measurements
  const { data: measurements = [], isLoading: loadingMeasurements } = useQuery({
    queryKey: ['body-measurements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as BodyMeasurement[];
    },
    enabled: !!user,
  });

  // Fetch progress photos
  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as ProgressPhoto[];
    },
    enabled: !!user,
  });

  // Add weight log
  const addWeightMutation = useMutation({
    mutationFn: async ({ weight, notes }: { weight: number; notes?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('weight_logs').insert({
        user_id: user.id,
        weight,
        notes: notes || null,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
      toast.success('Peso registrado!');
    },
    onError: () => {
      toast.error('Erro ao registrar peso');
    },
  });

  // Add body measurement
  const addMeasurementMutation = useMutation({
    mutationFn: async (measurement: Omit<BodyMeasurement, 'id' | 'date'>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('body_measurements').insert({
        user_id: user.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        ...measurement,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-measurements'] });
      toast.success('Medidas registradas!');
    },
    onError: () => {
      toast.error('Erro ao registrar medidas');
    },
  });

  // Upload and add progress photo
  const addPhotoMutation = useMutation({
    mutationFn: async ({ file, photoType, notes }: { file: File; photoType: string; notes?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);
      
      const { error: dbError } = await supabase.from('progress_photos').insert({
        user_id: user.id,
        photo_url: urlData.publicUrl,
        photo_type: photoType,
        notes: notes || null,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast.success('Foto adicionada!');
    },
    onError: () => {
      toast.error('Erro ao adicionar foto');
    },
  });

  // Delete photo
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast.success('Foto removida');
    },
    onError: () => {
      toast.error('Erro ao remover foto');
    },
  });

  // Calculate stats
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null;
  const firstWeight = weightLogs.length > 0 ? weightLogs[0].weight : null;
  const weightChange = latestWeight && firstWeight ? latestWeight - firstWeight : null;

  // Chart data for weight
  const weightChartData = weightLogs.map((log) => ({
    date: format(parseISO(log.date), 'dd/MM', { locale: ptBR }),
    peso: log.weight,
  }));

  // Chart data for measurements (latest vs first)
  const latestMeasurement = measurements[0];
  const oldestMeasurement = measurements[measurements.length - 1];

  return {
    weightLogs,
    measurements,
    photos,
    isLoading: loadingWeight || loadingMeasurements || loadingPhotos,
    addWeight: addWeightMutation.mutate,
    addMeasurement: addMeasurementMutation.mutate,
    addPhoto: addPhotoMutation.mutate,
    deletePhoto: deletePhotoMutation.mutate,
    isAddingWeight: addWeightMutation.isPending,
    isAddingMeasurement: addMeasurementMutation.isPending,
    isAddingPhoto: addPhotoMutation.isPending,
    latestWeight,
    weightChange,
    weightChartData,
    latestMeasurement,
    oldestMeasurement,
  };
}
