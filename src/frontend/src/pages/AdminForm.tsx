import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSubmitPoem } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { PoemType, ExternalBlob } from '../backend';
import { Progress } from '@/components/ui/progress';

export default function AdminForm() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [poemType, setPoemType] = useState<'text' | 'image'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { mutate: submitPoem, isPending } = useSubmitPoem();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    if (poemType === 'text' && (!content.trim() || !author.trim())) return;
    if (poemType === 'image' && !imageFile) return;

    let imageBlob: ExternalBlob | null = null;

    if (poemType === 'image' && imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
    }

    submitPoem(
      {
        title: title.trim(),
        content: poemType === 'image' ? content.trim() : content.trim(),
        author: poemType === 'text' ? author.trim() : '',
        poemType: poemType === 'text' ? PoemType.text : PoemType.image,
        imageUrl: imageBlob,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTitle('');
          setContent('');
          setAuthor('');
          setImageFile(null);
          setImagePreview(null);
          setUploadProgress(0);
          
          setTimeout(() => {
            setShowSuccess(false);
            navigate({ to: '/' });
          }, 2000);
        },
      }
    );
  };

  const isFormValid = 
    title.trim() && 
    (poemType === 'text' ? (content.trim() && author.trim()) : imageFile);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Admin Access Required</CardTitle>
            <CardDescription className="text-base">
              Please log in to add poems to the collection.
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-serif">Add New Poem</CardTitle>
          <CardDescription className="text-base">
            Share poetry with the world. Choose between text or image-based poetry.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Poem Type Selector */}
            <div className="space-y-3">
              <Label className="text-base">Poem Type <span className="text-destructive">*</span></Label>
              <RadioGroup
                value={poemType}
                onValueChange={(value) => setPoemType(value as 'text' | 'image')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 border border-border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer flex-1">
                    <FileText className="h-5 w-5" />
                    <span>Text Poetry</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="flex items-center gap-2 cursor-pointer flex-1">
                    <ImageIcon className="h-5 w-5" />
                    <span>Image Poetry</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the poem title"
                disabled={isPending}
                className="text-base"
                required
              />
            </div>

            {/* Conditional Fields Based on Poem Type */}
            {poemType === 'image' ? (
              <>
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-base">
                    Poetry Image <span className="text-destructive">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          disabled={isPending}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="image" className="cursor-pointer block">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isPending}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Description for Image */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a description or context for this image poetry..."
                    disabled={isPending}
                    className="min-h-[100px] text-base resize-y"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Author Field */}
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-base">
                    Author <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter the author's name"
                    disabled={isPending}
                    className="text-base"
                    required
                  />
                </div>

                {/* Content Field */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-base">
                    Poem Content <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the poem content here..."
                    disabled={isPending}
                    className="min-h-[300px] font-serif text-base leading-relaxed resize-y"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Tip: Use line breaks to format your poem as desired
                  </p>
                </div>
              </>
            )}

            {/* Upload Progress */}
            {isPending && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading image...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isPending}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : showSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submitted!
                  </>
                ) : (
                  'Submit Poem'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
