import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://backboard.railway.app/graphql/v2",
  generates: {
    "./src/sdk.ts": {
      documents: ["./src/**/*.graphql"],
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
};

export default config;
