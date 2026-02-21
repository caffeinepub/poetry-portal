import { useGetAllPoems } from '../hooks/useQueries';
import PoemCard from '../components/PoemCard';
import { Loader2, BookOpen } from 'lucide-react';

export default function Home() {
  const { data: poems, isLoading, error } = useGetAllPoems();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading poems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <p className="text-destructive">Error loading poems. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          Poetry Collection
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A curated collection of verses, thoughts, and emotions captured in words.
          Explore the beauty of language and the depth of human expression.
        </p>
      </div>

      {!poems || poems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[300px] bg-card/50 rounded-lg border border-border/40 p-12">
          <BookOpen className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-xl text-muted-foreground">No poems yet</p>
          <p className="text-sm text-muted-foreground/70">
            Be the first to add a poem to this collection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poems.map((poem) => (
            <PoemCard key={poem.id.toString()} poem={poem} />
          ))}
        </div>
      )}
    </div>
  );
}
