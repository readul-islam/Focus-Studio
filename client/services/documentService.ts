import { fetchData, postData, deleteData, patchData } from '@/lib/Api';

// API Response Type
export interface DocumentItem {
  id: number;
  name: string;
  type: 'FOLDER' | 'FILE' | 'LINK';
  file: string | null;
  link_url: string | null;
  created_at: string;
  updated_at: string;
  project: number;
  parent: number | null;
  studio: number;
  created_by: number;
  updated_by: number;
}

// Get root documents for a project
export const getDocuments = async (projectId: string | number) => {
  const response = await fetchData(`/documents/documents/root_documents/?project_id=${projectId}`);
  return response;
};

// Get folder content by folder ID
export const getFolderContent = async (folderId: string | number) => {
  const response = await fetchData(`/documents/documents/${folderId}/folder_content/`);
  return response;
};

// Create a new document (file, folder, or link)
export const createDocument = async (data: {
  name: string;
  type: 'FILE' | 'FOLDER' | 'LINK';
  file?: File;
  link_url?: string;
  project: string | number;
  parent?: number | null;
  signal?: AbortSignal;
}) => {
  const formData = new FormData();
  
  formData.append('name', data.name);
  formData.append('type', data.type);
  formData.append('project', String(data.project));
  
  if (data.parent !== undefined && data.parent !== null) {
    formData.append('parent', String(data.parent));
  }
  
  if (data.type === 'FILE' && data.file) {
    formData.append('file', data.file);
  }
  
  if (data.type === 'LINK' && data.link_url) {
    formData.append('link_url', data.link_url);
  }

  const response = await postData({ 
    url: '/documents/documents/', 
    data: formData,
    config: {
      signal: data.signal
    }
  });
  return response;
};

// Delete a document by ID
export const deleteDocument = async (id: string | number) => {
  const response = await deleteData({ url: `/documents/documents/${id}/` });
  return response;
};

// Update a document (rename)
export const updateDocument = async (id: string | number, data: { name: string }) => {
  const response = await patchData({ url: `/documents/documents/${id}/`, data });
  return response;
};

// Move documents to a new parent folder
export const moveDocuments = async (data: {
  document_ids: number[];
  parent_id: number | null;
}) => {
  const response = await postData({
    url: '/documents/documents/move_documents/',
    data,
  });
  return response;
};

// Upload a new version of an existing document
export const uploadNewVersion = async (data: {
  document_id: string | number;
  file: File;
  signal?: AbortSignal;
}) => {
  const formData = new FormData();
  formData.append('document_id', String(data.document_id));
  formData.append('file', data.file);

  const response = await postData({
    url: '/documents/documents/upload-new-version/',
    data: formData,
    config: {
      signal: data.signal,
    },
  });
  return response;
};
