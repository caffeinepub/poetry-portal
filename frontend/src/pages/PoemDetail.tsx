import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Download,
  BookOpen,
  Calendar,
  User,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useGetPoemById,
  useGetAllCollections,
  useAddPoemToCollection,
  useDeletePoem,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PoemType, CollectionView } from '../backend';
import { formatDate } from '../utils/formatDate';
import { downloadImageFromURL, downloadBlobAsImage } from '../utils/downloadHelpers';
import { generatePoemImage } from '../utils/poemImageGenerator';

export default function PoemDetail() {
  const { id } = useParams({ from: '/poem/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isAdminMode } = useAdminAuth();
  const isAuthenticated = !!identity;

  const poemId = BigInt(id);
  const { data: poem, isLoading, error } = useGetPoemById(poemId);
  const { data: collections = [] } = useGetAllCollections();
  const addToCollectionMutation = useAddPoemToCollection();
  const deletePoem = useDeletePoem();

  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<bigint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddToCollection = async () => {
    for (const collectionId of selectedCollections) {
      await addToCollectionMutation.mutateAsync({ collectionId, poemId });
    }
    setShowCollectionDialog(false);
    setSelectedCollections([]);
  };

  const toggleCollection = (collectionId: bigint) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(cid => cid !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleDelete = async () => {
    await deletePoem.mutateAsync(poemId);
    navigate({ to: '/' });
  };

  const handleDownload = async () => {
    if (!poem) return;
    if (poem.poemType === PoemType.image && poem.imageUrl) {
      const filename = `${poem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      downloadImageFromURL(poem.imageUrl.getDirectURL(), filename);
    } else if (poem.poemType === PoemType.text) {
      setIsGenerating(true);
      try {
        const blob = await generatePoemImage(poem);
        const filename = `${poem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        downloadBlobAsImage(blob, filename);
      } catch (err) {
        console.error('Failed to generate image:', err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Poetry nahi mili.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wapas Jayen
        </Button>
      </div>
    );
  }

  const poemCollections = collections.filter((c: CollectionView) =>
    c.poemIds.includes(poem.id)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Wapas Jayen
      </Button>

      <article className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
        {/* Image */}
        {poem.poemType === PoemType.image && poem.imageUrl && (
          <div className="w-full max-h-[70vh] overflow-hidden bg-muted">
            <img
              src={poem.imageUrl.getDirectURL()}
              alt={poem.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-2">
                {poem.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {poem.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(poem.dateCreated)}
                </span>
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  {poem.poemType === PoemType.image ? (
                    <>Image Poem</>
                  ) : (
                    <>
                      <BookOpen className="h-3 w-3" />
                      Text Poem
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Collections */}
          {poemCollections.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {poemCollections.map((c: CollectionView) => (
                <Badge
                  key={c.id.toString()}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => navigate({ to: '/' })}
                >
                  {c.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Text Content */}
          {poem.poemType === PoemType.text && poem.content && (
            <div className="prose prose-sm max-w-none mb-6">
              <div className="font-serif text-base leading-relaxed text-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border border-border/40">
                {poem.content}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download
                </>
              )}
            </Button>

            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCollectionDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Collection Mein Add Karein
              </Button>
            )}

            {isAdminMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: '/admin' })}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={deletePoem.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletePoem.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Poetry Delete Karein?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Kya aap "{poem.title}" ko permanently delete karna chahte hain? Yeh action wapas nahi ho sakta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Haan, Delete Karein
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </article>

      {/* Add to Collection Dialog */}
      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collection Mein Add Karein</DialogTitle>
            <DialogDescription>
              "{poem.title}" ko kisi collection mein add karein
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto py-2">
            {collections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Koi collection nahi mili
              </p>
            ) : (
              collections.map((collection: CollectionView) => (
                <label
                  key={collection.id.toString()}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCollections.includes(collection.id)}
                    onCheckedChange={() => toggleCollection(collection.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{collection.name}</p>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground">{collection.description}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollectionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToCollection}
              disabled={selectedCollections.length === 0 || addToCollectionMutation.isPending}
            >
              {addToCollectionMutation.isPending ? 'Adding...' : 'Add Karein'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
