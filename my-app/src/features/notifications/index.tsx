import { Action, Badge, Panel, Row, Screen } from "@/shared/ui/Ui";

export function NotificationsPage() {
  return (
    <Screen title="Notifications" folder="notifications" description="Preview the workspace notification feed." action={<Action quiet>Mark all as read</Action>}>
      <Panel title="Recent notifications" description="Example notifications, not live data.">
        <div className="space-y-3"><Row title="Workspace invitation" detail="Example · Just now" end={<Badge>New</Badge>} /><Row title="Project updated" detail="Example · Yesterday" end={<Badge tone="gray">Read</Badge>} /></div>
      </Panel>
    </Screen>
  );
}
