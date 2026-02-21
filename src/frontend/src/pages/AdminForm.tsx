import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSubmitPoem } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { mutate: submitPoem, isPending } = useSubmitPoem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !author.trim()) {
      return;
    }

    submitPoem(
      { title: title.trim(), content: content.trim(), author: author.trim() },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTitle('');
          setContent('');
          setAuthor('');
          
          setTimeout(() => {
            setShowSuccess(false);
            navigate({ to: '/' });
          }, 2000);
        },
      }
    );
  };

  const isFormValid = title.trim() && content.trim() && author.trim();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-serif">Add New Poem</CardTitle>
          <CardDescription className="text-base">
            Share your poetry with the world. Fill in the details below to add a new poem to the collection.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
