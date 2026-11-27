import { EmptyPanel, WorkspaceShell } from "../_components/workspace-shell";

export default function ProjectsPage() {
  return (
    <WorkspaceShell section="/projects" summary="Здесь будет список проектов рабочего пространства.">
      <EmptyPanel title="Проекты пока не подключены">
        Список появится после подключения API. Пока можно посмотреть вёрстку раздела.
      </EmptyPanel>
    </WorkspaceShell>
  );
}
