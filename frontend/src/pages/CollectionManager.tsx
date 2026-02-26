import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Trash2, BookOpen, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AdminRouteGuard from '../components/AdminRouteGuard';
import {
  useGetAllCollections,
  useCreateCollection,
  useDeleteCollection,
  useGetPoemsByCollectionId,
  useRemovePoemFromCollection,
} from '../hooks/useQueries';
import { CollectionView } from '../backend';

function CollectionPoemList({
  collection,
  onRemove,
}: {
  collection: CollectionView;
  onRemove: (poemId: bigint) => void;
}) {
  const { data: poems = [], isLoading } = useGetPoemsByCollectionId(collection.id);

  if (isLoading) return <Skeleton className="h-8 w-full" />;
  if (poems.length === 0) return <p className="text-xs text-muted-foreground">Koi poem nahi</p>;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {poems.map(poem => (
        <Badge key={poem.id.toString()} variant="secondary" className="text-xs flex items-center gap-1">
          {poem.title}
          <button
            onClick={() => onRemove(poem.id)}
            className="ml-0.5 hover:text-destructive transition-colors"
            title="Remove from collection"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

export default function CollectionManager() {
  const navigate = useNavigate();
  const { data: collections = [], isLoading } = useGetAllCollections();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const removePoemFromCollection = useRemovePoemFromCollection();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Collection ka naam zaroori hai'); return; }
    try {
      await createCollection.mutateAsync({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kuch masla hua');
    }
  };

  const handleDelete = async (collectionId: bigint) => {
    try {
      await deleteCollection.mutateAsync(collectionId);
    } catch (err: unknown) {
      console.error('Delete failed:', err);
    }
  };

  const handleRemovePoem = async (collectionId: bigint, poemId: bigint) => {
    try {
      await removePoemFromCollection.mutateAsync({ collectionId, poemId });
    } catch (err: unknown) {
      console.error('Remove failed:', err);
    }
  };

  return (
    <AdminRouteGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wapas Jayen
        </Button>

        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Collections Manage Karein</h1>
          <p className="text-muted-foreground text-sm mt-1">Collections banayein aur poems organize karein</p>
        </div>

        {/* Create Collection Form */}
        <div className="bg-card border border-border/60 rounded-xl p-6 mb-8">
          <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nayi Collection Banayein
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="col-name">Collection Ka Naam *</Label>
              <Input
                id="col-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Collection ka naam..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="col-desc">Tafseel (Optional)</Label>
              <Textarea
                id="col-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Collection ke baare mein..."
                rows={3}
                className="resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                ⚠ {error}
              </p>
            )}
            <Button type="submit" disabled={createCollection.isPending} className="flex items-center gap-2">
              {createCollection.isPending ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Bana raha hai...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Collection Banayein
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Collections List */}
        <div>
          <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Tamam Collections ({collections.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Abhi koi collection nahi hai</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map((collection: CollectionView) => (
                <div
                  key={collection.id.toString()}
                  className="bg-card border border-border/60 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{collection.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {collection.poemIds.length} poem(s)
                      </p>
                      <CollectionPoemList
                        collection={collection}
                        onRemove={poemId => handleRemovePoem(collection.id, poemId)}
                      />
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Collection Delete Karein?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Kya aap "{collection.name}" collection ko delete karna chahte hain? Poems delete nahi honge, sirf collection hategi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(collection.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Karein
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminRouteGuard>
  );
}
