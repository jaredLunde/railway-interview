import { PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { CubeIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { Link, Outlet, useParams } from "react-router-dom";
import useSWR from "swr";
import { api, type InferResponseType } from "../../../api-client";
import { buttonVariants } from "../../../components/button";
import {
  DeploymentStatus,
  DeploymentStatusIcon,
} from "../../../components/deployment-status";
import { GitHubIcon } from "../../../components/icons/github-icon";
import { type AuthenticatedComponent } from "../../authenticated";

export const Project: AuthenticatedComponent = () => {
  const params = useParams<{ projectId: string }>();
  const project = useSWR(`project/${params.projectId}`, async () => {
    const res = await api.projects[":id"].$get({
      param: { id: params.projectId! },
    });

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }, {
    suspense: true,
    refreshInterval(latestData) {
      const hasInProgressDeployment = !!latestData?.services.edges.some((
        service,
      ) =>
        service.node.deployments?.edges.some((
          { node },
        ) =>
          ![
            DeploymentStatus.Success,
            DeploymentStatus.Failed,
            DeploymentStatus.Crashed,
            DeploymentStatus.Skipped,
            DeploymentStatus.Removed,
          ].includes(node.status)
        )
      );

      const recentlyCreatedService = !!latestData?.services.edges.some((
        service,
      ) =>
        new Date().getTime() - new Date(service.node.createdAt).getTime()
          < 2 * 60 * 1000
        || service.node.serviceInstances.edges.some(({ node }) => {
          new Date().getTime() - new Date(node.createdAt).getTime()
            < 2 * 60 * 1000;
        })
      );

      if (hasInProgressDeployment) {
        return 5000;
      }

      if (recentlyCreatedService) {
        return 10000;
      }

      return 5 * 60 * 1000; // 5 minutes
    },
  });
  const services = project.data.services.edges;
  const hasServices = services.length > 0;

  return (
    <section className="h-full overflow-auto w-full flex flex-col items-center justify-center gap-6 px-6">
      <ul
        className={clsx(
          "grid gap-6 items-stretch w-full",
          !hasServices
            ? "grid-cols-1 max-w-xs"
            : services.length < 2
            ? "grid-cols-2 max-w-2xl"
            : "grid-cols-3 max-w-5xl",
        )}
      >
        {services.map(({ node }) => {
          return (
            <ServiceTile
              key={node.id}
              projectId={params.projectId + ""}
              service={node}
            />
          );
        })}

        <Link
          to={`/${params.projectId}/services/new`}
          className={clsx(
            hasServices ? buttonVariants.outline : buttonVariants.solid,
            "!min-h-[96px] h-full w-full !flex-col",
          )}
        >
          <div className="rounded-full w-[2em] h-[2em] bg-indigo-400/50 flex items-center justify-center">
            <PuzzlePieceIcon height="1.5em" />
          </div>
          Add a service
        </Link>
      </ul>

      <Outlet />
    </section>
  );
};

function ServiceTile({ projectId, service }: {
  projectId: string;
  service: InferResponseType<
    typeof api.projects[":id"]["$get"]
  >["services"]["edges"][number]["node"];
}) {
  const serviceInstanceWithDomain = service.serviceInstances.edges.find(
    ({ node }) => node.domains.serviceDomains.length,
  );
  const domain = serviceInstanceWithDomain?.node.domains.serviceDomains[0]
    ?.domain;
  const serviceInstanceSource = service.serviceInstances.edges.find((
    { node },
  ) => node.source)?.node.source;
  const latestDeployment = service.deployments.edges[0]?.node;

  return (
    <li>
      <Link
        to={`/${projectId}/services/${service.id}`}
        className="flex flex-col gap-2 h-full w-full p-4 hover:bg-slate-800/80 rounded-md relative border border-slate-700/80 bg-slate-900"
      >
        <div className="grid grid-cols-grow-r gap-2">
          {serviceInstanceSource?.image && (
            <CubeIcon height="1.5em" className="top-1 relative" />
          )}

          {serviceInstanceSource?.repo && (
            <GitHubIcon height="1.5em" className="top-1 relative" />
          )}

          <div className="flex flex-col gap-2">
            <div>
              <div className="font-semibold font-brand text-lg">
                {service.name}
              </div>

              {domain && <div className="text-xs">{domain}</div>}
            </div>

            {latestDeployment && <DeploymentStatusIcon {...latestDeployment} />}

            {!latestDeployment && (
              <div className="text-slate-400">
                No deployments yet
              </div>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
