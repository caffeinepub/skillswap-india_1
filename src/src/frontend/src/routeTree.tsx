import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import RootLayout from "./components/RootLayout";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import RequestsPage from "./pages/RequestsPage";
import ReviewsPage from "./pages/ReviewsPage";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});

const requestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/requests",
  component: RequestsPage,
});

const reviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reviews",
  component: ReviewsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  searchRoute,
  requestsRoute,
  reviewsRoute,
]);
