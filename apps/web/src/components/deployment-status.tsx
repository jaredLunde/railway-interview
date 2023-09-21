import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/solid";
import { RelativeTime } from "../intl/relative-time";
import { Spinner } from "./spinner";

export function DeploymentStatusIcon(
  { status, createdAt }: { status: DeploymentStatus; createdAt: string },
) {
  let icon: React.ReactElement = <ViewColumnsIcon />;
  let text: React.ReactNode = <div className="capitalize">{status}</div>;

  switch (status) {
    case DeploymentStatus.Building:
      icon = <Spinner size="1em" className="text-indigo-500" />;
      text = "Building...";
      break;

    case DeploymentStatus.Deploying:
      icon = <Spinner size="1em" className="text-indigo-500" />;
      text = "Deploying...";
      break;

    case DeploymentStatus.Initializing:
      icon = <Spinner size="1em" className="text-indigo-500" />;
      text = "Initializing...";
      break;

    case DeploymentStatus.Removing:
      icon = <Spinner size="1em" className="text-amber-500" />;
      text = "Removing...";
      break;

    case DeploymentStatus.Success:
      icon = <CheckBadgeIcon height="1em" className="text-teal-500" />;
      text = (
        <>
          Deployed <RelativeTime>{new Date(createdAt)}</RelativeTime>
        </>
      );
      break;

    case DeploymentStatus.Failed:
      icon = <ExclamationTriangleIcon className="text-red-500" />;
      text = (
        <>
          Failed <RelativeTime>{new Date(createdAt)}</RelativeTime>
        </>
      );
      break;

    case DeploymentStatus.Crashed:
      icon = <ExclamationTriangleIcon className="text-red-500" />;
      text = (
        <>
          Crashed <RelativeTime>{new Date(createdAt)}</RelativeTime>
        </>
      );
      break;

    case DeploymentStatus.Removed:
      icon = <NoSymbolIcon className="text-slate-400" />;
      text = (
        <>
          Removed <RelativeTime>{new Date(createdAt)}</RelativeTime>
        </>
      );
      break;
  }

  return (
    <div className="grid grid-cols-grow-r items-center gap-2 text-slate-400">
      {icon} <span>{text}</span>
    </div>
  );
}

export enum DeploymentStatus {
  Building = "BUILDING",
  Crashed = "CRASHED",
  Deploying = "DEPLOYING",
  Failed = "FAILED",
  Initializing = "INITIALIZING",
  Queued = "QUEUED",
  Removed = "REMOVED",
  Removing = "REMOVING",
  Skipped = "SKIPPED",
  Success = "SUCCESS",
  Waiting = "WAITING",
}
