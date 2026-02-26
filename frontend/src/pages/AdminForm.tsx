import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Upload, FileText, Image, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import AdminRouteGuard from '../components/AdminRouteGuard';
import { useSubmitPoem, useGetAllCollections } from '../hooks/useQueries';
import { PoemType } from '../backend';
import { ExternalBlob } from '../backend';

export default function AdminForm() {
  const navigate = useNavigate();
  const submitPoem = useSubmitPoem();
  const { data: collections = [] } = useGetAllCollections();

  const [poemType, setPoemType] = useState<PoemType>(PoemType.text);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<bigint[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleCollection = (collectionId: bigint) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title zaroori hai'); return; }
    if (!author.trim()) { setError('Author ka naam zaroori hai'); return; }
    if (poemType === PoemType.text && !content.trim()) { setError('Content zaroori hai'); return; }
    if (poemType === PoemType.image && !imageFile) { setError('Image zaroori hai'); return; }

    try {
      let imageUrl: ExternalBlob | undefined = undefined;
      if (poemType === PoemType.image && imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageUrl = ExternalBlob.fromBytes(bytes).withUploadProgress(pct => setUploadProgress(pct));
      }

      await submitPoem.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        poemType,
        imageUrl,
        collectionIds: selectedCollections,
      });

      navigate({ to: '/' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kuch masla hua. Dobara koshish karein.';
      setError(msg);
    }
  };

  return (
    <AdminRouteGuard>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Nayi Poetry Add Karein</h1>
          <p className="text-muted-foreground text-sm mt-1">Naya poem ya image poetry upload karein</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border/60 rounded-xl p-6">
          {/* Poem Type Toggle */}
          <div className="space-y-2">
            <Label>Poetry Ka Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={poemType === PoemType.text ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPoemType(PoemType.text)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Text Poetry
              </Button>
              <Button
                type="button"
                variant={poemType === PoemType.image ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPoemType(PoemType.image)}
                className="flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                Image Poetry
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Poetry ka title..."
              required
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Shayar ka Naam *</Label>
            <Input
              id="author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Shayar ka naam..."
              required
            />
          </div>

          {/* Content or Image */}
          {poemType === PoemType.text ? (
            <div className="space-y-2">
              <Label htmlFor="content">Poetry *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Yahan poetry likhein..."
                rows={8}
                className="font-serif resize-none"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Image Upload *</Label>
              <div
                className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-7 w-7"
                      onClick={e => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Image upload karne ke liye click karein</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP supported</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {submitPoem.isPending && uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collections */}
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label>Collections (Optional)</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-border/40 rounded-lg p-3">
                {collections.map(collection => (
                  <label
                    key={collection.id.toString()}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent rounded-md p-1.5"
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
                ))}
              </div>
              {selectedCollections.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedCollections.map(id => {
                    const col = collections.find(c => c.id === id);
                    return col ? (
                      <Badge key={id.toString()} variant="secondary" className="text-xs">
                        {col.name}
                        <button
                          type="button"
                          className="ml-1 hover:text-destructive"
                          onClick={() => toggleCollection(id)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              ⚠ {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: '/' })}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitPoem.isPending} className="flex items-center gap-2">
              {submitPoem.isPending ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Poetry Add Karein
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminRouteGuard>
  );
}
