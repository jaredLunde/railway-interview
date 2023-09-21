import { PuzzlePieceIcon } from "@heroicons/react/20/solid";
import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../api-client";
import { AwaitButton } from "../../components/button";
import { useIntl } from "../../intl/use-intl";
import { type AuthenticatedComponent } from "../authenticated";

export const Projects: AuthenticatedComponent = ({ session }) => {
  const intl = useIntl();
  const hasProjects = session.projects.length > 0;

  return (
    <section className="h-full overflow-auto w-full flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col p-8 gap-4 border rounded-xl border-slate-700/80 bg-slate-900/90 max-w-md w-full">
        <ul className="gap-4 max-h-[50vh] overflow-auto">
          {session.projects.map(project => {
            return (
              <li key={project.node.id}>
                <Link
                  to={project.node.services.edges.length
                    ? `/${project.node.id}`
                    : `/${project.node.id}/services/new`}
                  className="flex flex-col gap-2 w-full p-2 hover:bg-slate-800/80 rounded-md"
                >
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <div className="font-semibold">{project.node.name}</div>
                      {project.node.description && (
                        <div>
                          {project.node.description}
                        </div>
                      )}
                    </div>

                    <div className="border rounded-md font-medium text-xs border-indigo-800/80 bg-indigo-950 px-2 py-0.5 text-indigo-300">
                      {intl.plural(
                        project.node.services.edges.length,
                        "service",
                      )}
                    </div>
                  </div>

                  <div className="text-ellipsis w-full text-slate-400 text-xs">
                    {project.node.services.edges.length
                      ? intl.list(
                        project.node.services.edges.map(({ node }) =>
                          node.name
                        ),
                      )
                      : (
                        <div className="text-indigo-500 flex gap-1 items-center">
                          <PuzzlePieceIcon height="1em" />
                          Add a service
                        </div>
                      )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {hasProjects && <div className="w-full border border-slate-700/80" />}

        <CreateProjectButton size={hasProjects ? "sm" : "lg"} />
      </div>
    </section>
  );
};

function CreateProjectButton({ size }: { size: "sm" | "lg" }) {
  const navigate = useNavigate();
  const createProject = useSWRMutation(
    "/projects",
    async () => {
      const res = await api.projects.$post();
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    },
    {
      async onSuccess(data) {
        await mutate(() => true, undefined);
        navigate(`/${data.id}/services/new`);
      },
    },
  );

  return (
    <AwaitButton
      variant="solid"
      className={clsx("w-full", size === "lg" && "h-48 !text-lg")}
      loadingText="Creating...."
      onClick={() => createProject.trigger()}
    >
      <CubeTransparentIcon height="1em" className="text-indigo-200" />
      Create a new project
    </AwaitButton>
  );
}
