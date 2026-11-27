import { Action, Badge, EmptyState, Field, Panel, Row, Screen } from "@/shared/ui/Ui";

export function CyclesPage({ base }: { base: string }) {
  return (
    <Screen title="Cycles" folder="cycles" description="Plan work in a defined time window." action={<Action>Create cycle</Action>}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Project cycles"><div className="space-y-3"><Row title="Cycle 01" detail="Nov 25 – Dec 6" end={<Badge>Active</Badge>} href={`${base}/cycles/cycle-01`} /><Row title="Cycle 02" detail="Dec 7 – Dec 18" end={<Badge tone="gray">Planned</Badge>} href={`${base}/cycles/cycle-02`} /></div></Panel>
        <Panel title="New cycle"><div className="space-y-4"><Field label="Cycle name" value="Cycle 03" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Start date" type="date" value="2026-12-19" /><Field label="End date" type="date" value="2026-12-30" /></div><Action>Create cycle</Action></div></Panel>
      </div>
    </Screen>
  );
}

export function ModulesPage({ base }: { base: string }) {
  return (
    <Screen title="Modules" folder="modules" description="Group related work within a project." action={<Action>Create module</Action>}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Project modules"><Row title="Workspace experience" detail="Navigation and shared interface" end={<Badge>In progress</Badge>} href={`${base}/modules/workspace`} /></Panel>
        <Panel title="New module"><div className="space-y-4"><Field label="Module name" value="Workspace experience" /><Action>Create module</Action></div></Panel>
      </div>
    </Screen>
  );
}

export function PlanningDetail({ base, kind }: { base: string; kind: "cycle" | "module" }) {
  const cycle = kind === "cycle";
  return (
    <Screen title={cycle ? "Cycle details" : "Module details"} folder={cycle ? "[cycleId]" : "[moduleId]"} description="Example detail view. Progress below is sample data." action={<Action href={`${base}/${cycle ? "cycles" : "modules"}`} quiet>{cycle ? "Back to cycles" : "Back to modules"}</Action>}>
      <Panel title="Progress"><div className="mb-3 flex justify-between text-sm font-semibold"><span>Completed</span><span>50%</span></div><div role="progressbar" aria-label="Example completion" aria-valuenow={50} className="h-2 overflow-hidden rounded-full bg-violet-50"><div className="h-full w-1/2 rounded-full bg-primary" /></div></Panel>
      <Panel title="Linked issues"><EmptyState title="Issue list placeholder">The shared issue list will be connected later. No issue logic was added.</EmptyState></Panel>
    </Screen>
  );
}
