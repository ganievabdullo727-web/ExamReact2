import { EmptyPanel, WorkspaceShell } from "../_components/workspace-shell";

export default function SettingsPage() {
  return (
    <WorkspaceShell section="/settings" summary="Здесь будут параметры рабочего пространства.">
      <EmptyPanel title="Настройки пока недоступны">
        Пока это макет. Сохранение настроек не подключено.
      </EmptyPanel>
    </WorkspaceShell>
  );
}
