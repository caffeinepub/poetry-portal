import React from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import PoemDetail from './pages/PoemDetail';
import AdminForm from './pages/AdminForm';
import AdminPanel from './pages/AdminPanel';
import CollectionManager from './pages/CollectionManager';
import UserProfileSetup from './components/UserProfileSetup';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
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

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminForm,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-panel',
  component: AdminPanel,
});

const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections',
  component: CollectionManager,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  poemDetailRoute,
  adminRoute,
  adminPanelRoute,
  collectionsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
