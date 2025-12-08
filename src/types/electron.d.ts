interface ElectronAPI {
  // App information
  getVersion(): Promise<string>
  getPath(name: string): Promise<string>
  
  // Window control
  minimizeWindow(): Promise<void>
  maximizeWindow(): Promise<void>
  closeWindow(): Promise<void>
  
  // File operations
  readFile(filePath: string): Promise<{ success: boolean; content?: string; error?: string }>
  writeFile(filePath: string, content: string): Promise<{ success: boolean; error?: string }>
  deleteFile(filePath: string): Promise<{ success: boolean; error?: string }>
  openFileDialog(options?: any): Promise<{ canceled: boolean; filePaths?: string[]; error?: string }>
  saveFileDialog(options?: any): Promise<{ canceled: boolean; filePath?: string; error?: string }>
  
  // Event listeners
  on(channel: string, callback: Function): void
  removeListener(channel: string, callback: Function): void
  listProjects(): Promise<{ success: boolean; data: any[] }>
  createProject(payload: { name: string; ownerId?: string | null; description?: string }): Promise<{ success: boolean; data: any }>
  listAssets(projectId?: string): Promise<{ success: boolean; data: any[] }>
  addAsset(payload: { projectId?: string | null; type?: string; filename?: string; path?: string; size?: number; hash?: string; metadata?: any }): Promise<{ success: boolean; data: any }>
}

interface Window {
  electronAPI?: ElectronAPI
}
