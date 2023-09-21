import { CubeIcon } from "@heroicons/react/24/outline";
import { CubeIcon as CubeIconSolid } from "@heroicons/react/24/solid";
import React from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { Spinner } from "../components/spinner";
import { env } from "../env";
import {
  authenticated,
  type AuthenticatedComponent,
  unauthenticated,
} from "./authenticated";
import { Login } from "./pages/login";
import { Project } from "./pages/project";
import { Service } from "./pages/project/services";
import { NewService } from "./pages/project/services/new";
import { Projects } from "./pages/projects";

export function Dashboard() {
  return (
    <BrowserRouter>
      <React.Suspense
        fallback={loader}
      >
        <Routes>
          <Route path="/login" Component={unauthenticated(Login)} />
          <Route
            path="*"
            Component={authenticated(AuthenticatedRoutes)}
          />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

const AuthenticatedRoutes: AuthenticatedComponent = ({ session }) => {
  return (
    <div className="h-screen grid grid-rows-[max-content,minmax(0,auto)]">
      <header className="flex items-center justify-between gap-4 p-4 h-18 relative border-b border-slate-800/80 bg-slate-950">
        <Link className="flex items-center justify-center relative" to="/">
          <CubeIcon
            height={36}
            className="relative text-indigo-600/90"
          />
          <CubeIconSolid
            height={23}
            className="absolute text-indigo-400/90"
          />
        </Link>

        <Routes>
          <Route
            path="/"
            element={
              <div className="absolute inset-0 m-auto w-72 h-full flex flex-col items-center text-center justify-center">
                <div className="font-brand text-slate-300 text-base font-semibold">
                  Select a Project
                </div>
                <div className="text-xs text-slate-400">
                  Manage application services and environments
                </div>
              </div>
            }
          />
          <Route
            path="/:projectId/*"
            element={<ProjectHeader session={session} />}
          />
        </Routes>

        <a href={new URL("/sessions/destroy", env.PUBLIC_API_URL).href}>
          Log out
        </a>
      </header>
      <React.Suspense fallback={loader}>
        <Routes>
          <Route path="/:projectId" element={<Project session={session} />}>
            <Route
              path="services/new"
              element={<NewService session={session} />}
            />
            <Route
              path="services/:serviceId"
              element={
                <React.Suspense fallback={null}>
                  <Service session={session} />
                </React.Suspense>
              }
            />
          </Route>

          <Route path="/" element={<Projects session={session} />} />
        </Routes>
      </React.Suspense>
    </div>
  );
};

function ProjectHeader(
  { session }: React.ComponentProps<AuthenticatedComponent>,
) {
  const params = useParams<{ projectId: string }>();
  const project = session.projects.find(
    project => project.node.id === params.projectId,
  )!;

  return (
    <div className="absolute font-brand font-medium text-base inset-0 m-auto w-72 h-full flex gap-2 items-center text-center justify-center">
      <div className="text-slate-300">
        {project.node.name}
      </div>
      <div>/</div>
      <div className="text-slate-400">
        {project.node.environments.edges[0]!.node.name}
      </div>
    </div>
  );
}

const loader = (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="flex items-center justify-center border border-indigo-400/40 rounded-full p-2 bg-indigo-600 h-16 w-16">
      <Spinner size={32} />
    </div>
  </div>
);
