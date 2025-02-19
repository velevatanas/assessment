import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import store from "./store";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);
