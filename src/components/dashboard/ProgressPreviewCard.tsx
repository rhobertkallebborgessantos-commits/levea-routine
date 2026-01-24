import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Scale, ChevronRight, TrendingDown, Minus, Camera } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProgress } from '@/hooks/useProgress';

export function ProgressPreviewCard() {
  const navigate = useNavigate();
  const { latestWeight, weightChange, photos, isLoading } = useProgress();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card
        className="border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => navigate('/progress')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Meu Progresso
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Weight */}
            <div className="flex-1 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Peso atual</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {latestWeight ? `${latestWeight} kg` : '--'}
              </p>
              {weightChange !== null && (
                <div className="flex items-center gap-1 mt-0.5">
                  {weightChange < 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  ) : weightChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-amber-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span
                    className={`text-xs ${
                      weightChange < 0
                        ? 'text-green-500'
                        : weightChange > 0
                        ? 'text-amber-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {weightChange > 0 ? '+' : ''}
                    {weightChange.toFixed(1)} kg
                  </span>
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="flex-1 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Fotos</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{photos.length}</p>
              <span className="text-xs text-muted-foreground">registradas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
