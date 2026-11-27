import { EmptyPanel, WorkspaceShell } from "../_components/workspace-shell";

export default function TasksPage() {
  return (
    <WorkspaceShell section="/tasks" summary="Здесь будут задачи и их статусы.">
      <EmptyPanel title="Задачи пока не подключены">
        Этот раздел готов для будущего подключения списка задач из API.
      </EmptyPanel>
    </WorkspaceShell>
  );
}
