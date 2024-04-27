import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./pages/Home.jsx";
import "./styles/styles.css";
import { HashRouter as BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
