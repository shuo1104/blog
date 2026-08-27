import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "./components/layout";
import { Home } from "./pages/home";
import { Post } from "./pages/post";
import { About } from "./pages/about";
import { AdminLogin } from "./pages/admin/login";
import { AdminLayout } from "./pages/admin/admin-layout";
import { PostList } from "./pages/admin/post-list";
import { PostEditor } from "./pages/admin/post-editor";
import { AdminSettings } from "./pages/admin/settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "post/:slug", element: <Post /> },
      { path: "about", element: <About /> },
      { path: "*", element: <Home /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <PostList /> },
      { path: "new", element: <PostEditor mode="create" /> },
      { path: "edit/:slug", element: <PostEditor mode="edit" /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
]);


export default function App() {
  return <RouterProvider router={router} />;
}

