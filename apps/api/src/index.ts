import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { zValidator } from "@hono/zod-validator";
import { GraphQLClient } from "graphql-request";
import { z } from "zod";
import { env } from "./env";
import { getSdk } from "./sdk";

const graphqlClient = new GraphQLClient(
  "https://backboard.railway.app/graphql/v2"
);

const sdk = getSdk(graphqlClient);
const API_KEY_COOKIE_NAME =
  env.NODE_ENV === "development" ? "railway-key" : "__Host-railway-key";
const requireSession: MiddlewareHandler<{
  Variables: {
    apiKey: string;
  };
}> = (c, next) => {
  const apiKey = getCookie(c, API_KEY_COOKIE_NAME);

  if (!apiKey) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.set("apiKey", apiKey);
  return next();
};

export const app = new Hono()
  .use(
    "*",
    logger((message) => {
      if (env.NODE_ENV === "development") {
        console.log(message);
      }
    })
  )
  .use("*", secureHeaders())
  .use(
    "*",
    cors({
      origin: env.DASHBOARD_URL,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      maxAge: 604800,
    })
  )
  .post(
    "/sessions",
    zValidator(
      "form",
      z.object({
        apiKey: z.string().uuid(),
      })
    ),
    async (c) => {
      const { apiKey } = c.req.valid("form");

      setCookie(c, API_KEY_COOKIE_NAME, apiKey, {
        httpOnly: true,
        sameSite: "Strict",
        secure: env.NODE_ENV === "production",
        path: "/",
      });

      return c.redirect(env.DASHBOARD_URL);
    }
  )
  .get("/sessions", requireSession, async (c) => {
    const apiKey = c.get("apiKey");

    const { me } = await sdk.me(undefined, {
      Authorization: `Bearer ${apiKey}`,
    });

    return c.jsonT({
      id: me.id,
      projects: me.projects.edges,
    });
  })
  .get("/sessions/destroy", (c) => {
    deleteCookie(c, API_KEY_COOKIE_NAME, { path: "/" });
    return c.redirect(env.DASHBOARD_URL);
  })
  .post("/projects", requireSession, async (c) => {
    const apiKey = c.get("apiKey");
    const { projectCreate } = await sdk.projectCreate(
      { input: {} },
      {
        Authorization: `Bearer ${apiKey}`,
      }
    );

    return c.jsonT({
      id: projectCreate.id,
      name: projectCreate.name,
    });
  })
  .get(
    "/projects/:id",
    requireSession,
    zValidator("param", z.object({ id: z.string().uuid() })),
    async (c) => {
      const apiKey = c.get("apiKey");
      const { id } = c.req.valid("param");
      const { project } = await sdk.getProject(
        { id },
        {
          Authorization: `Bearer ${apiKey}`,
        }
      );

      return c.jsonT({
        id: project.id,
        name: project.name,
        description: project.description,
        baseEnvironment: project.baseEnvironment,
        environments: project.environments.edges,
        services: project.services,
      });
    }
  )
  .get("/github/repos", requireSession, async (c) => {
    const apiKey = c.get("apiKey");
    const { githubRepos } = await sdk.listGithubRepos(undefined, {
      Authorization: `Bearer ${apiKey}`,
    });

    return c.jsonT(githubRepos);
  })
  .get("/github/scopes", requireSession, async (c) => {
    const apiKey = c.get("apiKey");
    const { githubWritableScopes } = await sdk.githubWritableScopes(undefined, {
      Authorization: `Bearer ${apiKey}`,
    });

    return c.jsonT(githubWritableScopes);
  })
  .get("/templates", requireSession, async (c) => {
    const apiKey = c.get("apiKey");
    const { templates } = await sdk.listTemplates(undefined, {
      Authorization: `Bearer ${apiKey}`,
    });

    return c.jsonT(templates.edges);
  })
  .post(
    "/project/:id/services",
    requireSession,
    zValidator("param", z.object({ id: z.string().uuid() })),
    zValidator(
      "json",
      z.object({
        branch: z.string().nullable().default(null),
        environmentId: z.string().uuid().nullable().default(null),
        source: z.union([
          z.object({
            repo: z.string(),
          }),
          z.object({
            image: z.string(),
          }),
        ]),
      })
    ),
    async (c) => {
      const apiKey = c.get("apiKey");
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const { serviceCreate } = await sdk.serviceCreate(
        { input: { ...input, projectId: id } },
        {
          Authorization: `Bearer ${apiKey}`,
        }
      );

      return c.jsonT({
        id: serviceCreate.id,
        name: serviceCreate.name,
        serviceInstances: serviceCreate.serviceInstances.edges,
      });
    }
  )
  .get(
    "/services/:id",
    requireSession,
    zValidator("param", z.object({ id: z.string().uuid() })),
    async (c) => {
      const apiKey = c.get("apiKey");
      const { id } = c.req.valid("param");
      const { service } = await sdk.getService(
        { id },
        {
          Authorization: `Bearer ${apiKey}`,
        }
      );

      return c.jsonT({
        id: service.id,
        name: service.name,
        createdAt: service.createdAt,
        icon: service.icon,

        serviceInstances: service.serviceInstances.edges,
        deployments: service.deployments.edges,
      });
    }
  )
  .delete(
    "/services/:id",
    requireSession,
    zValidator("param", z.object({ id: z.string().uuid() })),
    zValidator("json", z.object({ environmentId: z.string().uuid() })),
    async (c) => {
      const apiKey = c.get("apiKey");
      const { id } = c.req.valid("param");
      const { environmentId } = c.req.valid("json");
      const { serviceDelete } = await sdk.serviceDelete(
        { id, environmentId },
        {
          Authorization: `Bearer ${apiKey}`,
        }
      );

      return c.jsonT(serviceDelete);
    }
  )
  .delete(
    "/deployments/:id",
    requireSession,
    zValidator("param", z.object({ id: z.string().uuid() })),
    async (c) => {
      const apiKey = c.get("apiKey");
      const { id } = c.req.valid("param");
      const { deploymentRemove } = await sdk.deploymentRemove(
        { id },
        {
          Authorization: `Bearer ${apiKey}`,
        }
      );

      return c.jsonT(deploymentRemove);
    }
  )
  .post(
    "/project/:id/deploy-template",
    requireSession,
    zValidator("param", z.object({ id: z.string().uuid() })),
    zValidator(
      "json",
      z.object({
        templateCode: z.string(),
        services: z.array(
          z.object({
            id: z.string().uuid(),
            hasDomain: z.boolean(),
            isPrivate: z.boolean(),
            owner: z.string(),
            name: z.string(),
            serviceName: z.string(),
            template: z.string().url(),
            variables: z.record(z.string()),
          })
        ),
      })
    ),
    async (c) => {
      const apiKey = c.get("apiKey");
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const { templateDeploy } = await sdk.templateDeploy(
        { input: { ...input, projectId: id } },
        {
          Authorization: `Bearer ${apiKey}`,
        }
      );

      return c.jsonT({
        projectId: templateDeploy.projectId,
        workflowId: templateDeploy.workflowId,
      });
    }
  )
  .get("/healthz", (c) => c.text("ok"))
  .notFound((c) => c.text("Not found: " + c.req.url, 404));

export type AppType = typeof app;

Bun.serve({
  hostname: env.HOSTNAME,
  port: env.PORT,
  fetch: app.fetch,
});

if (env.NODE_ENV === "development") {
  console.log(`Listening on http://${env.HOSTNAME}:${env.PORT}`);
}
