import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';

function App() {

  return (
    <BrowserRouter>
      <div>
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/login" element={<Login />} /> */}
          </Routes>
        </section>
      </div>
    </BrowserRouter>
  );
}

export default App;