import { useState, useEffect, useRef, useCallback } from 'react';

// Supported voice commands
export type VoiceCommand = 'play' | 'pause' | 'stop' | 'next' | 'add to queue';

interface VoiceControlOptions {
  onCommand: (command: VoiceCommand) => void;
  onError?: (error: string) => void;
}

export function useVoiceControl({ onCommand, onError }: VoiceControlOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check browser support and initialize recognition (only once)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      // Configure recognition
      recognitionRef.current.continuous = false; // Stop after one command
      recognitionRef.current.interimResults = false; // Only final results
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
    } else {
      setIsSupported(false);
    }

    // Cleanup only on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []); // Empty dependency array - run only once

  // Parse recognized text into command
  const parseCommand = useCallback((text: string): VoiceCommand | null => {
    const normalized = text.toLowerCase().trim();

    // Match commands (exact or contains)
    if (normalized.includes('add to queue') || normalized.includes('add queue')) {
      return 'add to queue';
    }
    if (normalized === 'play' || normalized.includes('play')) {
      return 'play';
    }
    if (normalized === 'pause' || normalized.includes('pause')) {
      return 'pause';
    }
    if (normalized === 'stop' || normalized.includes('stop')) {
      return 'stop';
    }
    if (normalized === 'next' || normalized.includes('next')) {
      return 'next';
    }

    return null;
  }, []);

  // Setup recognition handlers (stable references)
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    const handleStart = () => {
      setIsListening(true);
      setLastCommand(null);
    };

    const handleResult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLastCommand(transcript);

      const command = parseCommand(transcript);
      if (command) {
        onCommand(command);
      } else {
        onError?.(`Command not recognized: "${transcript}". Try: play, pause, stop, next, or add to queue.`);
      }
    };

    const handleError = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      // Ignore 'aborted' errors (caused by user stopping or switching tabs)
      if (event.error === 'aborted') {
        return;
      }

      if (event.error === 'no-speech') {
        onError?.('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        onError?.('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error !== 'aborted') {
        onError?.(`Speech recognition error: ${event.error}`);
      }
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    recognition.onstart = handleStart;
    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    // No cleanup needed - handlers will be replaced on next effect run
  }, [parseCommand, onCommand, onError]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      onError?.('Speech recognition not available');
      return;
    }

    try {
      // Only start if not already listening
      if (!isListening) {
        recognitionRef.current.start();
      }
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      // Handle "already started" error gracefully
      if (error.message && error.message.includes('already started')) {
        // Recognition already running, ignore
        return;
      }
      onError?.('Failed to start voice recognition. Please try again.');
    }
  }, [isSupported, isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error: any) {
        console.error('Error stopping recognition:', error);
        // Force state update even if stop fails
        setIsListening(false);
      }
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
  };
}
