import { PreviewDialog } from "@/shared/ui/PreviewDialog";
import { Action, Badge, Brand, Field, Panel, Row, Screen, SelectField } from "@/shared/ui/Ui";

export function WorkspacesPage() {
  return (
    <Screen title="Workspaces" folder="workspaces" description="Choose a workspace or see how a new one is created." action={
      <PreviewDialog trigger="Create workspace" title="Create a workspace" description="Try the fields. This preview does not save a workspace.">
        <Field label="Workspace name" value="TaskFlow" previewEdit />
        <Field label="Workspace slug" value="taskflow" previewEdit />
        <Action>Create workspace</Action>
      </PreviewDialog>
    }>
      <Panel title="Your workspaces" description="Continue with the example workspace.">
        <Row title="TaskFlow" detail="Workspace preview" end={<Badge>Owner</Badge>} href="/w/taskflow" />
      </Panel>
    </Screen>
  );
}

export function WorkspacePage({ slug }: { slug: string }) {
  const base = `/w/${slug}`;
  return (
    <Screen title="Workspace overview" folder="[slug]" description="Start with the main sections of your workspace." action={<Action href={`${base}/projects`}>Open projects</Action>}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Panel title="Projects" description="Organize the work your team is planning."><Row title="Project directory" detail="Browse the workspace projects" href={`${base}/projects`} /></Panel>
        <Panel title="Team" description="See the workspace members and roles."><Row title="Workspace members" detail="People and invitations" href={`${base}/members`} /></Panel>
      </div>
    </Screen>
  );
}

export function WorkspaceSettingsPage() {
  return (
    <Screen title="Workspace settings" folder="settings" description="Workspace details, access, and ownership.">
      <Panel title="General"><div className="grid gap-4 sm:grid-cols-2"><Field label="Workspace name" value="TaskFlow" /><Field label="Workspace slug" value="taskflow" /></div><div className="mt-5"><Action>Save changes</Action></div></Panel>
      <Panel title="Ownership and access" description="Preview only. No ownership or access changes are saved."><div className="flex flex-wrap gap-3"><Action quiet>Transfer ownership</Action><Action quiet>Leave workspace</Action><PreviewDialog quiet trigger="Delete workspace" title="Delete workspace?" description="This is a preview of the confirmation. Nothing will be deleted."><Action>Delete workspace</Action></PreviewDialog></div></Panel>
    </Screen>
  );
}

export function WorkspaceMembersPage() {
  return (
    <Screen title="Workspace members" folder="members" description="See team members and their roles." action={
      <PreviewDialog trigger="Invite by email" title="Invite a member" description="Try the form in the preview. No email is sent.">
        <Field label="Email address" type="email" value="name@example.com" previewEdit />
        <SelectField label="Role" value="Member" choices={["Admin", "Member", "Guest"]} />
        <Action>Send invitation</Action>
      </PreviewDialog>
    }>
      <Panel title="People">
        <div className="space-y-3">
          <Row title="Alex Morgan" detail="alex@example.com" end={<Badge>Owner</Badge>} />
          <Row title="Jamie Lee" detail="jamie@example.com" end={<Badge tone="gray">Member</Badge>} />
        </div>
      </Panel>
    </Screen>
  );
}

export function InvitePage() {
  return (
    <main id="content" className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-[440px] space-y-6 rounded-[24px] border border-line bg-white px-8 py-10 text-center shadow-panel sm:px-10">
        <div><Brand /></div>
        <div><p className="mb-2 font-mono text-xs text-muted">invite / [token]</p><h1 className="text-[30px] font-bold tracking-tight">Workspace invitation</h1><p className="mt-2 text-sm leading-6 text-muted">This is a preview. No token is validated and no membership is changed.</p></div>
        <div className="grid gap-3"><Action>Accept invitation</Action><Action href="/workspaces" quiet>Back to workspaces</Action></div>
      </section>
    </main>
  );
}
