import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeightTracker } from '@/components/progress/WeightTracker';
import { MeasurementsTracker } from '@/components/progress/MeasurementsTracker';
import { PhotoGallery } from '@/components/progress/PhotoGallery';
import { useProgress } from '@/hooks/useProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/BottomNav';

export default function Progress() {
  const navigate = useNavigate();
  const {
    isLoading,
    photos,
    addWeight,
    addMeasurement,
    addPhoto,
    deletePhoto,
    isAddingWeight,
    isAddingMeasurement,
    isAddingPhoto,
    latestWeight,
    weightChange,
    weightChartData,
    latestMeasurement,
    oldestMeasurement,
  } = useProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Meu Progresso</h1>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6 pb-24">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <WeightTracker
              chartData={weightChartData}
              latestWeight={latestWeight}
              weightChange={weightChange}
              onAddWeight={addWeight}
              isAdding={isAddingWeight}
            />

            <MeasurementsTracker
              latestMeasurement={latestMeasurement}
              oldestMeasurement={oldestMeasurement}
              onAddMeasurement={addMeasurement}
              isAdding={isAddingMeasurement}
            />

            <PhotoGallery
              photos={photos}
              onAddPhoto={addPhoto}
              onDeletePhoto={deletePhoto}
              isAdding={isAddingPhoto}
            />
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
