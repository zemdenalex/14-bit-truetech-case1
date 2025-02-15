import { FC, useRef, useState, useEffect } from 'react';
import { Card, CardBody, Button } from "@heroui/react";

interface VideoStreamProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export const VideoStream: FC<VideoStreamProps> = ({
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'streaming' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkMediaPermissions = async () => {
    try {
      // First check if permissions are already granted
      const permissions = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop this test stream immediately
      permissions.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (err) {
      console.log('Permission check failed:', err);
      return false;
    }
  };

  const startStream = async () => {
    setStatus('waiting');
    setErrorMessage('');
    
    try {
      console.log('Checking permissions...');
      const hasPermissions = await checkMediaPermissions();
      
      if (!hasPermissions) {
        throw new Error('Permissions not granted');
      }

      console.log('Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('Stream obtained, setting up video...');
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, playing...');
          videoRef.current?.play()
            .then(() => {
              console.log('Video playing successfully');
              setStatus('streaming');
              onPermissionGranted?.();
            })
            .catch((err) => {
              console.error('Error playing video:', err);
              throw new Error('Failed to play video');
            });
        };
      }
    } catch (err) {
      console.error('Stream error:', err);
      let message = 'Ошибка доступа к камере';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Доступ к камере запрещён';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = 'Камера не найдена';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
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
        console.log('Cleaning up stream...');
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped track: ${track.kind}`);
        });
      }
    };
  }, []);

  return (
    <Card className="mb-6">
      <CardBody className="p-0 relative aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover rounded-lg ${status !== 'streaming' ? 'hidden' : ''}`}
        />
        
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
                  <p className="text-sm text-gray-600">Пожалуйста, разрешите доступ к камере и микрофону</p>
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
      </CardBody>
    </Card>
  );
};