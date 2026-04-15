import React from "react";
import { Link } from "react-router-dom";

interface AnimeCardProps {
  id: string;
  title: string;
  poster: string;
  number?: string;
  episodeInfo?: {
    sub?: string;
    dub?: string;
  };
}

const AnimeCard: React.FC<AnimeCardProps> = ({ id, title, poster, number, episodeInfo }) => {
  return (
    <Link 
      to={`/anime/${id}`} 
      className="bg-surface rounded-[12px] h-[220px] border border-border-subtle relative flex flex-col justify-end p-[15px] overflow-hidden group"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${poster})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      {number && (
        <div className="absolute top-0 left-0 bg-brand text-white font-bold text-[14px] px-[10px] py-[4px] rounded-br-[12px] z-20 shadow-md">
          #{number}
        </div>
      )}

      <div className="relative z-10">
        <div className="text-[11px] text-brand font-semibold mb-1 uppercase tracking-wider">
          {episodeInfo?.sub ? `EPISODE ${episodeInfo.sub}` : 'WATCH NOW'}
        </div>
        <div className="text-[14px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-text-white">
          {title}
        </div>
        <div className="flex gap-[10px] mt-2 text-[10px] text-text-gray items-center">
          {episodeInfo?.dub && (
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full inline-block mr-1" />
              DUB {episodeInfo.dub}
            </span>
          )}
          <span>Anime</span>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
