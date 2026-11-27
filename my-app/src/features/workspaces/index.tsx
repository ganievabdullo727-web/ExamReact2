import { Action, Badge, Brand, Field, Panel, Row, Screen, SelectField } from "@/shared/ui/Ui";

export function WorkspacesPage() {
  return (
    <Screen title="Workspaces" folder="workspaces" description="Choose a workspace or see how a new one is created.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Your workspaces" description="Continue with the example workspace.">
          <Row title="TaskFlow" detail="Workspace preview" end={<Badge>Owner</Badge>} href="/w/taskflow" />
        </Panel>
        <Panel title="Create a workspace" description="The form is shown for design review only.">
          <div className="space-y-4">
            <Field label="Workspace name" value="TaskFlow" />
            <Field label="Workspace slug" value="taskflow" />
            <Action>Create workspace</Action>
          </div>
        </Panel>
      </div>
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
      <Panel title="Ownership and access" description="These actions are disabled in the preview."><div className="flex flex-wrap gap-3"><Action quiet>Transfer ownership</Action><Action quiet>Leave workspace</Action><Action quiet>Delete workspace</Action></div></Panel>
    </Screen>
  );
}

export function WorkspaceMembersPage() {
  return (
    <Screen title="Workspace members" folder="members" description="See team members and how an invitation is composed.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="People"><div className="space-y-3"><Row title="Alex Morgan" detail="alex@example.com" end={<Badge>Owner</Badge>} /><Row title="Jamie Lee" detail="jamie@example.com" end={<Badge tone="gray">Member</Badge>} /></div></Panel>
        <Panel title="Invite by email" description="Preview of the invitation form. No email is sent.">
          <div className="space-y-4"><Field label="Email address" type="email" value="name@example.com" /><SelectField label="Role" value="Member" /><Action>Send invitation</Action></div>
        </Panel>
      </div>
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
