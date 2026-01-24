import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReminders, useCreateReminder, useUpdateReminder, useDeleteReminder, useToggleReminder, Reminder } from '@/hooks/useReminders';
import { ReminderForm, REMINDER_TEMPLATES, ReminderTemplate } from './ReminderForm';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Clock, Bell, BellOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIME_BLOCK_LABELS: Record<string, { label: string; icon: string }> = {
  morning: { label: 'Manhã', icon: '🌅' },
  lunch: { label: 'Almoço', icon: '☀️' },
  afternoon: { label: 'Tarde', icon: '🌤️' },
  evening: { label: 'Noite', icon: '🌙' },
};

const CATEGORY_ICONS: Record<string, string> = {
  meal: '🍽️',
  tea: '🍵',
  routine: '✨',
  exercise: '💪',
  hydration: '💧',
  supplement: '💊',
  general: '🌿',
};

export function RemindersList() {
  const { toast } = useToast();
  const { data: reminders, isLoading } = useReminders();
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();
  const toggleReminder = useToggleReminder();

  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleCreate = () => {
    setEditingReminder(null);
    setSelectedTemplate(null);
    setFormOpen(true);
  };

  const handleTemplateSelect = (template: ReminderTemplate) => {
    setEditingReminder(null);
    setSelectedTemplate(template);
    setShowTemplates(false);
    setFormOpen(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setSelectedTemplate(null);
    setFormOpen(true);
  };

  const handleDelete = (reminder: Reminder) => {
    setReminderToDelete(reminder);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reminderToDelete) return;
    
    try {
      await deleteReminder.mutateAsync(reminderToDelete.id);
      toast({
        title: 'Lembrete excluído',
        description: 'O lembrete foi removido com sucesso.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o lembrete.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setReminderToDelete(null);
    }
  };

  const handleToggle = async (reminder: Reminder) => {
    try {
      await toggleReminder.mutateAsync({
        id: reminder.id,
        is_active: !reminder.is_active,
      });
      toast({
        title: reminder.is_active ? 'Lembrete desativado' : 'Lembrete ativado',
        description: reminder.is_active
          ? 'Você não receberá mais este lembrete.'
          : 'Você voltará a receber este lembrete.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o lembrete.',
      });
    }
  };

  const handleFormSubmit = async (data: {
    title: string;
    message: string;
    scheduled_time: string;
    time_block: 'morning' | 'lunch' | 'afternoon' | 'evening';
    category?: string;
  }) => {
    try {
      if (editingReminder) {
        await updateReminder.mutateAsync({
          id: editingReminder.id,
          ...data,
        });
        toast({
          title: 'Lembrete atualizado! ✓',
          description: 'As alterações foram salvas.',
        });
      } else {
        await createReminder.mutateAsync(data);
        toast({
          title: 'Lembrete criado! ✓',
          description: 'Você receberá o lembrete no horário configurado.',
        });
      }
      setFormOpen(false);
      setEditingReminder(null);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const groupedReminders = (reminders || []).reduce((acc, reminder) => {
    const block = reminder.time_block;
    if (!acc[block]) acc[block] = [];
    acc[block].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);

  // Sort reminders within each block by scheduled_time
  Object.keys(groupedReminders).forEach((block) => {
    groupedReminders[block].sort((a, b) => 
      a.scheduled_time.localeCompare(b.scheduled_time)
    );
  });

  const blockOrder = ['morning', 'lunch', 'afternoon', 'evening'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Meus Lembretes
              </CardTitle>
              <CardDescription>
                Gerencie seus lembretes personalizados
              </CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Template Quick Add Section */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 mb-3"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              {showTemplates ? 'Ocultar modelos' : 'Adicionar de modelos'}
            </Button>
            
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/50 border">
                    {REMINDER_TEMPLATES.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTemplateSelect(template)}
                        className="flex items-center gap-2 p-2 rounded-md bg-background border hover:border-primary hover:bg-primary/5 transition-all text-left"
                      >
                        <span className="text-lg">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{template.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {TIME_BLOCK_LABELS[template.time_block]?.icon} {template.scheduled_time}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(!reminders || reminders.length === 0) ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Você ainda não tem lembretes.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Use os modelos acima ou crie um personalizado.
              </p>
              <Button onClick={handleCreate} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Criar lembrete personalizado
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {blockOrder.map((block) => {
                  const blockReminders = groupedReminders[block];
                  if (!blockReminders || blockReminders.length === 0) return null;

                  const blockInfo = TIME_BLOCK_LABELS[block];

                  return (
                    <motion.div
                      key={block}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{blockInfo.icon}</span>
                        <h3 className="font-medium text-sm text-muted-foreground">
                          {blockInfo.label}
                        </h3>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="space-y-2">
                        {blockReminders.map((reminder) => (
                          <motion.div
                            key={reminder.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "p-3 rounded-lg border bg-card transition-all",
                              !reminder.is_active && "opacity-60"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 text-xl">
                                {CATEGORY_ICONS[reminder.category || 'general'] || '🌿'}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-foreground truncate">
                                    {reminder.title}
                                  </h4>
                                  {!reminder.is_active && (
                                    <BellOff className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {reminder.message}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{reminder.scheduled_time.slice(0, 5)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={reminder.is_active}
                                  onCheckedChange={() => handleToggle(reminder)}
                                  className="scale-75"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(reminder)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(reminder)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <ReminderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        reminder={editingReminder}
        template={selectedTemplate}
        onSubmit={handleFormSubmit}
        isLoading={createReminder.isPending || updateReminder.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lembrete?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lembrete "{reminderToDelete?.title}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
