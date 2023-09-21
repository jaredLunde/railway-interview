import {
  ChevronRightIcon,
  CubeTransparentIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronLeftIcon,
  CubeIcon as CubeIconSolid,
  DocumentDuplicateIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { Button, buttonVariants } from "../../../../components/button";

import clsx from "clsx";
import {
  api,
  type InferRequestType,
  type InferResponseType,
} from "../../../../api-client";
import { GitHubIcon } from "../../../../components/icons/github-icon";
import { Input } from "../../../../components/input";
import { Label } from "../../../../components/label";
import { Spinner } from "../../../../components/spinner";
import type { AuthenticatedComponent } from "../../../authenticated";

export const NewService: AuthenticatedComponent = () => {
  const params = useParams<{ projectId: string }>();
  const project = useSWR(`project/${params.projectId}`, async () => {
    const res = await api.projects[":id"].$get({
      param: { id: params.projectId! },
    });

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }, { suspense: true });
  const [activeService, setActiveService] = React.useState<
    "github" | "template" | "docker-image" | null
  >(null);

  return (
    <div className="fixed inset-0 bg-indigo-950/10 z-4f0 backdrop-blur-sm flex flex-col gap-8 items-center justify-center">
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
          Add a new service
        </div>
      </div>

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

      <div className="flex flex-col relative p-4 gap-4 border rounded-2xl border-slate-700/80 bg-slate-900 max-w-lg w-full">
        {!activeService && (
          <div className="grid grid-cols-3 gap-4">
            <ServiceTile
              icon={<GitHubIcon />}
              onClick={() => setActiveService("github")}
            >
              GitHub Repo
            </ServiceTile>

            <ServiceTile
              icon={<DocumentDuplicateIcon />}
              onClick={() => setActiveService("template")}
            >
              <div>Template</div>
            </ServiceTile>

            <ServiceTile
              icon={<CubeIconSolid />}
              onClick={() => setActiveService("docker-image")}
            >
              <div>Docker Image</div>
            </ServiceTile>
          </div>
        )}

        {activeService && (
          <div className="grid grid-rows-[max-content,auto] gap-2">
            <button
              onClick={() => setActiveService(null)}
              className="flex items-center gap-3 font-medium text-slate-400 hover:text-slate-200"
            >
              <ChevronLeftIcon height="1em" />
              <span>Select a service</span>
            </button>

            <React.Suspense
              fallback={
                <div className="p-6 flex items-center justify-center">
                  <Spinner size={32} />
                </div>
              }
            >
              <div className="overflow-auto max-h-[40vh]">
                {activeService === "github" && (
                  <NewGitHubService project={project.data} />
                )}
                {activeService === "template" && <NewTemplateService />}
                {activeService === "docker-image" && (
                  <NewDockerImageService project={project.data} />
                )}
              </div>
            </React.Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

function ServiceTile(
  { icon, children, onClick }: {
    icon: React.ReactElement;
    children: React.ReactNode;
    onClick?: () => void;
  },
) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col border font-bold border-slate-700/80 rounded-xl p-6 items-center justify-center gap-3 shadow-lg bg-slate-950/20 hover:bg-slate-800/70 text-slate-400 hover:text-slate-100"
    >
      <div className="rounded-full bg-indigo-500/50 p-3">
        {React.cloneElement(icon, { height: "2em" })}
      </div>

      <div>{children}</div>
    </button>
  );
}

function NewGitHubService(
  { project }: {
    project: InferResponseType<typeof api.projects[":id"]["$get"]>;
  },
) {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const githubRepos = useSWR("github/repos", async () => {
    const res = await api.github.repos.$get();

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }, { suspense: true });
  const createService = useSWRMutation(
    `project/${params.projectId}`,
    async (_key, { arg }: { arg: NewServiceParams }) => {
      const res = await api.project[":id"].services.$post({
        param: { id: params.projectId! },
        json: arg,
      });

      if (!res.ok) throw new Error(res.statusText);

      return res.json();
    },
    {
      async onSuccess() {
        await mutate(() => true, undefined);
        navigate(`/${params.projectId}`);
      },
    },
  );

  return (
    <div>
      {!createService.isMutating && githubRepos.data.map(repo => {
        return (
          <button
            key={repo.id}
            className="grid grid-cols-grow-r gap-2 rounded-lg hover:bg-slate-800/70 w-full p-2 text-left items-center"
            onClick={() => {
              createService.trigger({
                branch: repo.defaultBranch,
                environmentId: project.baseEnvironment?.id
                  ?? project.environments[0]?.node.id,
                source: { repo: repo.fullName },
              });
            }}
          >
            <GitHubIcon height="1em" className="text-slate-400" />

            <span>
              <span className="text-slate-200">
                {repo.fullName.split("/")[0]}/
              </span>
              <span className="font-bold">
                {repo.fullName.split("/")[1]}
              </span>
            </span>
          </button>
        );
      })}

      {createService.isMutating && (
        <div className="p-6 flex items-center justify-center text-lg w-full">
          <Spinner>Creating service...</Spinner>
        </div>
      )}
    </div>
  );
}

function NewTemplateService() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const githubScopes = useSWR("github/scopes", async () => {
    const res = await api.github.scopes.$get();

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }, { suspense: true });
  const templates = useSWR("templates", async () => {
    const res = await api["templates"].$get();

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }, { suspense: true });
  const deployTemplate = useSWRMutation(
    `project/${params.projectId}`,
    async (_key, { arg }: {
      arg: InferRequestType<
        typeof api.project[":id"]["deploy-template"]["$post"]
      >["json"];
    }) => {
      const res = await api.project[":id"]["deploy-template"].$post({
        param: { id: params.projectId! },
        json: arg,
      });

      if (!res.ok) throw new Error(res.statusText);

      return res.json();
    },
    {
      async onSuccess() {
        await mutate(() => true, undefined);
        navigate(`/${params.projectId}`);
      },
    },
  );
  const [selectedTemplate, setSelectedTemplate] = React.useState<
    (typeof templates.data)[number] | null
  >();

  return (
    <div>
      {!deployTemplate.isMutating && !selectedTemplate
        && templates.data.map(template => {
          return (
            <button
              key={template.node.id}
              type="button"
              className="grid grid-cols-grow-r gap-3 rounded-lg hover:bg-slate-800/70 w-full p-2 text-left items-center"
              onClick={() => {
                setSelectedTemplate(template);
              }}
            >
              {template.node.metadata.image
                ? (
                  <img
                    src={template.node.metadata.image}
                    className="h-[2.25em] w-[2.25em]"
                  />
                )
                : (
                  <CubeTransparentIcon
                    height="2.25em"
                    className="text-slate-400"
                  />
                )}

              <div>
                <div className="text-slate-200">
                  {template.node.metadata.name}
                </div>

                <div className="text-slate-400 text-xs">
                  {template.node.metadata.description}
                </div>
              </div>
            </button>
          );
        })}

      {!deployTemplate.isMutating && selectedTemplate && (
        <form
          className="pt-6 flex flex-col gap-12 items-center"
          onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            deployTemplate.trigger({
              templateCode: selectedTemplate.node.code,
              services: selectedTemplate.node.services.edges.map(service => ({
                owner: String(formData.get("owner")),
                name: String(formData.get("repo")),
                isPrivate: formData.get("isPrivate") === "on",
                id: service.node.id,
                serviceName: service.node.config.name,
                hasDomain: service.node.config.domains.some((domain: any) =>
                  domain.hasServiceDomain
                ),
                template: service.node.config.source.repo,
                variables: service.node.config.variables.reduce(
                  (acc: any, variable: any) => {
                    acc[variable.name] = variable.defaultValue;
                    return acc;
                  },
                  {},
                ),
              })),
            });
          }}
        >
          <div className="text-base text-center">
            Deploy{" "}
            <span className="font-bold">
              {selectedTemplate.node.metadata.name}
            </span>{" "}
            to GitHub
          </div>

          <div className="flex flex-col w-full items-center gap-4">
            <div className="grid grid-cols-[1fr,min-content,1fr] items-center gap-4">
              <div className="grid grid-cols-grow-r gap-2 rounded-md shadow-sm ring-1 bg-slate-800/60 ring-inset ring-slate-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md items-center">
                <div className="pl-2 h-full flex items-center text-slate-400">
                  <GitHubIcon height="1em" />
                </div>
                <select
                  name="owner"
                  className="block bg-transparent flex-1 border-0 py-1.5 px-2 text-slate-100 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                >
                  {githubScopes.data.map(scope => {
                    return <option value={scope} key={scope}>{scope}</option>;
                  })}
                </select>
              </div>

              <div className="text-2xl">/</div>

              <Input type="text" required name="repo" placeholder="repo-name" />
            </div>

            <Label className="flex gap-2 items-center">
              <input
                type="checkbox"
                name="isPrivate"
                className="h-4 w-4 rounded border-slate-700/80 text-indigo-600 ring-inset bg-slate-800/60 focus:ring-indigo-600"
              />

              Create private repository
            </Label>
          </div>

          <Button className="w-full">
            <RocketLaunchIcon height="1em" />
            Deploy
          </Button>
        </form>
      )}

      {deployTemplate.isMutating && (
        <div className="p-6 flex items-center justify-center text-lg">
          <Spinner>Creating service...</Spinner>
        </div>
      )}
    </div>
  );
}

