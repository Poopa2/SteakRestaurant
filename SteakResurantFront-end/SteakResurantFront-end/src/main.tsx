import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/cs67/react/s12/SteakRestaurant/">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
