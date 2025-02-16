import { FC, useRef, useState, useEffect } from 'react';
import { SupportedLanguage } from '@/types/language';
import { SubtitleSettingsPanel, SubtitleSettings, defaultSettings } from './SubtitleSettings';
import { Card, CardBody, Button } from "@heroui/react";

interface VideoStreamProps {
  wsUrl: string;
  language: SupportedLanguage;
  onSubtitleChange: (data: { time: string; text: string }) => void;
  onSummaryChange: (data: { time: string; text: string }) => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onTranscription?: (data: any) => void;
}

const mockSubtitles = {
  'Русский': [
    "Здравствуйте, сегодня мы обсудим важную тему",
    "Искусственный интеллект меняет нашу жизнь",
    "Давайте рассмотрим несколько примеров",
    "Первый пример касается обработки текста",
  ],
  'English': [
    "Hello, today we will discuss an important topic",
    "Artificial intelligence is changing our lives",
    "Let's look at several examples",
    "The first example concerns text processing",
  ],
  'Испанский': [
    "Hola, hoy discutiremos un tema importante",
    "La inteligencia artificial está cambiando nuestras vidas",
    "Veamos varios ejemplos",
    "El primer ejemplo se refiere al procesamiento de texto",
  ]
} as const;

const mockSummaries = {
  'Русский': [
    "Начало дискуссии о влиянии ИИ",
    "Обсуждение практических примеров применения ИИ",
    "Анализ текстовых применений ИИ",
  ],
  'English': [
    "Beginning of discussion about AI impact",
    "Discussion of practical AI applications",
    "Analysis of AI text applications",
  ],
  'Испанский': [
    "Inicio de la discusión sobre el impacto de la IA",
    "Discusión de aplicaciones prácticas de la IA",
    "Análisis de aplicaciones de texto de IA",
  ]
} as const;

