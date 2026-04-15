import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Settings, Download, Loader2, Play, Pause, Volume2, VolumeX, Maximize, Minimize, AlertCircle, RefreshCw } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  poster?: string;
  subtitles?: { url: string; lang: string }[];
  onError?: () => void;
  onRetry?: () => void;
  onEnded?: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

export default function VideoPlayer({ url, poster, subtitles, onError, onRetry, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  const [qualities, setQualities] = useState<{ height: number; url: string }[]>([]);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    setQualities([]); // Reset qualities on url change
    setPlayerError(null);

    const handleNativeError = () => {
      console.error("Native video error");
      setPlayerError("The video format is not supported or the stream is unavailable.");
      onError?.();
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        if (videoRef.current) {
          videoRef.current.playbackRate = speedRef.current;
        }
        
        if (data.levels) {
          const availableQualities = data.levels
            .map((level) => ({
              height: level.height,
              url: level.url,
            }))
            .filter((q) => q.height && q.url);
          
          // Deduplicate and sort descending
          const uniqueQualities = Array.from(new Map(availableQualities.map(q => [q.height, q])).values());
          uniqueQualities.sort((a, b) => b.height - a.height);
          setQualities(uniqueQualities);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error encountered", data);
              hls?.destroy();
              setPlayerError("A network error occurred while trying to load the video.");
              onError?.();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error encountered, trying to recover", data);
              hls?.recoverMediaError();
              break;
            default:
              console.error("Fatal error encountered", data);
              hls?.destroy();
              setPlayerError("An unexpected error occurred during playback.");
              onError?.();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        if (videoRef.current) {
          videoRef.current.playbackRate = speedRef.current;
          setDuration(videoRef.current.duration);
        }
      });
      video.addEventListener('error', handleNativeError);
      // Fallback for Safari native HLS
      setQualities([{ height: 0, url: url }]);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.removeEventListener('error', handleNativeError);
      }
    };
  }, [url, onError, retryCount]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
    setShowSpeedMenu(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(newProgress) ? 0 : newProgress);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.playbackRate = speedRef.current;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.target.value) / 100) * duration;
    if (videoRef.current && !isNaN(newTime)) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(Number(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) setShowControls(false);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const downloadHLS = async (playlistUrl: string | string[], quality: string) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      setShowDownloadMenu(false);

      let currentPlaylistUrl = Array.isArray(playlistUrl) ? playlistUrl[0] : playlistUrl;
      if (typeof currentPlaylistUrl !== 'string') {
        currentPlaylistUrl = String(currentPlaylistUrl);
      }
      
      let response = await fetch(currentPlaylistUrl);
      let playlistText = await response.text();

      // If it's a master playlist, pick the first stream (usually best quality)
      if (playlistText.includes('#EXT-X-STREAM-INF')) {
        const lines = playlistText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
            let nextLine = lines[i + 1];
            if (nextLine && !nextLine.startsWith('#')) {
              const baseUrl = currentPlaylistUrl.substring(0, currentPlaylistUrl.lastIndexOf('/') + 1);
              currentPlaylistUrl = nextLine.startsWith('http') ? nextLine : baseUrl + nextLine;
              response = await fetch(currentPlaylistUrl);
              playlistText = await response.text();
              break;
            }
          }
        }
      }

      const lines = playlistText.split('\n');
      const segmentUrls: string[] = [];
      const baseUrl = currentPlaylistUrl.substring(0, currentPlaylistUrl.lastIndexOf('/') + 1);

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const segmentUrl = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
          segmentUrls.push(segmentUrl);
        }
      }

      if (segmentUrls.length === 0) throw new Error("No video segments found.");

      const buffers: Uint8Array[] = [];
      let downloaded = 0;
      const batchSize = 3; // Keep batch size small to avoid memory/network spikes

      for (let i = 0; i < segmentUrls.length; i += batchSize) {
        const batch = segmentUrls.slice(i, i + batchSize);
        const promises = batch.map(async (url) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch segment: ${res.statusText}`);
          const arrayBuffer = await res.arrayBuffer();
          return new Uint8Array(arrayBuffer);
        });

        const batchBuffers = await Promise.all(promises);
        buffers.push(...batchBuffers);
        downloaded += batch.length;
        setDownloadProgress(Math.min(100, Math.round((downloaded / segmentUrls.length) * 100)));
      }

      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of buffers) {
        combined.set(buf, offset);
        offset += buf.length;
      }

      const blob = new Blob([combined], { type: 'video/mp2t' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${quality}.ts`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download video. Please check your connection or try a different quality.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div 
      ref={playerContainerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {playerError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-6 text-center">
          <div className="bg-surface border border-border-subtle p-6 rounded-xl max-w-md flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Playback Error</h3>
            <p className="text-text-gray text-sm">{playerError}</p>
            <button 
              onClick={() => {
                setPlayerError(null);
                setRetryCount(c => c + 1);
                if (onRetry) onRetry();
              }}
              className="mt-2 px-6 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        poster={poster}
        className="w-full h-full cursor-pointer"
        crossOrigin="anonymous"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
      >
        {subtitles?.map((sub, idx) => (
          <track
            key={idx}
            kind="captions"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.lang}
            default={sub.lang.toLowerCase() === "english"}
          />
        ))}
      </video>

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pt-12 pb-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div className="w-full mb-4 flex items-center group/progress cursor-pointer">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={isNaN(progress) ? 0 : progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-brand hover:h-2 transition-all"
            style={{
              background: `linear-gradient(to right, var(--color-brand) ${isNaN(progress) ? 0 : progress}%, rgba(255,255,255,0.2) ${isNaN(progress) ? 0 : progress}%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-brand transition-colors">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-brand transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                style={{
                  background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>

            <div className="text-white/90 text-[13px] font-medium font-mono tracking-wide">
              {formatTime(currentTime)} <span className="text-white/40 mx-1">/</span> {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Download Control */}
            {qualities.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => {
                    if (isDownloading) return;
                    setShowDownloadMenu(!showDownloadMenu);
                    setShowSpeedMenu(false);
                  }}
                  disabled={isDownloading}
                  className={`text-white hover:text-brand transition-colors flex items-center gap-1 ${isDownloading ? 'opacity-80 cursor-not-allowed' : ''}`}
                  title="Download"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-[12px] font-bold">{downloadProgress}%</span>
                    </>
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
                
                {showDownloadMenu && !isDownloading && (
                  <div className="absolute bottom-full right-0 mb-4 bg-surface border border-border-subtle rounded-[8px] shadow-2xl overflow-hidden backdrop-blur-md min-w-[120px] flex flex-col">
                    {qualities.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => downloadHLS(q.url, q.height ? `${q.height}p` : 'Original')}
                        className="w-full text-left px-4 py-2 text-[13px] text-text-gray hover:bg-white/5 hover:text-text-white transition-colors"
                      >
                        {q.height ? `${q.height}p` : 'Original'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speed Control */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowDownloadMenu(false);
                }}
                className="text-white hover:text-brand transition-colors flex items-center gap-1"
                title="Playback Speed"
              >
                <Settings className="w-5 h-5" />
                <span className="text-[12px] font-bold">{speed}x</span>
              </button>
              
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-4 bg-surface border border-border-subtle rounded-[8px] shadow-2xl overflow-hidden backdrop-blur-md min-w-[100px] flex flex-col">
                  {PLAYBACK_SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                        speed === s ? "bg-brand/20 text-brand font-semibold" : "text-text-gray hover:bg-white/5 hover:text-text-white"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button onClick={toggleFullscreen} className="text-white hover:text-brand transition-colors ml-1">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
