import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '../utils/formatDate';
import { Calendar, User, Image as ImageIcon } from 'lucide-react';
import type { Poem } from '../backend';
import { PoemType } from '../backend';

interface PoemCardProps {
  poem: Poem;
  collectionNames?: string[];
}

export default function PoemCard({ poem, collectionNames }: PoemCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/poem/$id', params: { id: poem.id.toString() } });
  };

  const isImagePoem = poem.poemType === PoemType.image;

  if (isImagePoem && poem.imageUrl) {
    const imageUrl = poem.imageUrl.getDirectURL();
    
    return (
      <Card
        onClick={handleClick}
        className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 border-border/40 bg-card/80 backdrop-blur-sm group overflow-hidden"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={poem.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-serif font-bold text-white mb-1 line-clamp-2">
              {poem.title}
            </h3>
            {poem.content && (
              <p className="text-sm text-white/90 line-clamp-2">{poem.content}</p>
            )}
          </div>
          <Badge variant="secondary" className="absolute top-3 right-3 gap-1">
            <ImageIcon className="h-3 w-3" />
            Image
          </Badge>
        </div>
        {collectionNames && collectionNames.length > 0 && (
          <CardContent className="pt-3 pb-3">
            <div className="flex flex-wrap gap-1">
              {collectionNames.map((name, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // Text poem card
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
        {collectionNames && collectionNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {collectionNames.map((name, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
