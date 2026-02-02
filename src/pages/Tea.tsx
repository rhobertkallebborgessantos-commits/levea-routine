import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth } from '@/hooks/useAuth';
import { useAllTeas, useTeasByPurpose, useTodayTeaLogs, useTeaHistory, useTeaStats, useLogTea, Tea } from '@/hooks/useTeas';
import { useReminders, useCreateReminder, useDeleteReminder } from '@/hooks/useReminders';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeaListSkeleton, TeaStatsSkeleton, TeaHistorySkeleton } from '@/components/skeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Leaf, ArrowLeft, Clock, Check, Info, Bell, Plus, 
  Calendar, TrendingUp, Star, Trash2, AlertTriangle,
  Sparkles, Filter, Coffee
} from 'lucide-react';
import { TeaPreparationDrawer } from '@/components/tea/TeaPreparationDrawer';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader } from '@/components/PageLoader';
import { toast } from 'sonner';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TEA_PURPOSES, TEA_INTENSITIES, TEA_TIMES, TIME_BLOCK_STYLES } from '@/lib/constants';

const purposeLabels: Record<string, string> = {
  'metabolism': 'Metabolismo',
  'digestion': 'Digestão',
  'anxiety': 'Ansiedade',
  'bloating': 'Inchaço',
  'sleep': 'Sono',
  // Legacy mappings
  'metabolismo': 'Metabolismo',
  'digestao': 'Digestão',
  'ansiedade': 'Ansiedade',
  'retencao': 'Retenção',
  'compulsao': 'Compulsão',
  'saciedade': 'Saciedade',
  'sono': 'Sono',
};

const purposeColors: Record<string, string> = {
  'metabolism': 'bg-destructive/10 text-destructive border-destructive/20',
  'digestion': 'bg-success/10 text-success border-success/20',
  'anxiety': 'bg-levea-lavender text-purple-700 border-purple-200',
  'bloating': 'bg-levea-sky text-blue-700 border-blue-200',
  'sleep': 'bg-levea-lavender text-purple-700 border-purple-200',
  // Legacy
  'metabolismo': 'bg-destructive/10 text-destructive border-destructive/20',
  'digestao': 'bg-success/10 text-success border-success/20',
  'ansiedade': 'bg-levea-lavender text-purple-700 border-purple-200',
  'retencao': 'bg-levea-sky text-blue-700 border-blue-200',
  'compulsao': 'bg-levea-rose text-rose-700 border-rose-200',
  'saciedade': 'bg-levea-warm text-amber-700 border-amber-200',
  'sono': 'bg-levea-lavender text-purple-700 border-purple-200',
};

const intensityLabels: Record<string, { label: string; color: string }> = {
  'mild': { label: 'Suave', color: 'bg-success/10 text-success' },
  'moderate': { label: 'Moderado', color: 'bg-warning/10 text-warning' },
  'occasional': { label: 'Ocasional', color: 'bg-destructive/10 text-destructive' },
};

const timeLabels: Record<string, string> = {
  'morning': '🌅 Manhã',
  'afternoon': '☀️ Tarde',
  'evening': '🌙 Noite',
  'any': '⏰ Qualquer',
};

// Translation helper for best_time field
const translateBestTime = (bestTime: string): string => {
  const translations: Record<string, string> = {
    'morning': 'Manhã',
    'afternoon': 'Tarde',
    'evening': 'Noite',
    'night': 'Noite',
    'any': 'Qualquer horário',
    'anytime': 'Qualquer horário',
    'before_bed': 'Antes de dormir',
    'before bed': 'Antes de dormir',
    'before_sleep': 'Antes de dormir',
    'before sleep': 'Antes de dormir',
    'before_meals': 'Antes das refeições',
    'before meals': 'Antes das refeições',
    'after_meals': 'Após as refeições',
    'after meals': 'Após as refeições',
    'after_lunch': 'Após o almoço',
    'after lunch': 'Após o almoço',
    'after_dinner': 'Após o jantar',
    'after dinner': 'Após o jantar',
    'with_meals': 'Durante as refeições',
    'with meals': 'Durante as refeições',
    'fasting': 'Em jejum',
    'empty_stomach': 'Em jejum',
    'empty stomach': 'Em jejum',
  };
  
  // Normalize: lowercase and replace underscores with spaces
  const normalized = bestTime.toLowerCase().replace(/_/g, ' ').trim();
  
  // Check for exact match
  if (translations[normalized]) {
    return translations[normalized];
  }
  
  // Check original lowercase
  if (translations[bestTime.toLowerCase()]) {
    return translations[bestTime.toLowerCase()];
  }
  
  // Return original if no translation found
  return bestTime;
};

