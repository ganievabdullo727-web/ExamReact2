import { PreviewDialog } from "@/shared/ui/PreviewDialog";
import { Action, Badge, Field, Panel, Row, Screen, SelectField } from "@/shared/ui/Ui";

export function ProjectsPage({ slug }: { slug: string }) {
  return (
    <Screen title="Projects" folder="projects" description="Browse projects in this workspace." action={
      <PreviewDialog trigger="Create project" title="New project" description="This is a design preview. Project data is not saved.">
        <Field label="Project name" value="TaskFlow Web" previewEdit />
        <Field label="Identifier" value="WEB" previewEdit />
        <Action>Create project</Action>
      </PreviewDialog>
    }>
      <Panel title="Workspace projects">
        <Row title="TaskFlow Web" detail="Design and build the TaskFlow frontend." end={<Badge>WEB</Badge>} href={`/w/${slug}/p/web`} />
      </Panel>
    </Screen>
  );
}

export function ProjectPage({ base }: { base: string }) {
  return (
    <Screen title="Project overview" folder="[projectId]" description="TaskFlow Web · WEB" action={<Action href={`${base}/settings`} quiet>Project settings</Action>}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Panel title="Cycles" description="Plan work in short time windows."><Row title="See cycles" detail="Browse active and planned cycles" href={`${base}/cycles`} /></Panel>
        <Panel title="Modules" description="Group related work under a shared goal."><Row title="See modules" detail="Browse the project modules" href={`${base}/modules`} /></Panel>
      </div>
    </Screen>
  );
}

export function ProjectSettingsPage({ base }: { base: string }) {
  return (
    <Screen title="Project settings" folder="settings" description="Manage project details, members, statuses, and labels.">
      <Panel title="Project details"><div className="grid gap-4 sm:grid-cols-2"><Field label="Project name" value="TaskFlow Web" /><Field label="Identifier" value="WEB" /></div><div className="mt-5"><Action>Save changes</Action></div></Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Project members"><div className="space-y-3"><Row title="Alex Morgan" detail="Workspace member" end={<Badge>Owner</Badge>} /><Action quiet>Add member</Action></div></Panel>
        <Panel title="Issue configuration"><div className="space-y-3"><Row title="States" detail="Set up the status groups" href={`${base}/settings/states`} /><Row title="Labels" detail="Set up your project labels" href={`${base}/settings/labels`} /></div></Panel>
      </div>
    </Screen>
  );
}

export function ProjectStatesPage({ base }: { base: string }) {
  return (
    <Screen title="States" folder="states" description="Define the statuses used by this project." action={<Action href={`${base}/settings`} quiet>Back to settings</Action>}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Project states"><div className="space-y-3"><Row title="Backlog" detail="Backlog group" end={<Badge tone="gray">Backlog</Badge>} /><Row title="In progress" detail="Started group" end={<Badge>Started</Badge>} /><Row title="Done" detail="Completed group" end={<Badge tone="green">Completed</Badge>} /></div></Panel>
        <Panel title="New state"><div className="space-y-4"><Field label="State name" value="In progress" /><SelectField label="Group" value="Started" /><Action>Add state</Action></div></Panel>
      </div>
    </Screen>
  );
}

export function ProjectLabelsPage({ base }: { base: string }) {
  return (
    <Screen title="Labels" folder="labels" description="See the labels available in this project." action={<Action href={`${base}/settings`} quiet>Back to settings</Action>}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Project labels"><div className="space-y-3"><Row title="Design" detail="Interface and design system" end={<Badge>Design</Badge>} /><Row title="Frontend" detail="Client-side work" end={<Badge tone="green">Frontend</Badge>} /></div></Panel>
        <Panel title="New label"><div className="space-y-4"><Field label="Label name" value="Design" /><SelectField label="Color" value="Violet" /><Action>Add label</Action></div></Panel>
      </div>
    </Screen>
  );
}
