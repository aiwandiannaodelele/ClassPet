"use client";

// Define the sound files we expect to have in the public/sounds/ directory
const SOUNDS = {
  scoreUp: '/sounds/score-up.mp3',
  scoreDown: '/sounds/score-down.mp3',
  levelUp: '/sounds/level-up.mp3',
  click: '/sounds/click.mp3',
  error: '/sounds/error.mp3',
};

type SoundType = keyof typeof SOUNDS;

class AudioPlayer {
  private static instance: AudioPlayer;
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;

  private constructor() {
    // Initialize audio elements if in browser environment
    if (typeof window !== 'undefined') {
      Object.entries(SOUNDS).forEach(([key, path]) => {
        const audio = new Audio(path);
        // Preload sounds for faster playback
        audio.preload = 'auto';
        this.audioElements.set(key, audio);
      });
    }
  }

  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  public play(type: SoundType, volume: number = 0.5) {
    if (this.isMuted || typeof window === 'undefined') return;

    const audio = this.audioElements.get(type);
    if (audio) {
      // Clone the node to allow overlapping sounds (e.g. multiple score ups in quick succession)
      const clonedAudio = audio.cloneNode() as HTMLAudioElement;
      clonedAudio.volume = volume;
      
      // Attempt to play, catch and ignore DOMException (usually caused by browser autoplay policies)
      clonedAudio.play().catch((error) => {
        console.warn(`Failed to play sound ${type}:`, error);
      });
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
  }
  
  public getMuteState() {
    return this.isMuted;
  }
}

export const audioPlayer = AudioPlayer.getInstance();

// Convenience helper functions
export const playScoreUp = () => audioPlayer.play('scoreUp', 0.6);
export const playScoreDown = () => audioPlayer.play('scoreDown', 0.5);
export const playLevelUp = () => audioPlayer.play('levelUp', 0.8);
export const playClick = () => audioPlayer.play('click', 0.3);
export const playError = () => audioPlayer.play('error', 0.4);
