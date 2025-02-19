import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </div>
  );
}

export default App;
