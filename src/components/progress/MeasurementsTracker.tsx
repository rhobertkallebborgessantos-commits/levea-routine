import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Ruler, Plus, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Measurement {
  id: string;
  date: string;
  chest: number | null;
  waist: number | null;
  hip: number | null;
  arm: number | null;
  thigh: number | null;
  notes: string | null;
}

interface MeasurementsTrackerProps {
  latestMeasurement: Measurement | undefined;
  oldestMeasurement: Measurement | undefined;
  onAddMeasurement: (data: Omit<Measurement, 'id' | 'date'>) => void;
  isAdding: boolean;
}

const measurementFields = [
  { key: 'chest', label: 'Peito', icon: '🫁' },
  { key: 'waist', label: 'Cintura', icon: '📏' },
  { key: 'hip', label: 'Quadril', icon: '🍑' },
  { key: 'arm', label: 'Braço', icon: '💪' },
  { key: 'thigh', label: 'Coxa', icon: '🦵' },
] as const;

export function MeasurementsTracker({
  latestMeasurement,
  oldestMeasurement,
  onAddMeasurement,
  isAdding,
}: MeasurementsTrackerProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({
    chest: '',
    waist: '',
    hip: '',
    arm: '',
    thigh: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMeasurement({
      chest: values.chest ? parseFloat(values.chest) : null,
      waist: values.waist ? parseFloat(values.waist) : null,
      hip: values.hip ? parseFloat(values.hip) : null,
      arm: values.arm ? parseFloat(values.arm) : null,
      thigh: values.thigh ? parseFloat(values.thigh) : null,
      notes: null,
    });
    setValues({ chest: '', waist: '', hip: '', arm: '', thigh: '' });
    setOpen(false);
  };

  const getDifference = (key: keyof Measurement) => {
    if (!latestMeasurement || !oldestMeasurement) return null;
    const latest = latestMeasurement[key] as number | null;
    const oldest = oldestMeasurement[key] as number | null;
    if (latest === null || oldest === null) return null;
    return latest - oldest;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Medidas Corporais
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Registrar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Medidas</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {measurementFields.map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={field.key} className="text-sm">
                        {field.icon} {field.label} (cm)
                      </Label>
                      <Input
                        id={field.key}
                        type="number"
                        step="0.1"
                        placeholder="--"
                        value={values[field.key]}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [field.key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button type="submit" className="w-full" disabled={isAdding}>
                  {isAdding ? 'Salvando...' : 'Salvar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {latestMeasurement ? (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Última medição:{' '}
                {format(parseISO(latestMeasurement.date), "dd 'de' MMM", { locale: ptBR })}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {measurementFields.map((field) => {
                  const value = latestMeasurement[field.key as keyof Measurement] as
                    | number
                    | null;
                  const diff = getDifference(field.key as keyof Measurement);
                  return (
                    <div
                      key={field.key}
                      className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground">{field.label}</p>
                        <p className="text-lg font-semibold">
                          {value !== null ? `${value} cm` : '--'}
                        </p>
                      </div>
                      {diff !== null && (
                        <div
                          className={`flex items-center gap-0.5 text-xs ${
                            diff < 0
                              ? 'text-green-500'
                              : diff > 0
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {diff < 0 ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : diff > 0 ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {Math.abs(diff).toFixed(1)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Registre suas medidas para acompanhar a evolução
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
