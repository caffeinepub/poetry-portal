import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import PoemDetail from './pages/PoemDetail';
import AdminForm from './pages/AdminForm';
import CollectionManager from './pages/CollectionManager';
import Layout from './components/Layout';
import UserProfileSetup from './components/UserProfileSetup';

const queryClient = new QueryClient();

// Root route with Layout wrapper
const rootRoute = createRootRoute({
  component: Layout,
});

// Home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

// Poem detail route
const poemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poem/$id',
  component: PoemDetail,
});

// Admin form route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminForm,
});

// Collection manager route
const collectionManagerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/collections',
  component: CollectionManager,
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, poemRoute, adminRoute, collectionManagerRoute]);

// Create the router
const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <UserProfileSetup />
    </QueryClientProvider>
  );
}

export default App;
