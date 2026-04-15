import { useEffect, useState, useRef, useCallback } from "react";
import { getRecentlyUpdated } from "@/services/api";
import AnimeCard from "@/components/AnimeCard";

export default function Latest() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasNextPage]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    setAnimes([]);
    setPage(1);
    
    getRecentlyUpdated(1)
      .then((res) => {
        const results = res.results?.data || [];
        const totalPages = res.results?.totalPages || 1;
        
        setAnimes(results);
        setHasNextPage(1 < totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load more
  useEffect(() => {
    if (page === 1) return;
    
    setLoadingMore(true);
    getRecentlyUpdated(page)
      .then((res) => {
        const results = res.results?.data || [];
        const totalPages = res.results?.totalPages || 1;
        
        setAnimes(prev => [...prev, ...results]);
        setHasNextPage(page < totalPages);
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }, [page]);

  return (
    <div className="flex flex-col gap-[15px]">
      <h1 className="text-[18px] font-bold text-text-white mb-[15px]">
        Latest Episodes
      </h1>

      {loading ? (
        <div className="flex justify-center py-20 text-brand">Loading...</div>
      ) : animes.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[20px]">
            {animes.map((anime: any, index: number) => {
              const isLast = index === animes.length - 1;
              return (
                <div key={`${anime.id}-${index}`} ref={isLast ? lastElementRef : null}>
                  <AnimeCard
                    id={anime.id}
                    title={anime.title || anime.name}
                    poster={anime.poster}
                    episodeInfo={{ 
                      sub: anime.tvInfo?.sub?.toString() || anime.episodes?.sub?.toString(), 
                      dub: anime.tvInfo?.dub?.toString() || anime.episodes?.dub?.toString() 
                    }}
                  />
                </div>
              );
            })}
          </div>
          {loadingMore && (
            <div className="flex justify-center py-10 text-brand">Loading more...</div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-text-gray">No results found.</div>
      )}
    </div>
  );
}
