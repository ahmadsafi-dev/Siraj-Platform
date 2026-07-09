import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Layout } from "@/components/layout";

// Pages
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import StudentDashboard from "@/pages/student/dashboard";
import NewRequest from "@/pages/student/new-request";
import VolunteerDashboard from "@/pages/volunteer/dashboard";
import { Skeleton } from "./components/ui/skeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ProtectedRoute({ component: Component, role }: { component: any, role?: "student" | "volunteer" }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 max-w-4xl mx-auto mt-10">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (role && user.role !== role) {
    return <Redirect to={user.role === "student" ? "/student" : "/volunteer"} />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function RootRedirect() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Landing />;
  }
  
  return <Redirect to={user.role === "student" ? "/student" : "/volunteer"} />;
}

function AuthRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Redirect to={user.role === "student" ? "/student" : "/volunteer"} />;
  }
  
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={() => <AuthRoute component={Login} />} />
      <Route path="/register" component={() => <AuthRoute component={Register} />} />
      
      <Route path="/student" component={() => <ProtectedRoute component={StudentDashboard} role="student" />} />
      <Route path="/student/new-request" component={() => <ProtectedRoute component={NewRequest} role="student" />} />
      
      <Route path="/volunteer" component={() => <ProtectedRoute component={VolunteerDashboard} role="volunteer" />} />
      
      <Route path="/:rest*">
        {(params) => (
          <Layout>
            <NotFound />
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
