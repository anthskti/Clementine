import React, { useState, useRef, useEffect } from "react";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Your music playlist
  const playlist = [
    {
      title: "Sunset Bridge",
      artist: "ATLUS Sound Team",
      src: "/music/sunset bridge.mp3", // music file name
    },
  ];

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playPrevious = () => {
    const newTrack =
      currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(newTrack);
    setIsPlaying(true);
  };

  const playNext = () => {
    const newTrack =
      currentTrack === playlist.length - 1 ? 0 : currentTrack + 1;
    setCurrentTrack(newTrack);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: any) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: any) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Auto-play
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Auto-play prevented:", error);
        setIsPlaying(false);
      });
    }
  }, [currentTrack, isPlaying]);

  return (
    <div className="px-4 py-3 rounded-lg block z-50">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-4">
          {/* Track Info */}
          <div className="min-w-0 shrink-0">
            <h3 className="text-stone-900 font-semibold text-sm truncate">
              {playlist[currentTrack]?.title || "No Track"}
            </h3>
            <p className="text-stone-900 text-xs truncate">
              {playlist[currentTrack]?.artist || "Unknown Artist"}
            </p>
          </div>
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={playPrevious}
              className="textstone-900] hover:text-stone-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="text-stone-900 hover:text-stone-600 transition-colors"
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={playNext}
              className="text-stone-900 hover:text-stone-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 shrink-0">
            <svg
              className="w-4 h-4 text-stone-900"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.793a1 1 0 011.414-.131zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-stone-900/80 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #DBCEB4 0%, #DBCEB4 ${volume * 100}%, rgba(219, 206, 180, 0.3) ${volume * 100}%, rgba(219, 206, 180, 0.3) 100%)`,
                WebkitAppearance: "none",
                appearance: "none",
              }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-stone-900 text-xs w-8">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-stone-900/80 rounded-lg appearance-none cursor-pointer progress-slider"
            style={{
              background: `linear-gradient(to right, #DBCEB4 0%, #DBCEB4 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(219, 206, 180, 0.3) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(219, 206, 180, 0.3) 100%)`,
              WebkitAppearance: "none",
              appearance: "none",
            }}
          />
          <span className="text-stone-900 text-xs w-8">
            {formatTime(duration)}
          </span>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={playlist[currentTrack]?.src}
          onEnded={playNext}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={() => {
            if (audioRef.current) {
              audioRef.current.volume = volume;
            }
          }}
        />

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
          }
          .slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
          }
          .progress-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
          }
          .progress-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default MusicPlayer;
