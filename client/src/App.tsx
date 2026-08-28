import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Account from "@/pages/Account";
import AdminDashboard from "@/pages/AdminDashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import MarketplaceCatalog from "@/pages/MarketplaceCatalog";
import ProductDetail from "@/pages/ProductDetail";
import UserCreateAccount from "@/pages/UserCreateAccount";
import UserLogin from "@/pages/UserLogin";
import AdminCreateAccount from "@/pages/AdminCreateAccount";
import AdminLogin from "@/pages/AdminLogin";
import AdminSellerManagement from "@/pages/AdminSellerManagement";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/account"} component={Account} />
      <Route path={"/account/create"} component={UserCreateAccount} />
      <Route path={"/account/login"} component={UserLogin} />
      <Route path={"/seller"} component={SellerDashboard} />
      <Route path={"/admin/sellers"} component={AdminSellerManagement} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/create"} component={AdminCreateAccount} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/marketplace"} component={MarketplaceCatalog} />
      <Route path={"/product/:productId"} component={ProductDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
