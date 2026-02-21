import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPoemById } from '../hooks/useQueries';
import { formatDate } from '../utils/formatDate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function PoemDetail() {
  const { id } = useParams({ from: '/poem/$id' });
  const navigate = useNavigate();
  const poemId = BigInt(id);
  
  const { data: poem, isLoading, error } = useGetPoemById(poemId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading poem...</p>
        </div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <p className="text-destructive text-lg">Poem not found</p>
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button
        onClick={() => navigate({ to: '/' })}
        variant="ghost"
        className="mb-8 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Collection
      </Button>

      <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
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
        </CardHeader>

        <CardContent className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground/90">
            {poem.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