export const VideoStream: FC<VideoStreamProps> = ({
  language,
  onSubtitleChange,
  onSummaryChange,
  onPermissionGranted,
  onPermissionDenied,
  onTranscription,
  wsUrl
}) => {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'streaming' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>(defaultSettings);

  
  // Mock subtitle generation
  useEffect(() => {
    let subtitleIndex = 0;
    let summaryIndex = 0;
    
    const subtitleInterval = setInterval(() => {
      const subtitles = mockSubtitles[language];
      const subtitle = subtitles[subtitleIndex % subtitles.length];
      const time = new Date(Date.now()).toLocaleTimeString();
      
      setCurrentSubtitle(subtitle);
      onSubtitleChange({ time, text: subtitle });
      
      subtitleIndex++;
    }, 5000);
    
    const summaryInterval = setInterval(() => {
      const summaries = mockSummaries[language];
      const summary = summaries[summaryIndex % summaries.length];
      const time = new Date(Date.now()).toLocaleTimeString();
      
      onSummaryChange({ time, text: summary });
      
      summaryIndex++;
    }, 20000);
    
    return () => {
      clearInterval(subtitleInterval);
      clearInterval(summaryInterval);
    };
  }, [language, onSubtitleChange, onSummaryChange]);

  const startAudioProcessing = (stream: MediaStream) => {
    try {
      // Create Audio Context
      audioContextRef.current = new AudioContext();
      const audioContext = audioContextRef.current;

      // Create audio source from stream
      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor
      processorRef.current = audioContext.createScriptProcessor(16384, 1, 1);
      const processor = processorRef.current;

      // Connect the nodes
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Debug info update
      setDebugInfo(prev => prev + '\nAudio processing started');
      console.log('Audio context state:', audioContext.state);
      console.log('Sample rate:', audioContext.sampleRate);

      // Process audio data
      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Log audio data statistics
          const max = Math.max(...inputData);
          const min = Math.min(...inputData);
          const avg = inputData.reduce((a, b) => a + b) / inputData.length;
          
          console.log('Audio stats:', {
            max: max.toFixed(3),
            min: min.toFixed(3),
            avg: avg.toFixed(3),
            samples: inputData.length
          });

          // Send audio data to WebSocket
          wsRef.current.send(inputData.buffer);
        }
      };

    } catch (err) {
      console.error('Error starting audio processing:', err);
      setDebugInfo(prev => prev + '\nError: ' + String(err));
    }
  };

  const startWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setDebugInfo(prev => prev + '\nWebSocket already connected');
      return;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);
      setDebugInfo(prev => prev + '\nAttempting WebSocket connection...');

      wsRef.current.onopen = () => {
        setDebugInfo(prev => prev + '\nWebSocket connected');
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setCurrentSubtitle(data.text);
          onTranscription?.(data);
          setDebugInfo(prev => prev + '\nReceived transcription: ' + data.text);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          setDebugInfo(prev => prev + '\nError parsing message: ' + String(err));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setDebugInfo(prev => prev + '\nWebSocket error: ' + String(error));
      };

      wsRef.current.onclose = () => {
        setDebugInfo(prev => prev + '\nWebSocket closed');
        // Attempt to reconnect after 3 seconds
        setTimeout(startWebSocket, 3000);
      };

    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setDebugInfo(prev => prev + '\nError creating WebSocket: ' + String(err));
    }
  };

  const startStream = async () => {
    setStatus('waiting');
    setErrorMessage('');
    setDebugInfo('Starting stream...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Start WebSocket first
        startWebSocket();
        
        // Then start audio processing
        startAudioProcessing(stream);
        
        setStatus('streaming');
        onPermissionGranted?.();
        setDebugInfo(prev => prev + '\nStream started successfully');
      }
    } catch (err) {
      console.error('Stream error:', err);
      setDebugInfo(prev => prev + '\nStream error: ' + String(err));
      let message = 'Ошибка доступа к камере';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          message = 'Доступ к камере запрещён';
        } else if (err.name === 'NotFoundError') {
          message = 'Камера не найдена';
        } else if (err.name === 'NotReadableError') {
          message = 'Камера уже используется другим приложением';
        }
      }
      
      setErrorMessage(message);
      setStatus('error');
      onPermissionDenied?.();
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
    };
  }, []);

  return (
    <Card>
      <CardBody className="p-0 relative aspect-video max-h-[480px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover rounded-lg ${status !== 'streaming' ? 'hidden' : ''}`}
        />
        
        {status === 'streaming' && ( 
          <div>
            {currentSubtitle && (
              <div 
                className="absolute left-0 right-0 px-4 py-2"
                style={{
                  bottom: `${subtitleSettings.bottomOffset}px`,
                  background: subtitleSettings.backgroundColor,
                  fontFamily: subtitleSettings.fontFamily
                }}
              >
                <p 
                  className="text-center"
                  style={{
                    color: subtitleSettings.textColor,
                    fontSize: `${subtitleSettings.fontSize}px`
                  }}
                >
                  {currentSubtitle}
                </p>
              </div>
            )}
          </div>
        )}
        
        {status !== 'streaming' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center px-4">
              {status === 'idle' && (
                <Button 
                  color="primary"
                  size="lg"
                  onPress={startStream}
                >
                  Попробовать
                </Button>
              )}
              {status === 'waiting' && (
                <>
                  <p className="text-lg mb-2">Ожидание разрешения...</p>
                  <p className="text-sm text-gray-600">
                    Пожалуйста, разрешите доступ к камере и микрофону
                  </p>
                </>
              )}
              {status === 'error' && (
                <>
                  <p className="text-lg text-red-600 mb-4">{errorMessage}</p>
                  <Button 
                    color="primary"
                    onPress={startStream}
                  >
                    Попробовать снова
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Debug information - show this while developing */}
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 font-mono whitespace-pre-wrap">
          {debugInfo.split('\n').slice(-5).join('\n')}
        </div>

        <div className="absolute top-4 right-4">
          <SubtitleSettingsPanel 
            settings={subtitleSettings}
            onSettingsChange={setSubtitleSettings}
          />
        </div>
      </CardBody>
    </Card>
  );
};