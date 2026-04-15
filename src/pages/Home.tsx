import { useEffect, useState } from "react";
import { getHomeInfo } from "@/services/api";
import AnimeCard from "@/components/AnimeCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomeInfo()
      .then((res) => {
        setData(res.results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-brand">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-20">Failed to load data.</div>;
  }

  const spotlight = data.spotlights?.[0];

  return (
    <>
      {/* Hero Section */}
      {spotlight && (
        <section className="relative h-[380px] rounded-[16px] overflow-hidden bg-gradient-to-tr from-[#1a1a1c] to-[#2a2a2e] flex items-center border border-border-subtle">
          <div className="p-[60px] max-w-[500px] z-10">
            <div className="bg-brand px-[10px] py-[4px] rounded-[4px] text-[10px] font-bold uppercase mb-[15px] inline-block">
              Trending Series
            </div>
            <h1 className="text-[48px] leading-[1.1] mb-[15px] font-extrabold line-clamp-2">
              {spotlight.title || spotlight.name}
            </h1>
            <p className="text-text-gray text-[14px] leading-[1.6] mb-[25px] line-clamp-3">
              {spotlight.description || "Watch the latest episodes of your favorite anime series online in high quality."}
            </p>
            <div className="flex gap-[15px]">
              <Link to={`/anime/${spotlight.id}`} className="bg-brand text-white px-[28px] py-[12px] rounded-[8px] font-semibold text-[14px] hover:bg-brand/90 transition-colors">
                Watch Now
              </Link>
              <button className="bg-glass text-white border border-border-subtle px-[28px] py-[12px] rounded-[8px] font-semibold text-[14px] hover:bg-glass/80 transition-colors">
                Add to List
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#1a1a1c] via-transparent to-transparent z-0 flex items-center justify-center">
            <div className="w-[300px] h-[300px] bg-glass border-2 border-dashed border-border-subtle rounded-full flex items-center justify-center text-border-subtle text-[40px] overflow-hidden">
              <img src={spotlight.poster} alt="" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
            </div>
          </div>
        </section>
      )}

      {/* Top Airing */}
      <section>
        <div className="text-[18px] font-bold mb-[15px] flex justify-between items-center">
          <h2>Currently Trending</h2>
          <Link to="/trending" className="text-[12px] text-brand uppercase tracking-[1px] cursor-pointer hover:underline">View All Weekly</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[20px]">
          {data.trending?.slice(0, 10).map((anime: any) => (
            <AnimeCard
              key={anime.id}
              id={anime.id}
              title={anime.title || anime.name}
              poster={anime.poster}
              number={anime.number}
              episodeInfo={{ 
                sub: anime.episodes?.sub?.toString() || anime.tvInfo?.sub?.toString(), 
                dub: anime.episodes?.dub?.toString() || anime.tvInfo?.dub?.toString() 
              }}
            />
          ))}
        </div>
      </section>
      
      {/* Latest Episodes */}
      <section>
        <div className="text-[18px] font-bold mb-[15px] flex justify-between items-center">
          <h2>Latest Episodes</h2>
          <Link to="/latest" className="text-[12px] text-brand uppercase tracking-[1px] cursor-pointer hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[20px]">
          {data.latestEpisode?.slice(0, 10).map((anime: any) => (
            <AnimeCard
              key={anime.id}
              id={anime.id}
              title={anime.title || anime.name}
              poster={anime.poster}
              episodeInfo={{ 
                sub: anime.episodes?.sub?.toString() || anime.tvInfo?.sub?.toString(), 
                dub: anime.episodes?.dub?.toString() || anime.tvInfo?.dub?.toString() 
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
