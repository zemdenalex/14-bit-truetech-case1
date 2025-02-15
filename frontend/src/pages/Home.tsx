import { FC } from 'react';
import { Button, Card, CardBody } from "@heroui/react";
import { useNavigate } from 'react-router-dom';

const Home: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">BIThoven</h1>
          <p className="text-xl text-gray-600">
            Сделайте ваши видеоконференции доступными для всех
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardBody>
              <h2 className="text-2xl font-semibold mb-4">О проекте</h2>
              <p className="text-gray-600">
                BIThoven - это инновационное решение для распознавания речи и 
                создания субтитров в реальном времени. Наша технология делает 
                видеоконференции доступными для людей с особыми потребностями.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-2xl font-semibold mb-4">Возможности</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Распознавание речи в реальном времени</li>
                <li>Мгновенный перевод на разные языки</li>
                <li>Настраиваемые субтитры</li>
                <li>Поддержка нескольких спикеров</li>
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            color="primary"
            size="lg"
            onPress={() => navigate('/demo')}
          >
            Попробовать сейчас
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Home;