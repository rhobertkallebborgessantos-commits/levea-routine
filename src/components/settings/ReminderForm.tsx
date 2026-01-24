import { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Reminder } from '@/hooks/useReminders';
import { cn } from '@/lib/utils';

const reminderSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(100, 'Máximo 100 caracteres'),
  message: z.string().trim().min(1, 'Mensagem é obrigatória').max(500, 'Máximo 500 caracteres'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
  time_block: z.enum(['morning', 'lunch', 'afternoon', 'evening']),
  category: z.string().optional(),
});

export interface ReminderTemplate {
  id: string;
  title: string;
  message: string;
  scheduled_time: string;
  time_block: 'morning' | 'lunch' | 'afternoon' | 'evening';
  category: string;
  icon: string;
}

export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'water-morning',
    title: 'Beber água',
    message: 'Hora de se hidratar! 💧 Beba um copo de água.',
    scheduled_time: '08:00',
    time_block: 'morning',
    category: 'hydration',
    icon: '💧',
  },
  {
    id: 'water-afternoon',
    title: 'Beber água',
    message: 'Mantenha-se hidratada! 💧 Beba mais um copo de água.',
    scheduled_time: '15:00',
    time_block: 'afternoon',
    category: 'hydration',
    icon: '💧',
  },
  {
    id: 'tea-morning',
    title: 'Hora do chá',
    message: 'Prepare seu chá da manhã! 🍵 Um momento de cuidado.',
    scheduled_time: '10:00',
    time_block: 'morning',
    category: 'tea',
    icon: '🍵',
  },
  {
    id: 'tea-afternoon',
    title: 'Hora do chá',
    message: 'Pausa para o chá da tarde! 🍵 Relaxe e aproveite.',
    scheduled_time: '16:00',
    time_block: 'afternoon',
    category: 'tea',
    icon: '🍵',
  },
  {
    id: 'breakfast',
    title: 'Café da manhã',
    message: 'Hora do café da manhã! 🍳 Comece o dia bem nutrida.',
    scheduled_time: '07:30',
    time_block: 'morning',
    category: 'meal',
    icon: '🍳',
  },
  {
    id: 'lunch',
    title: 'Almoço',
    message: 'Hora do almoço! 🥗 Faça uma refeição equilibrada.',
    scheduled_time: '12:30',
    time_block: 'lunch',
    category: 'meal',
    icon: '🥗',
  },
  {
    id: 'dinner',
    title: 'Jantar',
    message: 'Hora do jantar! 🍽️ Escolha opções leves.',
    scheduled_time: '19:00',
    time_block: 'evening',
    category: 'meal',
    icon: '🍽️',
  },
  {
    id: 'snack',
    title: 'Lanche',
    message: 'Hora do lanche! 🥜 Uma opção saudável te espera.',
    scheduled_time: '15:30',
    time_block: 'afternoon',
    category: 'meal',
    icon: '🥜',
  },
  {
    id: 'exercise',
    title: 'Exercício',
    message: 'Hora de se movimentar! 💪 Seu corpo agradece.',
    scheduled_time: '18:00',
    time_block: 'evening',
    category: 'exercise',
    icon: '💪',
  },
  {
    id: 'supplement',
    title: 'Suplemento',
    message: 'Hora do suplemento! 💊 Não esqueça.',
    scheduled_time: '08:30',
    time_block: 'morning',
    category: 'supplement',
    icon: '💊',
  },
];

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder | null;
  template?: ReminderTemplate | null;
  onSubmit: (data: {
    title: string;
    message: string;
    scheduled_time: string;
    time_block: 'morning' | 'lunch' | 'afternoon' | 'evening';
    category?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const TIME_BLOCKS = [
  { value: 'morning', label: 'Manhã', icon: '🌅', range: '6:00 - 12:00' },
  { value: 'lunch', label: 'Almoço', icon: '☀️', range: '12:00 - 14:00' },
  { value: 'afternoon', label: 'Tarde', icon: '🌤️', range: '14:00 - 18:00' },
  { value: 'evening', label: 'Noite', icon: '🌙', range: '18:00 - 22:00' },
] as const;

const CATEGORIES = [
  { value: 'meal', label: 'Refeição', icon: '🍽️' },
  { value: 'tea', label: 'Chá', icon: '🍵' },
  { value: 'routine', label: 'Rotina', icon: '✨' },
  { value: 'exercise', label: 'Exercício', icon: '💪' },
  { value: 'hydration', label: 'Hidratação', icon: '💧' },
  { value: 'supplement', label: 'Suplemento', icon: '💊' },
  { value: 'general', label: 'Geral', icon: '🌿' },
];

export function ReminderForm({
  open,
  onOpenChange,
  reminder,
  template,
  onSubmit,
  isLoading,
}: ReminderFormProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [timeBlock, setTimeBlock] = useState<'morning' | 'lunch' | 'afternoon' | 'evening'>('morning');
  const [category, setCategory] = useState('general');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!reminder;

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setMessage(reminder.message);
      setScheduledTime(reminder.scheduled_time.slice(0, 5));
      setTimeBlock(reminder.time_block);
      setCategory(reminder.category || 'general');
    } else if (template) {
      setTitle(template.title);
      setMessage(template.message);
      setScheduledTime(template.scheduled_time);
      setTimeBlock(template.time_block);
      setCategory(template.category);
    } else {
      setTitle('');
      setMessage('');
      setScheduledTime('08:00');
      setTimeBlock('morning');
      setCategory('general');
    }
    setErrors({});
  }, [reminder, template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      title: title.trim(),
      message: message.trim(),
      scheduled_time: scheduledTime,
      time_block: timeBlock,
      category,
    };

    const result = reminderSchema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do lembrete'
              : 'Crie um novo lembrete personalizado'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Tomar chá verde"
              maxLength={100}
              className={cn(errors.title && 'border-destructive')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ex: Hora de preparar seu chá! 🍵"
              maxLength={500}
              rows={3}
              className={cn(errors.message && 'border-destructive')}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={cn(errors.scheduled_time && 'border-destructive')}
              />
              {errors.scheduled_time && (
                <p className="text-xs text-destructive">{errors.scheduled_time}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeBlock">Período</Label>
              <Select value={timeBlock} onValueChange={(v) => setTimeBlock(v as typeof timeBlock)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_BLOCKS.map((block) => (
                    <SelectItem key={block.value} value={block.value}>
                      <span className="flex items-center gap-2">
                        <span>{block.icon}</span>
                        <span>{block.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
