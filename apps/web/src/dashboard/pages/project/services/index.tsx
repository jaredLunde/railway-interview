import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api, type InferResponseType } from "../../../../api-client";
import { AwaitButton, buttonVariants } from "../../../../components/button";
import {
  DeploymentStatus,
  DeploymentStatusIcon,
} from "../../../../components/deployment-status";
import type { AuthenticatedComponent } from "../../../authenticated";

export const Service: AuthenticatedComponent = () => {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string; serviceId: string }>();
  const project = useSWR(`project/${params.projectId}`, async () => {
    const res = await api.projects[":id"].$get({
      param: { id: params.projectId! },
    });

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }, { suspense: true });
  const service = useSWR(`service/${params.serviceId}`, async () => {
    const res = await api.services[":id"].$get({
      param: { id: params.serviceId! },
    });

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }, {
    suspense: true,
    refreshInterval(latestData) {
      const hasInProgressDeployment = !!latestData?.deployments.some((
        { node },
      ) =>
        ![
          DeploymentStatus.Success,
          DeploymentStatus.Failed,
          DeploymentStatus.Crashed,
          DeploymentStatus.Skipped,
          DeploymentStatus.Removed,
        ].includes(node.status)
      );

      const recentlyCreatedService = !!latestData
        && !!(new Date().getTime() - new Date(latestData.createdAt).getTime()
          || latestData.serviceInstances.some(({ node }) => {
            new Date().getTime() - new Date(node.createdAt).getTime()
              < 2 * 60 * 1000;
          }));

      if (hasInProgressDeployment) {
        return 5000;
      }

      if (recentlyCreatedService) {
        return 10000;
      }

      return 5 * 60 * 1000; // 5 minutes
    },
  });

  const deleteService = useSWRMutation(
    `service/${params.serviceId}`,
    async () => {
      const res = await api.services[":id"].$delete({
        param: {
          id: params.serviceId!,
        },
        json: {
          environmentId: String(
            project.data.baseEnvironment?.id
              ?? project.data.environments[0]?.node.id,
          ),
        },
      });

      if (!res.ok) throw new Error(res.statusText);

      return res.json();
    },
    {
      async onSuccess() {
        await mutate(() => true, undefined);
        navigate(`/${project.data.id}`, { replace: true });
      },
    },
  );

  const [doubleCheck, setDoubleCheck] = React.useState(false);
  const hasDeployments = service.data.deployments.length > 0;

  return (
    <div className="fixed inset-0 bg-indigo-950/10 z-4f0 backdrop-blur-sm flex flex-col gap-8 items-center justify-center">
      <Link
        to={`/${project.data.id}`}
        replace
        className={clsx(
          buttonVariants.solid,
          "absolute left-4 top-4 !text-lg !rounded-full h-10 w-10",
        )}
      >
        <XMarkIcon height="1em" />
      </Link>

      <div className="font-bold flex gap-2 items-center">
        <Link
          to={`/${project.data.id}`}
          replace
          className="text-slate-400 hover:underline"
        >
          {project.data.name}
        </Link>
        <ChevronRightIcon height="1em" />
        <div>
          {service.data.name}
        </div>
      </div>

      <div className="flex flex-col relative p-4 gap-4 border rounded-2xl border-slate-700/80 bg-slate-900 max-w-lg w-full">
        {!hasDeployments && (
          <div className="text-slate-400 py-8 text-center">
            No deployments yet
          </div>
        )}

        <ul className="flex flex-col gap-4 max-h-[40vh] overflow-auto">
          {hasDeployments && service.data.deployments.map((deployment) => {
            return (
              <DeploymentRow key={deployment.node.id} deployment={deployment} />
            );
          })}
        </ul>
      </div>

      <AwaitButton
        variant={doubleCheck ? "outline" : "danger"}
        loadingText="Deleting..."
        className={clsx(
          "w-full max-w-lg",
          doubleCheck && "!text-red-400 !border-red-500",
        )}
        onClick={() => {
          if (!doubleCheck) {
            setDoubleCheck(true);
            return Promise.resolve();
          }

          return deleteService.trigger();
        }}
      >
        {doubleCheck ? "Click again to confirm" : "Delete service"}
      </AwaitButton>
    </div>
  );
};

function DeploymentRow({ deployment }: {
  deployment: InferResponseType<
    typeof api.services[":id"]["$get"]
  >["deployments"][number];
}) {
  const params = useParams<{ projectId: string; serviceId: string }>();
  const deleteDeployment = useSWRMutation(
    `service/${params.serviceId}`,
    async (_key, { arg }: { arg: { id: string } }) => {
      const res = await api.deployments[":id"].$delete({
        param: {
          id: arg.id!,
        },
      });

      if (!res.ok) throw new Error(res.statusText);

      return res.json();
    },
    {
      async onSuccess() {
        await mutate(() => true, undefined);
      },
    },
  );
  const [doubleCheck, setDoubleCheck] = React.useState(false);

  return (
    <li key={deployment.node.id} className="p-2">
      <div className="grid grid-cols-grow-l">
        <div>
          <div className="font-bold font-brand">
            {deployment.node.staticUrl ?? deployment.node.url
              ?? deployment.node.id}
          </div>
          <DeploymentStatusIcon
            status={deployment.node.status}
            createdAt={deployment.node.createdAt}
          />
        </div>

        <AwaitButton
          variant={doubleCheck ? "outline" : "danger"}
          loadingText="Deleting..."
          className={clsx(
            "w-full max-w-lg",
            doubleCheck && "!text-red-400 !border-red-500",
          )}
          onClick={() => {
            if (!doubleCheck) {
              setDoubleCheck(true);
              return Promise.resolve();
            }

            return deleteDeployment.trigger({
              id: deployment.node.id,
            });
          }}
        >
          {doubleCheck ? "Confirm" : "Delete"}
        </AwaitButton>
      </div>
    </li>
  );
}
