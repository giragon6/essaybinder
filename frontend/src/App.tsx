import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NewHome from './components/Home';
import Essays from './components/Essays';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';

function App() {

  return (
    <BrowserRouter>
      <div>
        <section>
          <Routes>
            <Route path="/" element={<NewHome />} />
            <Route path="/essays" element={<Essays />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </section>
      </div>
    </BrowserRouter>
  );
}

export default App;