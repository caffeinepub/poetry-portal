import { useState, useMemo } from 'react';
import { useGetAllPoems, useGetAllCollections, useGetPoemsByCollectionId, useSearchPoems } from '../hooks/useQueries';
import PoemCard from '../components/PoemCard';
import { Loader2, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'react-use';

export default function Home() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<bigint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const { data: allPoems, isLoading: allPoemsLoading } = useGetAllPoems();
  const { data: collections, isLoading: collectionsLoading } = useGetAllCollections();
  const { data: collectionPoems, isLoading: collectionPoemsLoading } = useGetPoemsByCollectionId(
    selectedCollectionId || BigInt(0)
  );
  const { data: searchResults, isLoading: searchLoading } = useSearchPoems(
    debouncedSearchTerm
  );

  const displayPoems = useMemo(() => {
    if (debouncedSearchTerm.trim().length > 0) {
      return searchResults?.map(result => result.poem) || [];
    }
    if (selectedCollectionId !== null) {
      return collectionPoems || [];
    }
    return allPoems || [];
  }, [debouncedSearchTerm, searchResults, selectedCollectionId, collectionPoems, allPoems]);

  const isLoading = allPoemsLoading || collectionsLoading ||
    (selectedCollectionId !== null && collectionPoemsLoading) ||
    (debouncedSearchTerm.trim().length > 0 && searchLoading);

  const selectedCollection = collections?.find(c => c.id === selectedCollectionId);

  const handleCollectionClick = (collectionId: bigint) => {
    if (selectedCollectionId === collectionId) {
      setSelectedCollectionId(null);
    } else {
      setSelectedCollectionId(collectionId);
      setSearchTerm('');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length > 0) {
      setSelectedCollectionId(null);
    }
  };

  if (isLoading && !displayPoems.length) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          International Gojri Maa Boli Adab
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A curated collection of Gojri poetry and literature. Explore the beauty of our mother tongue
          through verses, thoughts, and emotions captured in words.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search poems by title, content, author, or collection..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-6 text-base"
          />
        </div>
        {debouncedSearchTerm.trim().length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {searchLoading ? 'Searching...' : `Found ${displayPoems.length} result${displayPoems.length !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* Collections Filter */}
      {collections && collections.length > 0 && !debouncedSearchTerm.trim() && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Collections</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCollectionId === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCollectionId(null)}
              className="rounded-full"
            >
              All Poems
            </Button>
            {collections.map((collection) => (
              <Button
                key={collection.id.toString()}
                variant={selectedCollectionId === collection.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCollectionClick(collection.id)}
                className="rounded-full"
              >
                {collection.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Collection Info */}
      {selectedCollection && !debouncedSearchTerm.trim() && (
        <div className="mb-8 p-6 bg-card/50 rounded-lg border border-border/40">
          <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
            {selectedCollection.name}
          </h3>
          <p className="text-muted-foreground">{selectedCollection.description}</p>
        </div>
      )}

      {/* Poems Grid */}
      {displayPoems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[300px] bg-card/50 rounded-lg border border-border/40 p-12">
          <BookOpen className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-xl text-muted-foreground">
            {debouncedSearchTerm.trim() ? 'No poems found matching your search' : 'No poems yet'}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {debouncedSearchTerm.trim() ? 'Try a different search term' : 'Be the first to add a poem to this collection'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPoems.map((poem) => {
            const poemCollections = searchResults?.find(r => r.poem.id === poem.id)?.collectionNames || [];
            return (
              <PoemCard
                key={poem.id.toString()}
                poem={poem}
                collectionNames={debouncedSearchTerm.trim() ? poemCollections : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
