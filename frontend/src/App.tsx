import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Demo from '@/pages/Demo';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
    </Routes>
  );
};

export default App;