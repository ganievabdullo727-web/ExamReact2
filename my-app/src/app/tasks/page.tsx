import { AppShell } from "@/shared/layout/AppShell";
import { EmptyState, Panel, Screen } from "@/shared/ui/Ui";

export default function Page() {
  return (
    <AppShell>
      <Screen title="Tasks" folder="tasks" description="This is the existing preview placeholder, not the Issues feature.">
        <Panel title="Issue list"><EmptyState title="No tasks in this preview">Issues belong to Dev 1 and are not implemented here.</EmptyState></Panel>
      </Screen>
    </AppShell>
  );
}
