import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen, Image, Plus, Trash2 } from 'lucide-react';
import { Poem, PoemType } from '../backend';
import { CollectionView } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useGetAllCollections, useAddPoemToCollection, useDeletePoem } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface PoemCardProps {
  poem: Poem;
  collectionNames?: string[];
  onCollectionClick?: (collectionName: string) => void;
}

export default function PoemCard({ poem, collectionNames = [], onCollectionClick }: PoemCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isAdminMode } = useAdminAuth();
  const isAuthenticated = !!identity;

  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<bigint[]>([]);

  const { data: collections = [] } = useGetAllCollections();
  const addToCollectionMutation = useAddPoemToCollection();
  const deletePoem = useDeletePoem();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="dialog"]')) return;
    navigate({ to: '/poem/$id', params: { id: poem.id.toString() } });
  };

  const handleAddToCollection = async () => {
    for (const collectionId of selectedCollections) {
      await addToCollectionMutation.mutateAsync({ collectionId, poemId: poem.id });
    }
    setShowCollectionDialog(false);
    setSelectedCollections([]);
  };

  const toggleCollection = (collectionId: bigint) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleDelete = async () => {
    await deletePoem.mutateAsync(poem.id);
  };

  const isImagePoem = poem.poemType === PoemType.image;

  return (
    <>
      <article
        className="group relative bg-card border border-border/60 rounded-lg overflow-hidden cursor-pointer hover:shadow-md hover:border-border transition-all duration-200"
        onClick={handleCardClick}
      >
        {/* Image Poem */}
        {isImagePoem && poem.imageUrl ? (
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={poem.imageUrl.getDirectURL()}
              alt={poem.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-accent/10 flex flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <BookOpen className="h-5 w-5 text-primary/40" />
              {collectionNames.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {collectionNames[0]}
                </Badge>
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground leading-snug mb-2 line-clamp-2">
                {poem.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed font-serif">
                {poem.content}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              — {poem.author}
            </div>
          </div>
        )}

        {/* Card Footer */}
        <div className="p-3 border-t border-border/40">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {isImagePoem && (
                <h3 className="font-serif text-sm font-medium text-foreground truncate">
                  {poem.title}
                </h3>
              )}
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                {isImagePoem && (
                  <Badge variant="outline" className="text-xs py-0 px-1.5 flex items-center gap-1">
                    <Image className="h-2.5 w-2.5" />
                    Image
                  </Badge>
                )}
                {collectionNames.slice(0, 2).map(name => (
                  <Badge
                    key={name}
                    variant="secondary"
                    className="text-xs py-0 px-1.5 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={e => {
                      e.stopPropagation();
                      onCollectionClick?.(name);
                    }}
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={e => {
                    e.stopPropagation();
                    setShowCollectionDialog(true);
                  }}
                  title="Add to collection"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
              {isAdminMode && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={e => e.stopPropagation()}
                      title="Delete poem"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={e => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Poetry Delete Karein?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Kya aap "{poem.title}" ko delete karna chahte hain? Yeh action wapas nahi ho sakta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deletePoem.isPending}
                      >
                        {deletePoem.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Deleting...
                          </span>
                        ) : (
                          'Delete Karein'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Add to Collection Dialog */}
      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <DialogContent className="sm:max-w-md" onClick={e => e.stopPropagation()}>
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
    </>
  );
}
