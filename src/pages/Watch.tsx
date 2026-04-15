import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { getStreamInfo, getEpisodes, getAnimeInfo } from "@/services/api";
import VideoPlayer from "@/components/VideoPlayer";
import AnimeCard from "@/components/AnimeCard";

const M3U8_PROXIES = [
  'https://hiu-liart.vercel.app/m3u8-proxy?url=',
  'https://animekai-proxy1.vercel.app/m3u8?url=',
  'https://animepahe-proxy1.vercel.app/m3u8-proxy?url='
];

export default function Watch() {
  const { id } = useParams<{ id: string }>(); // animeId part
  const location = useLocation();
  const navigate = useNavigate();
  
  // The full episode ID might be in the URL path or query string
  // If the link was `/watch/one-piece-100?ep=1234`, id is `one-piece-100` and location.search is `?ep=1234`
  // The API expects `id=one-piece-100?ep=1234`
  const fullEpisodeId = id + location.search;

  const [streamData, setStreamData] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [similarAnimes, setSimilarAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proxyIndex, setProxyIndex] = useState(-1); // -1 means direct URL, 0+ means using M3U8_PROXIES
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  // Extract animeId from episodeId
  const animeId = id;

  useEffect(() => {
    if (!fullEpisodeId) return;
    
    setLoading(true);
    setError("");
    setProxyIndex(-1); // Reset proxy index on new episode

    // Fetch stream info
    getStreamInfo(fullEpisodeId)
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setStreamData(res);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Fetch episodes list for the sidebar
    if (animeId) {
      getEpisodes(animeId)
        .then((res) => setEpisodes(res.results?.episodes || []))
        .catch(console.error);
        
      // Fetch anime info to get similar/recommended anime
      getAnimeInfo(animeId)
        .then((res) => {
          const recommended = res.results?.recommended_data || [];
          const related = res.results?.related_data || [];
          setSimilarAnimes(recommended.length > 0 ? recommended : related);
        })
        .catch(console.error);
    }
  }, [fullEpisodeId, animeId]);

  const handleVideoError = () => {
    if (proxyIndex < M3U8_PROXIES.length - 1) {
      console.log(`Video stream failed. Trying proxy ${proxyIndex + 1}...`);
      setProxyIndex(prev => prev + 1);
    } else {
      console.log("All proxies exhausted.");
    }
  };

  const handleVideoEnded = () => {
    if (!autoPlayNext || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === fullEpisodeId);
    if (currentIndex === -1) return;

    // Determine direction based on episode numbers (usually ascending)
    let nextEpisode;
    if (episodes.length > 1) {
      const isDescending = Number(episodes[0].episode_no) > Number(episodes[episodes.length - 1].episode_no);
      if (isDescending) {
        nextEpisode = episodes[currentIndex - 1]; // Next episode is above it
      } else {
        nextEpisode = episodes[currentIndex + 1]; // Next episode is below it
      }
    }

    if (nextEpisode) {
      navigate(`/watch/${nextEpisode.id}`);
    }
  };

  const defaultSource = streamData?.results?.streamingLink?.[0]?.link;
  
  const videoUrl = defaultSource 
    ? (proxyIndex === -1 ? defaultSource : `${M3U8_PROXIES[proxyIndex]}${encodeURIComponent(defaultSource)}`) 
    : "";

  return (
    <div className="flex flex-col lg:flex-row gap-[30px]">
      <div className="flex-1 flex flex-col gap-[15px]">
        {loading ? (
          <div className="aspect-video bg-surface border border-border-subtle rounded-[16px] flex items-center justify-center text-brand">
            Loading player...
          </div>
        ) : error ? (
          <div className="aspect-video bg-surface border border-border-subtle rounded-[16px] flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : videoUrl ? (
          <VideoPlayer
            url={videoUrl}
            subtitles={streamData?.results?.tracks?.filter((t: any) => t.kind === "captions").map((t: any) => ({
              url: t.file,
              lang: t.label
            }))}
            onError={handleVideoError}
            onRetry={() => setProxyIndex(-1)}
            onEnded={handleVideoEnded}
          />
        ) : (
          <div className="aspect-video bg-surface border border-border-subtle rounded-[16px] flex items-center justify-center text-text-gray">
            No video source found.
          </div>
        )}
        
        <div className="bg-surface border border-border-subtle p-[20px] rounded-[16px]">
          <h1 className="text-[20px] font-bold text-text-white">Now Playing</h1>
          <p className="text-text-gray mt-1 text-[14px]">{fullEpisodeId}</p>
        </div>

        {/* Similar Anime Section */}
        {similarAnimes.length > 0 && (
          <div className="mt-4">
            <h2 className="text-[18px] font-bold text-text-white mb-[15px]">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[20px]">
              {similarAnimes.slice(0, 10).map((anime: any) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title || anime.name}
                  poster={anime.poster}
                  episodeInfo={{ 
                    sub: anime.tvInfo?.sub?.toString() || anime.episodes?.sub?.toString(), 
                    dub: anime.tvInfo?.dub?.toString() || anime.episodes?.dub?.toString() 
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-[15px]">
        <div className="bg-surface border border-border-subtle p-[20px] rounded-[16px] h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-[15px]">
            <h2 className="text-[18px] font-bold text-text-white">Episodes</h2>
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className="text-[11px] text-text-gray font-bold uppercase tracking-wider group-hover:text-text-white transition-colors">Autoplay</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${autoPlayNext ? 'bg-brand' : 'bg-white/20'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${autoPlayNext ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={autoPlayNext} 
                onChange={(e) => setAutoPlayNext(e.target.checked)} 
              />
            </label>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] pr-[10px] custom-scrollbar">
            {episodes.map((ep) => {
              const isActive = ep.id === fullEpisodeId;
              return (
                <Link
                  key={ep.id}
                  to={`/watch/${ep.id}`}
                  className={`block p-[12px] rounded-[8px] text-[14px] transition-colors border ${
                    isActive 
                      ? "bg-brand/10 border-brand text-brand font-semibold" 
                      : "bg-main border-border-subtle hover:border-text-gray text-text-gray hover:text-text-white"
                  }`}
                >
                  <div className="flex items-center gap-[12px]">
                    <span className={`w-[30px] text-center ${isActive ? "text-brand" : "text-text-gray"}`}>
                      {ep.episode_no}
                    </span>
                    <span className="truncate flex-1">{ep.title || `Episode ${ep.episode_no}`}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