function TeaCard({ tea, isLogged, onLog, onSchedule }: { 
  tea: Tea; 
  isLogged: boolean; 
  onLog: () => void;
  onSchedule: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPreparation, setShowPreparation] = useState(false);

  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all",
        isLogged ? "border-success/30 bg-success/5" : "border-border/50"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">{tea.name}</h3>
                {isLogged && <Check className="h-4 w-4 text-success" />}
              </div>
              
              {/* Main benefit - quick highlight */}
              {tea.main_benefit && (
                <p className="text-sm font-medium text-primary mb-2">
                  {tea.main_benefit}
                </p>
              )}
              
              <div className="flex flex-wrap gap-1 mb-2">
                {tea.purpose.map((p) => (
                  <Badge 
                    key={p} 
                    variant="outline" 
                    className={cn("text-xs", purposeColors[p])}
                  >
                    {purposeLabels[p] || p}
                  </Badge>
                ))}
                {tea.intensity && intensityLabels[tea.intensity] && (
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", intensityLabels[tea.intensity].color)}
                  >
                    {intensityLabels[tea.intensity].label}
                  </Badge>
                )}
              </div>

              {tea.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {tea.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {tea.best_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{translateBestTime(tea.best_time)}</span>
                  </div>
                )}
                {tea.time_of_day && tea.time_of_day.length > 0 && (
                  <span className="flex items-center gap-1">
                    {tea.time_of_day.map(t => timeLabels[t]?.split(' ')[0] || t).join(' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
            <Button 
              variant={isLogged ? "secondary" : "default"}
              size="sm" 
              onClick={onLog}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              {isLogged ? 'Registrar outro' : 'Tomei'}
            </Button>
            
            {/* Preparation button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreparation(true)}
              className="text-primary hover:text-primary"
            >
              <Coffee className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSchedule}
            >
              <Bell className="h-4 w-4" />
            </Button>
            
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    {tea.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {tea.purpose.map((p) => (
                      <Badge key={p} variant="outline" className={cn("text-xs", purposeColors[p])}>
                        {purposeLabels[p] || p}
                      </Badge>
                    ))}
                  </div>

                  {tea.description && (
                    <p className="text-sm text-muted-foreground">{tea.description}</p>
                  )}

                  {tea.benefits && tea.benefits.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Benefícios</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {tea.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-success">✓</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tea.safety_notes && (
                    <div className="bg-destructive/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-destructive font-medium text-sm mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        Atenção
                      </div>
                      <p className="text-sm text-destructive/80">{tea.safety_notes}</p>
                    </div>
                  )}

                  {/* Alternatives */}
                  {tea.alternatives && tea.alternatives.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Alternativas similares</h4>
                      <div className="flex flex-wrap gap-1">
                        {tea.alternatives.map((alt, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intensity indicator */}
                  {tea.intensity && intensityLabels[tea.intensity] && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Intensidade:</span>
                      <Badge className={intensityLabels[tea.intensity].color}>
                        {intensityLabels[tea.intensity].label}
                      </Badge>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Preparation Drawer */}
      <TeaPreparationDrawer 
        tea={tea} 
        open={showPreparation} 
        onOpenChange={setShowPreparation} 
      />
    </>
  );
}

function TeaScheduleDialog({ 
  tea, 
  open, 
  onOpenChange 
}: { 
  tea: Tea | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [time, setTime] = useState('09:00');
  const [timeBlock, setTimeBlock] = useState<'morning' | 'lunch' | 'afternoon' | 'evening'>('morning');
  const createReminder = useCreateReminder();

  const handleSchedule = async () => {
    if (!tea) return;

    try {
      await createReminder.mutateAsync({
        title: `Hora do ${tea.name}`,
        message: `Prepare seu ${tea.name} para ${tea.purpose.map(p => purposeLabels[p]).join(', ')}.`,
        scheduled_time: time,
        time_block: timeBlock,
        reminder_type: 'tea',
        category: 'tea',
        tone: 'friendly',
      });
      toast.success('Lembrete criado!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar lembrete');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar lembrete - {tea?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Horário</Label>
            <Input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Período do dia</Label>
            <Select value={timeBlock} onValueChange={(v) => setTimeBlock(v as typeof timeBlock)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Manhã</SelectItem>
                <SelectItem value="lunch">Almoço</SelectItem>
                <SelectItem value="afternoon">Tarde</SelectItem>
                <SelectItem value="evening">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSchedule} className="w-full" disabled={createReminder.isPending}>
            <Bell className="h-4 w-4 mr-2" />
            Criar Lembrete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TeaPageContent() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedTeaForSchedule, setSelectedTeaForSchedule] = useState<Tea | null>(null);

  const { data: allTeas, isLoading: teasLoading } = useTeasByPurpose(selectedPurpose);
  const { data: todayLogs } = useTodayTeaLogs();
  const { data: history, isLoading: historyLoading } = useTeaHistory(7);
  const { data: stats } = useTeaStats();
  const { data: teaReminders } = useReminders('tea');
  const logTea = useLogTea();
  const deleteReminder = useDeleteReminder();

  // Show branded loading screen on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return <PageLoader />;
  }

  // Apply additional filters
  const teas = allTeas?.filter(tea => {
    if (selectedTime !== 'all' && tea.time_of_day && !tea.time_of_day.includes(selectedTime)) {
      return false;
    }
    if (selectedIntensity !== 'all' && tea.intensity !== selectedIntensity) {
      return false;
    }
    return true;
  });

  const loggedTeaNames = todayLogs?.map(l => l.tea_name.toLowerCase()) || [];
  const hasActiveFilters = selectedPurpose !== 'all' || selectedTime !== 'all' || selectedIntensity !== 'all';

  const handleLogTea = async (tea: Tea) => {
    try {
      await logTea.mutateAsync({ teaId: tea.id, teaName: tea.name });
      toast.success(`${tea.name} registrado! 🍵`);
    } catch (error) {
      toast.error('Erro ao registrar chá');
    }
  };

  const handleSchedule = (tea: Tea) => {
    setSelectedTeaForSchedule(tea);
    setScheduleDialogOpen(true);
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder.mutateAsync(id);
      toast.success('Lembrete removido');
    } catch (error) {
      toast.error('Erro ao remover lembrete');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Chás</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="bg-gradient-to-br from-levea-mint to-levea-sky border-0">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{stats?.totalThisWeek || 0}</p>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-levea-warm to-levea-rose border-0">
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-amber-600" />
              <p className="text-sm font-bold truncate">{stats?.favoriteTea || '-'}</p>
              <p className="text-xs text-muted-foreground">Favorito</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-levea-lavender to-levea-sky border-0">
            <CardContent className="p-3 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <p className="text-xl font-bold">{stats?.streak || 0}</p>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Tabs */}
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="catalog">Catálogo</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="reminders">Lembretes</TabsTrigger>
          </TabsList>

          {/* Catalog Tab */}
          <TabsContent value="catalog" className="space-y-4 mt-4">
            {/* Filters Section */}
            <div className="space-y-3">
              {/* Purpose Filter */}
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  <Badge
                    variant={selectedPurpose === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer shrink-0"
                    onClick={() => setSelectedPurpose('all')}
                  >
                    Todos
                  </Badge>
                  {TEA_PURPOSES.map((purpose) => (
                    <Badge
                      key={purpose.value}
                      variant={selectedPurpose === purpose.value ? 'default' : 'outline'}
                      className="cursor-pointer shrink-0"
                      onClick={() => setSelectedPurpose(purpose.value)}
                    >
                      {purpose.icon} {purpose.label}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>

              {/* Advanced Filters Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Mais filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="text-xs">
                      {[selectedTime !== 'all', selectedIntensity !== 'all'].filter(Boolean).length + (selectedPurpose !== 'all' ? 1 : 0)} ativos
                    </Badge>
                  )}
                </span>
                <Sparkles className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
              </Button>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {/* Time of Day */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Horário</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Qualquer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Qualquer horário</SelectItem>
                        {TEA_TIMES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.icon} {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Intensity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Intensidade</Label>
                    <Select value={selectedIntensity} onValueChange={setSelectedIntensity}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Qualquer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Qualquer</SelectItem>
                        {TEA_INTENSITIES.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.icon} {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Tea List */}
            {teasLoading ? (
              <TeaListSkeleton count={3} />
            ) : teas && teas.length > 0 ? (
              <div className="space-y-3">
                {teas.map((tea) => (
                  <TeaCard
                    key={tea.id}
                    tea={tea}
                    isLogged={loggedTeaNames.includes(tea.name.toLowerCase())}
                    onLog={() => handleLogTea(tea)}
                    onSchedule={() => handleSchedule(tea)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Leaf className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Nenhum chá encontrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {historyLoading ? (
              <TeaHistorySkeleton count={3} />
            ) : history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((day) => (
                  <Card key={day.date} className="border-border/50">
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span>
                          {isToday(parseISO(day.date)) 
                            ? 'Hoje' 
                            : format(parseISO(day.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {day.logs.length} chá{day.logs.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    {day.logs.length > 0 && (
                      <CardContent className="py-2 px-4 border-t border-border/30">
                        <div className="space-y-2">
                          {day.logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Leaf className="h-3 w-3 text-primary" />
                                <span>{log.tea_name}</span>
                              </div>
                              {log.time_consumed && (
                                <span className="text-xs text-muted-foreground">
                                  {format(parseISO(log.time_consumed), 'HH:mm')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Nenhum registro encontrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-4 mt-4">
            {teaReminders && teaReminders.length > 0 ? (
              <div className="space-y-3">
                {teaReminders.map((reminder) => (
                  <Card key={reminder.id} className="border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          TIME_BLOCK_STYLES[reminder.time_block].bg
                        )}>
                          <Bell className={cn("h-4 w-4", TIME_BLOCK_STYLES[reminder.time_block].text)} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{reminder.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{reminder.scheduled_time}</span>
                            <Badge variant="outline" className="text-xs">
                              {TIME_BLOCK_STYLES[reminder.time_block].label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Nenhum lembrete de chá</p>
                  <p className="text-xs mt-1">Agende lembretes no catálogo</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Schedule Dialog */}
      <TeaScheduleDialog
        tea={selectedTeaForSchedule}
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      />

      <BottomNav />
    </div>
  );
}

export default function TeaPage() {
  return (
    <RequireAuth>
      <TeaPageContent />
    </RequireAuth>
  );
}
