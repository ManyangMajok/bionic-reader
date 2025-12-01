import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';

export const RSVPReader = ({ text, onClose }: { text: string; onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAudioOn, setIsAudioOn] = useState(false);
  
  const words = useRef(text.split(/\s+/).filter(w => w.length > 0)).current;

  // --- WEB AUDIO API REFS ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 1. Initialize Audio Engine (Lazy Load)
  const initAudio = () => {
    if (audioCtxRef.current) return;

    // Create Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();

    // Generate 5 seconds of Brown Noise
    const bufferSize = ctx.sampleRate * 5; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Brown Noise Algorithm: Integrate White Noise
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate for gain loss
    }

    // Create Source
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Create Volume (Gain)
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15; // Start gentle (15%)

    // Connect graph: Source -> Gain -> Speakers
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();

    // Store refs
    audioCtxRef.current = ctx;
    gainNodeRef.current = gainNode;
    
    // Start in suspended state until user toggles
    ctx.suspend();
  };

  // 2. Handle Audio Toggle
  useEffect(() => {
    // Initialize on first toggle if needed
    if (isAudioOn && !audioCtxRef.current) {
        initAudio();
    }

    if (audioCtxRef.current) {
        if (isAudioOn) {
            audioCtxRef.current.resume();
        } else {
            audioCtxRef.current.suspend();
        }
    }

    // Cleanup on unmount
    return () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };
  }, [isAudioOn]);

  // 3. Handle Word Cycling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentIndex < words.length) {
      const delay = 60000 / wpm;
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, wpm, words.length, currentIndex]);


  // --- RENDER HELPER ---
  const renderWord = (word: string) => {
    if (!word) return "";
    const center = Math.floor(word.length / 2);
    const first = word.slice(0, center);
    const middle = word[center];
    const last = word.slice(center + 1);

    return (
      <div className="flex items-baseline justify-center w-full text-5xl sm:text-7xl font-mono font-bold text-gray-800">
        <span className="flex-1 text-right whitespace-nowrap overflow-visible">
          {first}
        </span>
        <span className="text-red-500 text-center shrink-0 px-0.5">
          {middle}
        </span>
        <span className="flex-1 text-left whitespace-nowrap overflow-visible">
          {last}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Word Display Area */}
      <div className="flex-1 flex items-center justify-center border-b border-gray-100 bg-gray-50 rounded-t-xl relative overflow-hidden">
         <div className="absolute top-4 bottom-4 left-1/2 w-px bg-red-500/20 -translate-x-1/2"></div>
         <div className="absolute left-4 right-4 top-1/2 h-px bg-gray-300/50 -translate-y-1/2"></div>
         
         <div className="z-10 w-full px-4">
            {renderWord(words[currentIndex])}
         </div>
      </div>

      {/* Controls Area */}
      <div className="p-6 bg-white rounded-b-xl shadow-inner space-y-6">
        
        {/* Progress */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
                className="bg-blue-600 h-full transition-all duration-100 ease-linear"
                style={{ width: `${(currentIndex / words.length) * 100}%` }}
            />
        </div>

        <div className="flex items-center justify-between gap-4">
            {/* Speed */}
            <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-bold text-gray-500 w-12">SPEED</span>
                <input 
                    type="range" 
                    min="100" 
                    max="800" 
                    step="50"
                    value={wpm}
                    onChange={(e) => setWpm(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm font-mono font-bold text-blue-600 w-16 text-right">{wpm} WPM</span>
            </div>

            {/* Audio Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={isAudioOn ? "text-green-600 bg-green-50" : "text-gray-400"}
                title="Toggle Brown Noise"
            >
                {isAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
        </div>

        {/* Play/Pause */}
        <div className="flex justify-center gap-4">
            <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                    setIsPlaying(false);
                    setCurrentIndex(0);
                }}
            >
                <RotateCcw className="w-5 h-5" />
            </Button>

            <Button 
                className="w-16 h-16 rounded-full bg-gray-900 hover:bg-black text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center"
                onClick={() => setIsPlaying(!isPlaying)}
            >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </Button>
        </div>
        
        <div className="text-center text-xs text-gray-400 font-medium">
            {currentIndex + 1} / {words.length} words
        </div>
      </div>
    </div>
  );
};