import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import BookingPage from "./pages/index";
import { Provider } from "./components/provider";

const DemoPage = lazy(() => import("./pages/demo"));
const OrionPage = lazy(() => import("./pages/orion"));

function App() {
  return (
    <Provider>
      <Suspense fallback={<div style={{ background: "#0A0A0A", minHeight: "100vh" }} />}>
        <Switch>
          <Route path="/demo/:slug" component={DemoPage} />
          <Route path="/orion" component={OrionPage} />
          <Route path="/" component={BookingPage} />
        </Switch>
      </Suspense>
    </Provider>
  );
}

export default App;
