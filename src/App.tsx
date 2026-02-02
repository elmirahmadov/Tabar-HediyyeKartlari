import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import UsePage from "./pages/UsePage";
import "./style.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsePage />} />
        <Route path="/adminpanel" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
