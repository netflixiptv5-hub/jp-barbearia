import { Route, Switch } from "wouter";
import BookingPage from "./pages/index";
import { Provider } from "./components/provider";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={BookingPage} />
      </Switch>
    </Provider>
  );
}

export default App;