function NewDockerImageService({ project }: {
  project: InferResponseType<typeof api.projects[":id"]["$get"]>;
}) {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const createService = useSWRMutation(
    `project/${params.projectId}`,
    async (_key, { arg }: { arg: NewServiceParams }) => {
      const res = await api.project[":id"].services.$post({
        param: { id: params.projectId! },
        json: arg,
      });

      if (!res.ok) throw new Error(res.statusText);

      return res.json();
    },
    {
      async onSuccess() {
        await mutate(() => true, undefined);
        navigate(`/${params.projectId}`);
      },
    },
  );

  return (
    <div className="p-7 flex">
      {!createService.isMutating && (
        <form
          className="flex flex-col gap-6 w-full"
          onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            createService.trigger({
              environmentId: project.baseEnvironment?.id
                ?? project.environments[0]?.node.id,
              source: { image: String(formData.get("dockerImage")) },
            });
          }}
        >
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="dockerImage">Docker image</Label>
              <div className="text-slate-400 text-xs">
                This can be an image from Docker Hub or GCHR.
              </div>
            </div>

            <Input
              id="dockerImage"
              name="dockerImage"
              placeholder="Example → nginxdemos/nginx-hello:latest"
              required
            />
          </div>

          <Button type="submit">
            Add service
          </Button>
        </form>
      )}

      {createService.isMutating && (
        <div className="p-6 flex items-center justify-center text-lg w-full">
          <Spinner>Creating service...</Spinner>
        </div>
      )}
    </div>
  );
}

type NewServiceParams = InferRequestType<
  typeof api.project[":id"]["services"]["$post"]
>["json"];
