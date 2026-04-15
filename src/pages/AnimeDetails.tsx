import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnimeInfo, getEpisodes } from "@/services/api";
import { Play } from "lucide-react";

export default function AnimeDetails() {
  const { id } = useParams<{ id: string }>();
  const [info, setInfo] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    Promise.all([getAnimeInfo(id), getEpisodes(id)])
      .then(([infoRes, epRes]) => {
        setInfo(infoRes.results?.data);
        setEpisodes(epRes.results?.episodes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20 text-brand">Loading...</div>;
  }

  if (!info) {
    return <div className="text-center py-20 text-text-gray">Anime not found.</div>;
  }

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="relative rounded-[16px] overflow-hidden bg-gradient-to-tr from-[#1a1a1c] to-[#2a2a2e] border border-border-subtle p-[40px] flex flex-col md:flex-row gap-[40px] items-center md:items-start">
        <div className="w-[200px] shrink-0">
          <img
            src={info?.poster}
            alt={info?.title}
            className="w-full rounded-[12px] shadow-2xl border border-border-subtle"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-[15px] z-10">
          <div className="bg-brand px-[10px] py-[4px] rounded-[4px] text-[10px] font-bold uppercase inline-block self-start">
            {info?.animeInfo?.tvInfo?.showType || 'Anime'}
          </div>
          <h1 className="text-[40px] leading-[1.1] font-extrabold text-text-white">{info?.title}</h1>
          <div className="flex flex-wrap gap-[10px] text-[12px] text-text-gray font-medium">
            {info?.animeInfo?.tvInfo?.rating && <span className="bg-surface px-2 py-1 rounded border border-border-subtle">{info.animeInfo.tvInfo.rating}</span>}
            {info?.animeInfo?.tvInfo?.quality && <span className="bg-surface px-2 py-1 rounded border border-border-subtle">{info.animeInfo.tvInfo.quality}</span>}
            {info?.animeInfo?.tvInfo?.sub && <span className="bg-brand/20 text-brand px-2 py-1 rounded border border-brand/30">SUB: {info.animeInfo.tvInfo.sub}</span>}
            {info?.animeInfo?.tvInfo?.dub && <span className="bg-[#4ade80]/20 text-[#4ade80] px-2 py-1 rounded border border-[#4ade80]/30">DUB: {info.animeInfo.tvInfo.dub}</span>}
          </div>
          
          <p className="text-text-gray text-[14px] leading-[1.6]">
            {info?.animeInfo?.Overview}
          </p>
          
          {episodes.length > 0 && (
            <div className="pt-[10px] flex gap-[15px]">
              <Link
                to={`/watch/${episodes[0].id}`}
                className="inline-flex items-center gap-2 bg-brand text-white px-[28px] py-[12px] rounded-[8px] font-semibold text-[14px] hover:bg-brand/90 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Episode 1
              </Link>
              <button className="bg-glass text-white border border-border-subtle px-[28px] py-[12px] rounded-[8px] font-semibold text-[14px] hover:bg-glass/80 transition-colors">
                Add to List
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-[15px]">
        <div className="text-[18px] font-bold flex justify-between items-center text-text-white">
          <h2>Episodes</h2>
          <span className="text-[12px] text-brand uppercase tracking-[1px]">{episodes.length} Episodes</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[15px]">
          {episodes.map((ep: any) => (
            <Link
              key={ep.id}
              to={`/watch/${ep.id}`}
              className="bg-surface border border-border-subtle hover:border-brand rounded-[8px] p-[15px] text-center transition-colors flex flex-col items-center justify-center gap-1"
            >
              <div className="text-[14px] font-semibold text-text-white">Episode {ep.episode_no}</div>
              <div className="text-[11px] text-text-gray truncate w-full" title={ep.title}>{ep.title || `Episode ${ep.episode_no}`}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
