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
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Text Poem</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="flex items-center gap-2 cursor-pointer flex-1">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span>Image Poem</span>
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
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter poem title"
                required
                disabled={isPending}
              />
            </div>

            {/* Conditional Fields Based on Poem Type */}
            {poemType === 'text' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-base">
                    Content <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your poem here..."
                    rows={10}
                    required
                    disabled={isPending}
                    className="font-serif resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author" className="text-base">
                    Author <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                    required
                    disabled={isPending}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-base">
                    Upload Image <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isPending}
                      className="cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isPending}
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="mt-4 border border-border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a description or caption for the image..."
                    rows={3}
                    disabled={isPending}
                  />
                </div>
              </>
            )}

            {/* Upload Progress */}
            {isPending && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Poem submitted successfully! All users will be notified.</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                'Submit Poem'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
