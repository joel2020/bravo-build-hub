import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS = {
  intro: 12000,
  area: 10000,
  services: 16000,
  trust: 10000,
  cta: 12000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  intro: Scene1,
  area: Scene2,
  services: Scene3,
  trust: Scene4,
  cta: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
  isMuted = true,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
  isMuted?: boolean;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const baseKey = currentSceneKey.replace(/_r[12]$/, '');
    if (baseKey === 'intro') {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  }, [currentSceneKey]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = isMuted;
    if (!isMuted && a.paused) {
      a.play().catch(() => {});
    }
  }, [isMuted]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}voiceover.mp3`}
        muted={isMuted}
        playsInline
      />
      {/* Persistent background layers */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }}
          animate={{
            x: ['-20%', '10%', '-10%', '-20%'],
            y: ['-10%', '20%', '-5%', '-10%'],
            scale: [1, 1.2, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] rounded-full opacity-5 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{
            x: ['10%', '-10%', '0%', '10%'],
            y: ['10%', '-15%', '5%', '10%'],
            scale: [1, 1.3, 1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Persistent geometric accent that morphs across scenes */}
      <motion.div
        className="absolute z-10"
        animate={{
          left: ['0%', '50%', '10%', '70%', '0%'][sceneIndex],
          top: ['100%', '0%', '80%', '20%', '0%'][sceneIndex],
          width: ['100%', '2px', '40%', '4px', '100%'][sceneIndex],
          height: ['8px', '100%', '4px', '60%', '8px'][sceneIndex],
          backgroundColor: sceneIndex === 4 ? 'var(--color-accent)' : 'var(--color-primary)',
          opacity: [0.8, 0.5, 0.7, 0.4, 0.9][sceneIndex],
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      <AnimatePresence initial={false} mode="wait">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
