import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '../utils/formatDate';
import { Calendar, User } from 'lucide-react';
import type { Poem } from '../backend';

interface PoemCardProps {
  poem: Poem;
}

export default function PoemCard({ poem }: PoemCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/poem/$id', params: { id: poem.id.toString() } });
  };

  // Get first few lines of content for preview
  const previewContent = poem.content.split('\n').slice(0, 3).join('\n');
  const hasMore = poem.content.split('\n').length > 3;

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 border-border/40 bg-card/80 backdrop-blur-sm group"
    >
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl font-serif leading-tight group-hover:text-primary transition-colors">
          {poem.title}
        </CardTitle>
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium">{poem.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(poem.dateCreated)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <p className="font-serif text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap line-clamp-4">
            {previewContent}
          </p>
          {hasMore && (
            <div className="mt-2 text-sm text-primary font-medium group-hover:underline">
              Read more →
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
