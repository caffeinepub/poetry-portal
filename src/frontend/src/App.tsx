import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import PoemDetail from './pages/PoemDetail';
import AdminForm from './pages/AdminForm';
import CollectionManager from './pages/CollectionManager';
import AdminPanel from './pages/AdminPanel';
import UserProfileSetup from './components/UserProfileSetup';
import AdminRouteGuard from './components/AdminRouteGuard';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout />
      <UserProfileSetup />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const poemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poem/$id',
  component: PoemDetail,
});

// Admin route guard wrapper
const adminGuardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminRouteGuard,
});

const adminFormRoute = createRoute({
  getParentRoute: () => adminGuardRoute,
  path: '/add-poem',
  component: AdminForm,
});

const collectionManagerRoute = createRoute({
  getParentRoute: () => adminGuardRoute,
  path: '/collections',
  component: CollectionManager,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => adminGuardRoute,
  path: '/panel',
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  poemDetailRoute,
  adminGuardRoute.addChildren([
    adminFormRoute,
    collectionManagerRoute,
    adminPanelRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
