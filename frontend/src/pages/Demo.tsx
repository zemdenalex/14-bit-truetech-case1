import { FC, useState } from 'react';
import { Card, CardBody, CardHeader, Tabs, Tab, Switch, Button } from "@heroui/react";
import { VideoStream } from '@/components/conference/VideoStream';
import { useNavigate } from 'react-router-dom';

const Demo: FC = () => {
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Русский');

  const handlePermissionGranted = () => {
    setIsStreaming(true);
  };

  const handlePermissionDenied = () => {
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-6 py-8">
        <div className='flex justify-between'>
          <h1 className="text-3xl font-bold mb-4">Демонстрация сервиса</h1>
          <Button 
            color="primary"
            size="lg"
            onPress={() => navigate('/')}
          >
            Вернуться на главную
          </Button>
        </div>
        <p className="text-gray-600 mb-8">
          Попробуйте поговорить и посмотреть, как сервис работает
        </p>

        <VideoStream 
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />

        {isStreaming && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Настройки</h3>
              </CardHeader>
              <CardBody>
                <Tabs 
                  aria-label="Language Options" 
                  selectedKey={selectedLanguage}
                  onSelectionChange={(key) => setSelectedLanguage(String(key))}
                >
                  <Tab key="Оригинал" title="Оригинал" />
                  <Tab key="Русский" title="Русский" />
                  <Tab key="Английский" title="Английский" />
                  <Tab key="Испанский" title="Испанский" />
                  <Tab key="Китайский" title="Китайский" />
                </Tabs>
                
                <div className="mt-4 flex items-center gap-2">
                  <Switch 
                    isSelected={subtitlesEnabled}
                    onValueChange={setSubtitlesEnabled}
                    aria-label="Enable subtitles"
                  />
                  <span>Включить субтитры</span>
                </div>
              </CardBody>
            </Card>

            {/* Add transcript component here if needed */}
          </>
        )}
      </div>
    </div>
  );
};

export default Demo;