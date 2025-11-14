
import { useCallback, useMemo } from 'react';
import { PAGE_FLIP_SOUND } from '../constants';

const useSound = () => {
  const audio = useMemo(() => {
    if (typeof window !== 'undefined') {
        const audioInstance = new Audio(PAGE_FLIP_SOUND);
        audioInstance.volume = 0.3; // Lower volume for a subtle effect
        return audioInstance;
    }
    return null;
  }, []);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0; // Rewind to the start
      audio.play().catch(error => console.error("Error playing sound:", error));
    }
  }, [audio]);

  return { play };
};

export default useSound;
