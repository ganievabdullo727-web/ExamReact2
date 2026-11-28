import axios from "axios";
import { getIssueError } from "@/features/issues/api/issue.api";
import { api } from "@/shared/api/client";

type AttachmentMetadata = {
  id: string;
  workspace_id: string;
  issue_id: string;
  uploaded_by_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_key: string;
  created_at: string;
  uploaded_by: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type IssueAttachment = AttachmentMetadata & { download_url: string };

type AttachmentRegistration = {
  attachment: AttachmentMetadata;
  upload: { url: string; method: "PUT"; headers: Record<string, string>; expires_in: number };
};

export type UploadAttachmentInput = { file: File; onProgress?: (percent: number) => void };

const configuredMaxBytes = Number(process.env.NEXT_PUBLIC_ATTACHMENT_MAX_BYTES);
export const attachmentMaxBytes = Number.isSafeInteger(configuredMaxBytes) && configuredMaxBytes > 0
  ? configuredMaxBytes
  : 25 * 1024 * 1024;

// Signed storage requests use their own client, outside the API's auth interceptor.
const storage = axios.create({ withCredentials: false, withXSRFToken: false });

class AttachmentError extends Error {}

export function getAttachmentError(error: unknown, fallback: string): string {
  return error instanceof AttachmentError ? error.message : getIssueError(error, fallback);
}

export function validateAttachmentFile(file: File): string | undefined {
  if (!file.name.trim() || file.name.length > 255) return "Choose a file with a name up to 255 characters.";
  if (file.size === 0) return "Choose a file that is not empty.";
  if (file.size > attachmentMaxBytes) return "The file exceeds the maximum upload size.";
  if (file.type.length > 255) return "The file type is too long.";
}

const projectPath = (slug: string, projectId: string) =>
  `/v1/workspaces/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}`;

const attachmentsPath = (slug: string, projectId: string, issueId: string) =>
  `${projectPath(slug, projectId)}/issues/${encodeURIComponent(issueId)}/attachments/`;

function storageUrl(value: string) {
  const url = URL.canParse(value) ? new URL(value) : null;
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
    throw new AttachmentError("The storage URL is invalid.");
  }
  return url.href;
}

export async function getIssueAttachments(
  slug: string,
  projectId: string,
  issueId: string,
  signal?: AbortSignal,
): Promise<IssueAttachment[]> {
  const { data } = await api.get<IssueAttachment[]>(attachmentsPath(slug, projectId, issueId), { signal });
  if (!Array.isArray(data) || data.some((attachment) => attachment.issue_id !== issueId)) {
    throw new AttachmentError("The returned attachments do not belong to this issue.");
  }
  return data;
}

export async function deleteIssueAttachment(slug: string, projectId: string, attachmentId: string): Promise<void> {
  await api.delete(`${projectPath(slug, projectId)}/attachments/${encodeURIComponent(attachmentId)}`);
}

export async function uploadIssueAttachment(
  slug: string,
  projectId: string,
  issueId: string,
  { file, onProgress }: UploadAttachmentInput,
): Promise<void> {
  const validationError = validateAttachmentFile(file);
  if (validationError) throw new AttachmentError(validationError);

  const { data } = await api.post<AttachmentRegistration>(attachmentsPath(slug, projectId, issueId), {
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || "application/octet-stream",
  });
  const { attachment, upload } = data;
  if (attachment?.issue_id !== issueId || !attachment.id) {
    throw new AttachmentError("Storage did not return an attachment for this issue.");
  }

  try {
    if (upload?.method !== "PUT") throw new AttachmentError("The storage upload instructions are invalid.");
    await storage.put(storageUrl(upload.url), file, {
      headers: upload.headers,
      ...(onProgress && {
        onUploadProgress: ({ loaded }) => onProgress(Math.min(99, Math.floor(loaded * 100 / file.size))),
      }),
    });
  } catch (error) {
    // Registration happens before the PUT, so remove the row if storage rejects the file.
    try {
      await deleteIssueAttachment(slug, projectId, attachment.id);
    } catch (cleanupError) {
      if (!axios.isAxiosError(cleanupError) || cleanupError.response?.status !== 404) {
        throw new AttachmentError("Upload failed and its attachment entry could not be cleared. Check the file list before retrying.");
      }
    }
    if (error instanceof AttachmentError) throw error;
    if (axios.isAxiosError(error) && error.response?.status === 413) {
      throw new AttachmentError("The file exceeds the size accepted by storage.");
    }
    throw new AttachmentError("Could not upload the file to storage. Try again.");
  }

  onProgress?.(100);
}

export async function downloadIssueAttachment(
  slug: string,
  projectId: string,
  issueId: string,
  attachmentId: string,
): Promise<void> {
  // Fetch immediately before use because S3 links expire.
  const attachments = await getIssueAttachments(slug, projectId, issueId);
  const attachment = attachments.find((item) => item.id === attachmentId);
  if (!attachment) throw new AttachmentError("This attachment is no longer available.");

  const response = await fetch(storageUrl(attachment.download_url), { credentials: "omit", cache: "no-store" });
  if (!response.ok) throw new AttachmentError("Could not download the file from storage. Try again.");

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.file_name;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
