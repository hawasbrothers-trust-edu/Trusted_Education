import React, { useState, useRef, useEffect } from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { formatAudioSeconds } from '../utils/cmsHelpers.ts';
import { Play, Pause, Star, Quote, CheckCircle, Volume2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { content } = useSiteContent();
  const { testimonialsSection, testimonials } = content;
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const [audioCurrentTime, setAudioCurrentTime] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = (id: string, audioUrl?: string) => {
    // Stop current real audio element if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingAudioId === id) {
      setPlayingAudioId(null);
      return;
    }

    if (audioUrl && audioUrl.trim().length > 0) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          setAudioProgress((prev) => ({
            ...prev,
            [id]: (audio.currentTime / audio.duration) * 100,
          }));
          setAudioCurrentTime((prev) => ({
            ...prev,
            [id]: formatAudioSeconds(audio.currentTime),
          }));
        }
      };

      audio.onended = () => {
        setPlayingAudioId(null);
        setAudioProgress((prev) => ({ ...prev, [id]: 0 }));
      };

      audio.onerror = () => {
        setPlayingAudioId(null);
      };

      audio.play().catch(() => {
        setPlayingAudioId(null);
      });
    }

    setPlayingAudioId(id);
  };

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2C5F8A] font-semibold mb-2">
            <span>{testimonialsSection.kickerLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{testimonialsSection.kickerRight}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight leading-snug">
            {testimonialsSection.headline}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {testimonialsSection.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => {
            const isPlaying = playingAudioId === item.id;
            const hasRealAudio = Boolean(item.audioUrl && item.audioUrl.trim().length > 0);
            const progress = audioProgress[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-[#F7F9FC] rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between hover:border-[#2C5F8A]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(Math.max(1, Math.min(5, item.rating || 5)))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-slate-300 rotate-180" />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 font-normal">
                    "{item.feedback}"
                  </p>
                </div>

                <div>
                  {item.hasAudio && (
                    <div className="mb-4 p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleAudio(item.id, item.audioUrl)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                          isPlaying
                            ? 'bg-[#1A3A5C] text-white shadow-xs'
                            : 'bg-[#F0F5FA] text-[#2C5F8A] hover:bg-[#2C5F8A] hover:text-white'
                        }`}
                        aria-label={isPlaying ? 'إيقاف التسجيل الصوتي' : 'تشغيل التسجيل الصوتي للعميل'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>

                      {hasRealAudio ? (
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2C5F8A] transition-all duration-150"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Volume2 className="w-3 h-3 text-[#2C5F8A]" />
                              مقطع صوتي موثق
                            </span>
                            <span className="font-mono tabular-nums">
                              {isPlaying ? audioCurrentTime[item.id] || '0:00' : item.audioDuration}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 flex items-center gap-1 h-5 overflow-hidden">
                            {[6, 12, 18, 14, 8, 16, 20, 10, 15, 7, 13, 19, 11, 16, 9].map((height, hIdx) => (
                              <span
                                key={hIdx}
                                style={{ height: `${height}px` }}
                                className={`w-1 rounded-full transition-all duration-300 ${
                                  isPlaying ? 'bg-[#2C5F8A] animate-pulse' : 'bg-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono tabular-nums shrink-0">
                            {isPlaying ? 'جاري الاستماع...' : item.audioDuration}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200/60 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {item.avatarUrl && (
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-[#1A3A5C]">{item.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{item.role}</p>
                        <div className="text-[11px] text-[#2C5F8A] mt-0.5 font-medium flex flex-wrap items-center gap-1">
                          <span>{item.university}</span>
                          {item.country && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{item.country}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"
                      title="باحث موثق"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
