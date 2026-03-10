import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, TrendingDown, TrendingUp, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeightTrackerProps {
  chartData: { date: string; peso: number }[];
  latestWeight: number | null;
  weightChange: number | null;
  onAddWeight: (data: { weight: number; notes?: string }) => void;
  isAdding: boolean;
}

export function WeightTracker({
  chartData,
  latestWeight,
  weightChange,
  onAddWeight,
  isAdding,
}: WeightTrackerProps) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // TEMP: Mock data for screenshot
  const mockChartData = [
    { date: '10/02', peso: 78.0 },
    { date: '13/02', peso: 77.6 },
    { date: '16/02', peso: 77.8 },
    { date: '19/02', peso: 77.2 },
    { date: '22/02', peso: 76.8 },
    { date: '25/02', peso: 76.5 },
    { date: '28/02', peso: 76.0 },
    { date: '03/03', peso: 75.7 },
    { date: '06/03', peso: 75.3 },
    { date: '09/03', peso: 74.8 },
    { date: '10/03', peso: 74.5 },
  ];

  const displayData = chartData.length > 1 ? chartData : mockChartData;
  const displayWeight = latestWeight ?? 74.5;
  const displayChange = weightChange ?? -3.5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    onAddWeight({ weight: parseFloat(weight), notes: notes || undefined });
    setWeight('');
    setNotes('');
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Peso
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
                <DialogTitle>Registrar Peso</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Como você está se sentindo?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isAdding}>
                  {isAdding ? 'Salvando...' : 'Salvar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Current Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Atual</p>
              <p className="text-2xl font-bold text-foreground">
                {displayWeight ? `${displayWeight} kg` : '--'}
              </p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Variação (30 dias)</p>
              <div className="flex items-center gap-1">
                {weightChange !== null && (
                  <>
                    {weightChange < 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : weightChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={`text-lg font-semibold ${
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
                  </>
                )}
                {weightChange === null && (
                  <span className="text-lg font-semibold text-muted-foreground">--</span>
                )}
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 1 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Registre seu peso para ver o gráfico
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
