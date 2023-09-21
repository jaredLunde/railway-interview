import { CubeIcon } from "@heroicons/react/24/outline";
import { CubeIcon as CubeIconSolid } from "@heroicons/react/24/solid";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { env } from "../../env";

export function Login() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-8 w-full max-w-md p-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl text-center font-brand font-light text-slate-300 flex justify-center items-center gap-2">
            <div className="flex items-center justify-center relative">
              <CubeIcon height={48} className="relative text-indigo-600/90" />
              <CubeIconSolid
                height={32}
                className="absolute text-indigo-400/90"
              />
            </div>
            Deployer
          </h1>

          <h2 className="text-center text-slate-400">
            To get started, enter your{" "}
            <a
              href="https://railway.app/account/tokens"
              target="_blank"
              rel="noreferrer noopener"
              className="text-indigo-400 hover:underline"
            >
              Railway API token
            </a>{" "}
            below
          </h2>
        </div>

        <form
          method="POST"
          action={new URL(`/sessions`, env.PUBLIC_API_URL).href}
          className="w-full p-8 flex flex-col gap-8 border rounded-xl border-slate-700/80 bg-slate-900/90"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey">
                Railway API Token
              </Label>
              <Input
                type="password"
                name="apiKey"
                id="apiKey"
                placeholder="550e8400-e29b-41d4-a716-000000000000"
                pattern="^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$"
                required
              />
            </div>
            <Button type="submit">Login</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
