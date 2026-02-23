import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPoemById, useGetCollectionsForPoem, useGetAllCollections, useAddPoemToCollection } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatDate } from '../utils/formatDate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Calendar, User, Loader2, Image as ImageIcon, Download, FolderPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PoemType } from '../backend';
import { downloadImageFromURL, downloadBlobAsImage } from '../utils/downloadHelpers';
import { generatePoemImage } from '../utils/poemImageGenerator';
import { toast } from 'sonner';

export default function PoemDetail() {
  const { id } = useParams({ from: '/poem/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const poemId = BigInt(id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<bigint>>(new Set());
  
  const { data: poem, isLoading, error } = useGetPoemById(poemId);
  const { data: collections } = useGetCollectionsForPoem(poemId);
  const { data: allCollections } = useGetAllCollections();
  const { mutate: addPoemToCollection, isPending } = useAddPoemToCollection();

  const handleDownloadImage = () => {
    if (!poem || !poem.imageUrl) return;
    const filename = `${poem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    downloadImageFromURL(poem.imageUrl.getDirectURL(), filename);
  };

  const handleDownloadText = async () => {
    if (!poem) return;
    setIsGenerating(true);
    try {
      const blob = await generatePoemImage(poem);
      const filename = `${poem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      downloadBlobAsImage(blob, filename);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCollections = () => {
    if (selectedCollections.size === 0) return;

    const promises = Array.from(selectedCollections).map((collectionId) =>
      new Promise<void>((resolve, reject) => {
        addPoemToCollection(
          { collectionId, poemId: poem!.id },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      })
    );

    Promise.all(promises)
      .then(() => {
        toast.success(`Poem added to ${selectedCollections.size} collection${selectedCollections.size > 1 ? 's' : ''}`);
        setSelectedCollections(new Set());
        setIsDialogOpen(false);
      })
      .catch((error) => {
        toast.error('Failed to add poem to collections');
        console.error(error);
      });
  };

  const toggleCollection = (collectionId: bigint) => {
    const newSet = new Set(selectedCollections);
    if (newSet.has(collectionId)) {
      newSet.delete(collectionId);
    } else {
      newSet.add(collectionId);
    }
    setSelectedCollections(newSet);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading poem...</p>
        </div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <p className="text-destructive text-lg">Poem not found</p>
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isImagePoem = poem.poemType === PoemType.image;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button
        onClick={() => navigate({ to: '/' })}
        variant="ghost"
        className="mb-8 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
        {isImagePoem && poem.imageUrl ? (
          <>
            <div className="relative w-full overflow-hidden rounded-t-lg">
              <img
                src={poem.imageUrl.getDirectURL()}
                alt={poem.title}
                className="w-full h-auto max-h-[70vh] object-contain bg-muted"
              />
              <Badge variant="secondary" className="absolute top-4 right-4 gap-1">
                <ImageIcon className="h-3 w-3" />
                Image Poetry
              </Badge>
            </div>
            <CardHeader className="space-y-6 pb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                {poem.title}
              </h1>
              
              {poem.content && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {poem.content}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {poem.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{poem.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(poem.dateCreated)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleDownloadImage}
                  className="gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </Button>

                {isAuthenticated && allCollections && allCollections.length > 0 && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <FolderPlus className="h-4 w-4" />
                        Add to Collection
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Collections</DialogTitle>
                        <DialogDescription>
                          Select collections to add "{poem.title}" to
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-3">
                          {allCollections.map((collection) => (
                            <div
                              key={collection.id.toString()}
                              className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                            >
                              <Checkbox
                                id={`collection-${collection.id}`}
                                checked={selectedCollections.has(collection.id)}
                                onCheckedChange={() => toggleCollection(collection.id)}
                              />
                              <div className="flex-1 space-y-1">
                                <label
                                  htmlFor={`collection-${collection.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {collection.name}
                                </label>
                                {collection.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {collection.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddToCollections}
                          disabled={selectedCollections.size === 0 || isPending}
                          className="flex-1"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            `Add to ${selectedCollections.size} collection${selectedCollections.size !== 1 ? 's' : ''}`
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {collections && collections.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
                  <span className="text-sm text-muted-foreground mr-2">Collections:</span>
                  {collections.map((collection) => (
                    <Badge
                      key={collection.id.toString()}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => navigate({ to: '/', search: { collection: collection.id.toString() } })}
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </>
        ) : (
          <>
            <CardHeader className="space-y-6 pb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                {poem.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{poem.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(poem.dateCreated)}</span>
                </div>
              </div>

              {collections && collections.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
                  <span className="text-sm text-muted-foreground mr-2">Collections:</span>
                  {collections.map((collection) => (
                    <Badge
                      key={collection.id.toString()}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => navigate({ to: '/', search: { collection: collection.id.toString() } })}
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground/90">
                {poem.content}
              </div>

              <div className="flex flex-wrap gap-2 mt-8 not-prose">
                <Button
                  onClick={handleDownloadText}
                  disabled={isGenerating}
                  className="gap-2"
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download as Image
                    </>
                  )}
                </Button>

                {isAuthenticated && allCollections && allCollections.length > 0 && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <FolderPlus className="h-4 w-4" />
                        Add to Collection
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Collections</DialogTitle>
                        <DialogDescription>
                          Select collections to add "{poem.title}" to
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-3">
                          {allCollections.map((collection) => (
                            <div
                              key={collection.id.toString()}
                              className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                            >
                              <Checkbox
                                id={`collection-${collection.id}`}
                                checked={selectedCollections.has(collection.id)}
                                onCheckedChange={() => toggleCollection(collection.id)}
                              />
                              <div className="flex-1 space-y-1">
                                <label
                                  htmlFor={`collection-${collection.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {collection.name}
                                </label>
                                {collection.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {collection.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddToCollections}
                          disabled={selectedCollections.size === 0 || isPending}
                          className="flex-1"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            `Add to ${selectedCollections.size} collection${selectedCollections.size !== 1 ? 's' : ''}`
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
