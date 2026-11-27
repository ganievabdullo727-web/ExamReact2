export const workspace = { name: "TaskFlow Workspace", slug: "taskflow" };
export const states = ["Todo", "In progress", "In review", "Done"];
export const labels = ["Design", "Frontend", "Accessibility"];
export const people = ["Jordan Lee", "Sam Rivera", "Alex Kim"];
export const projects = [
  { id: "website", key: "WEB", name: "Website redesign", description: "Refresh the marketing website experience", progress: 72 },
  { id: "mobile", key: "APP", name: "Mobile app v2.0", description: "Next-generation mobile experience", progress: 60 },
  { id: "platform", key: "API", name: "Platform & API", description: "Core infrastructure and developer platform", progress: 50 },
];
export const issues = [
  { id: "WEB-024", project: "website", name: "Review responsive navigation", status: states[1], priority: "High", label: labels[2], assignee: people[0] },
  { id: "WEB-025", project: "website", name: "Update landing page layout", status: states[0], priority: "Medium", label: labels[0], assignee: people[1] },
  { id: "APP-012", project: "mobile", name: "Prepare onboarding screens", status: states[0], priority: "Medium", label: labels[0], assignee: people[0] },
  { id: "API-008", project: "platform", name: "Document authentication flow", status: states[2], priority: "Low", label: labels[1], assignee: people[2] },
];
export const workspaceUrl = (slug = workspace.slug) => `/w/${slug}`;
export const projectUrl = (slug: string, id: string) => `${workspaceUrl(slug)}/p/${id}`;
