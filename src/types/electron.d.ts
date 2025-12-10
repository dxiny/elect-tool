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
}

interface Window {
  electronAPI?: ElectronAPI
}
