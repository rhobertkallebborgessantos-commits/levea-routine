import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Camera, Plus, Trash2, X, ZoomIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { compressImage, formatFileSize } from '@/lib/image-utils';
import { toast } from 'sonner';

interface Photo {
  id: string;
  date: string;
  photo_url: string;
  photo_type: string | null;
  notes: string | null;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onAddPhoto: (data: { file: File; photoType: string; notes?: string }) => void;
  onDeletePhoto: (id: string) => void;
  isAdding: boolean;
}

const photoTypes = [
  { value: 'front', label: 'Frente' },
  { value: 'side', label: 'Lateral' },
  { value: 'back', label: 'Costas' },
  { value: 'other', label: 'Outro' },
];

export function PhotoGallery({
  photos,
  onAddPhoto,
  onDeletePhoto,
  isAdding,
}: PhotoGalleryProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState('front');
  const [notes, setNotes] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<Photo | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    setIsCompressing(true);
    const originalSize = file.size;

    try {
      // Compress the image
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        outputType: 'image/jpeg',
      });

      setSelectedFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
      setCompressionInfo({
        original: originalSize,
        compressed: compressed.size,
      });

      // Show compression result
      const savedPercent = Math.round((1 - compressed.size / originalSize) * 100);
      if (savedPercent > 10) {
        toast.success(`Imagem otimizada! ${savedPercent}% menor`);
      }
    } catch (error) {
      // Fallback to original if compression fails
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressionInfo(null);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    onAddPhoto({ file: selectedFile, photoType, notes: notes || undefined });
    resetForm();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotoType('front');
    setNotes('');
    setCompressionInfo(null);
    setOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = () => {
    if (deletingPhoto) {
      onDeletePhoto(deletingPhoto.id);
      setDeletingPhoto(null);
    }
  };

  // Group photos by date
  const groupedPhotos = photos.reduce((acc, photo) => {
    const date = photo.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Fotos de Progresso
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Foto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Foto</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {previewUrl ? (
                      <div className="relative mt-2">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setCompressionInfo(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {compressionInfo && (
                          <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-1 rounded">
                            {formatFileSize(compressionInfo.compressed)}
                          </div>
                        )}
                      </div>
                    ) : isCompressing ? (
                      <div className="w-full h-32 mt-2 border border-dashed border-border rounded-lg flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Otimizando...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 mt-2 border-dashed"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Toque para selecionar
                          </span>
                        </div>
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Tipo de foto</Label>
                    <Select value={photoType} onValueChange={setPhotoType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {photoTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Observações (opcional)</Label>
                    <Textarea
                      placeholder="Como você está se sentindo?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedFile || isAdding}
                  >
                    {isAdding ? 'Enviando...' : 'Salvar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedPhotos).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
                  <div key={date}>
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {datePhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                          onClick={() => setViewingPhoto(photo)}
                        >
                          <OptimizedImage
                            src={photo.photo_url}
                            alt={photo.photo_type || 'Progress'}
                            className="w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {photo.photo_type && (
                            <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                              {photoTypes.find((t) => t.value === photo.photo_type)?.label ||
                                photo.photo_type}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Adicione fotos para acompanhar sua evolução visual
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Full-screen photo viewer */}
      <AnimatePresence>
        {viewingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewingPhoto(null)}
          >
            <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={viewingPhoto.photo_url}
                alt={viewingPhoto.photo_type || 'Progress'}
                className="w-full rounded-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setDeletingPhoto(viewingPhoto);
                    setViewingPhoto(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={() => setViewingPhoto(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 text-white">
                <p className="text-sm opacity-80">
                  {format(parseISO(viewingPhoto.date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {viewingPhoto.notes && <p className="mt-1">{viewingPhoto.notes}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingPhoto} onOpenChange={() => setDeletingPhoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
