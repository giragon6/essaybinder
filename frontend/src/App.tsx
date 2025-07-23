import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';

function App() {

  return (
    <BrowserRouter>
      <div>
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </section>
      </div>
    </BrowserRouter>
  );
}

export default App;