import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAllCollections,
  useGetAllPoems,
  useCreateCollection,
  useAddPoemToCollection,
  useRemovePoemFromCollection,
  useDeleteCollection,
  useGetPoemsByCollectionId,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, FolderOpen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import PoemCard from '../components/PoemCard';

export default function CollectionManager() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<bigint | null>(null);
  const [isAddPoemDialogOpen, setIsAddPoemDialogOpen] = useState(false);
  const [selectedPoemIds, setSelectedPoemIds] = useState<Set<bigint>>(new Set());

  const { data: collections, isLoading: collectionsLoading } = useGetAllCollections();
  const { data: allPoems, isLoading: poemsLoading } = useGetAllPoems();
  const { data: collectionPoems } = useGetPoemsByCollectionId(
    selectedCollectionId || BigInt(0),
    !!selectedCollectionId
  );

  const { mutate: createCollection, isPending: isCreating } = useCreateCollection();
  const { mutate: addPoemToCollection, isPending: isAdding } = useAddPoemToCollection();
  const { mutate: removePoemFromCollection } = useRemovePoemFromCollection();
  const { mutate: deleteCollection } = useDeleteCollection();

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    createCollection(
      {
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
      },
      {
        onSuccess: () => {
          setNewCollectionName('');
          setNewCollectionDescription('');
        },
      }
    );
  };

  const handleAddPoems = () => {
    if (!selectedCollectionId || selectedPoemIds.size === 0) return;

    const promises = Array.from(selectedPoemIds).map((poemId) =>
      new Promise<void>((resolve) => {
        addPoemToCollection(
          { collectionId: selectedCollectionId, poemId },
          { onSettled: () => resolve() }
        );
      })
    );

    Promise.all(promises).then(() => {
      setSelectedPoemIds(new Set());
      setIsAddPoemDialogOpen(false);
    });
  };

  const handleRemovePoem = (collectionId: bigint, poemId: bigint) => {
    removePoemFromCollection({ collectionId, poemId });
  };

  const handleDeleteCollection = (collectionId: bigint) => {
    if (confirm('Are you sure you want to delete this collection? This will not delete the poems.')) {
      deleteCollection(collectionId, {
        onSuccess: () => {
          if (selectedCollectionId === collectionId) {
            setSelectedCollectionId(null);
          }
        },
      });
    }
  };

  const togglePoemSelection = (poemId: bigint) => {
    const newSet = new Set(selectedPoemIds);
    if (newSet.has(poemId)) {
      newSet.delete(poemId);
    } else {
      newSet.add(poemId);
    }
    setSelectedPoemIds(newSet);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Admin Access Required</CardTitle>
            <CardDescription className="text-base">
              Please log in to manage collections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login with Internet Identity'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (collectionsLoading || poemsLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    );
  }

  const selectedCollection = collections?.find(c => c.id === selectedCollectionId);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Collection Manager</h1>
        <p className="text-muted-foreground">Create and manage poetry collections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Create New Collection */}
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Collection
            </CardTitle>
            <CardDescription>Add a new collection to organize poems</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name *</Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Ghazals, Nazms, etc."
                  disabled={isCreating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  rows={3}
                  disabled={isCreating}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating || !newCollectionName.trim()}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Collection'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* All Collections List */}
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              All Collections
            </CardTitle>
            <CardDescription>View and manage existing collections</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {collections && collections.length > 0 ? (
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <div
                      key={collection.id.toString()}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedCollectionId === collection.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedCollectionId(collection.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{collection.name}</h4>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {collection.description}
                            </p>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {collection.poemIds.length} poem{collection.poemIds.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No collections yet</p>
                  <p className="text-sm text-muted-foreground/70">Create your first collection above</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Collection Details */}
      {selectedCollection && (
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-serif">{selectedCollection.name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {selectedCollection.description || 'No description'}
                </CardDescription>
              </div>
              <Dialog open={isAddPoemDialogOpen} onOpenChange={setIsAddPoemDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Poems
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Poems to Collection</DialogTitle>
                    <DialogDescription>
                      Select poems to add to "{selectedCollection.name}"
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[500px] pr-4">
                    <div className="space-y-3">
                      {allPoems && allPoems.length > 0 ? (
                        allPoems.map((poem) => (
                          <div
                            key={poem.id.toString()}
                            className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              id={`poem-${poem.id}`}
                              checked={selectedPoemIds.has(poem.id)}
                              onCheckedChange={() => togglePoemSelection(poem.id)}
                            />
                            <div className="flex-1 space-y-1">
                              <label
                                htmlFor={`poem-${poem.id}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {poem.title}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                by {poem.author}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No poems available</p>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddPoemDialogOpen(false);
                        setSelectedPoemIds(new Set());
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddPoems}
                      disabled={selectedPoemIds.size === 0 || isAdding}
                      className="flex-1"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        `Add ${selectedPoemIds.size} poem${selectedPoemIds.size !== 1 ? 's' : ''}`
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-6" />
            {collectionPoems && collectionPoems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collectionPoems.map((poem) => (
                  <div key={poem.id.toString()} className="relative group">
                    <PoemCard poem={poem} />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => handleRemovePoem(selectedCollection.id, poem.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 min-h-[300px] bg-muted/30 rounded-lg border border-border/40 p-12">
                <FolderOpen className="h-16 w-16 text-muted-foreground/50" />
                <p className="text-xl text-muted-foreground">No poems in this collection</p>
                <p className="text-sm text-muted-foreground/70">Click "Add Poems" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
