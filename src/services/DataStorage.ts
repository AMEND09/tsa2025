/**
 * ApiService provides methods to interact with the Django backend API.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Your Django API base URL

// Helper to get the auth token from localStorage (or context/state management)
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

async function request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);

  if (!response.ok) {
    // Handle errors (e.g., by throwing an error or returning a specific error object)
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error(`API Error (${response.status}) on ${method} ${endpoint}:`, errorData);
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) { // No Content
    return null as T;
  }
  return response.json();
}


export class ApiService {
  // User Authentication
  static async login(credentials: { username: string; password: string }): Promise<any> {
    const data = await request<any>('auth/login/', 'POST', credentials);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        username: data.username,
        email: data.email,
        name: data.name,
        id: data.user_id
      }));
      await ApiService.saveLocalStorageToBackend();
    }
    return data;
  }

  // User Registration
  static async register(userData: {
    username: string;
    password: string;
    email: string;
    name: string;
  }): Promise<any> {
    const data = await request<any>('auth/register/', 'POST', userData);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        username: data.username,
        email: data.email,
        name: data.name,
        id: data.user_id
      }));
      await ApiService.saveLocalStorageToBackend();
    }
    return data;
  }

  static async logout(): Promise<void> {
    try {
      await request<void>('auth/logout/', 'POST');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      // Don't sync to backend after logout as user is no longer authenticated
    }
  }

  static async updateProfile(userData: {
    name: string;
    email: string;
    role: string;
  }): Promise<any> {
    const data = await request<any>('auth/profile/', 'PUT', userData);
    // Update local storage with new data
    const currentUser = ApiService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      await ApiService.saveLocalStorageToBackend();
    }
    return data;
  }
  
  static getCurrentUser(): any | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  static isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }


  // Example: Fetching Farms
  static async getFarms<T>(): Promise<T[]> {
    return request<T[]>('farms/', 'GET');
  }

  // Example: Adding a Farm
  static async addFarm<T>(farmData: any): Promise<T> {
    return request<T>('farms/', 'POST', farmData);
  }

  static async updateFarm<T>(farmId: number, farmData: any): Promise<T> {
    return request<T>(`farms/${farmId}/`, 'PUT', farmData);
  }

  static async deleteFarm(farmId: number): Promise<void> {
    await request<void>(`farms/${farmId}/`, 'DELETE');
  }

  // You would add similar methods for PlanItems, Livestock, etc.
  // Example for PlanItems
  static async getPlanItems<T>(farmId?: number): Promise<T[]> {
    const endpoint = farmId ? `farms/${farmId}/plans/` : 'plans/'; // Adjust if your API structure is different
    return request<T[]>(endpoint, 'GET');
  }

  static async addPlanItem<T>(planData: any): Promise<T> {
    // planData should include farm ID, e.g., { farm: 1, title: '...', ... }
    return request<T>('plans/', 'POST', planData);
  }
  
  // Method to save the entire localStorage to the backend
  static async saveLocalStorageToBackend(): Promise<void> {
    if (!ApiService.isLoggedIn()) {
      // Don't log this as it creates noise - just silently skip
      return;
    }
    const localStorageSnapshot: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== 'authToken' && key !== 'currentUser') { // Don't sync auth-related data
        localStorageSnapshot[key] = localStorage.getItem(key);
      }
    }
    try {
      await request<void>('sync/localstorage/save/', 'POST', localStorageSnapshot);
      console.log('LocalStorage snapshot saved to backend.');
    } catch (error) {
      // Only log if it's not an auth error
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Invalid token')) {
        console.error('Failed to save localStorage snapshot to backend. Data is still saved locally.', error);
      }
    }
  }

  // Method to load localStorage data from the backend
  static async loadLocalStorageFromBackend(): Promise<void> {
    if (!ApiService.isLoggedIn()) {
      return;
    }
    try {
      const backendData = await request<Record<string, string>>('sync/localstorage/load/', 'GET');
      
      if (backendData) {
        // Store auth-related data before clearing
        const authToken = localStorage.getItem('authToken');
        const currentUser = localStorage.getItem('currentUser');
        localStorage.clear();
        
        // Restore auth-related data
        if (authToken) {
          localStorage.setItem('authToken', authToken);
        }
        if (currentUser) {
          localStorage.setItem('currentUser', currentUser);
        }
        
        // Load data from backend
        for (const key in backendData) {
          if (Object.prototype.hasOwnProperty.call(backendData, key) && 
              key !== 'authToken' && key !== 'currentUser') {
            localStorage.setItem(key, backendData[key]);
          }
        }
        console.log('LocalStorage loaded from backend.');
      } else {
        console.log('No localStorage data received from backend.');
      }
    } catch (error) {
      // Only log if it's not an auth error
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Invalid token')) {
        console.error('Failed to load localStorage from backend:', error);
      }
    }
  }

  // ... other methods for setData, removeData would now be addEntity, updateEntity, deleteEntity
}

// The old DataStorage methods for walkthrough can remain if they are purely client-side
export class DataStorage {
  private static syncTimer: NodeJS.Timeout | null = null;
  private static pendingSync = false;

  static isWalkthroughCompleted(): boolean {
    return !!localStorage.getItem('walkthroughCompleted');
  }

  static async markWalkthroughCompleted(): Promise<void> {
    localStorage.setItem('walkthroughCompleted', 'true');
    this.scheduleBatchSync();
  }

  // Keep setData and getData for non-API related local storage if needed
  static getData<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return defaultValue;
    }
  }

  static setData(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.scheduleBatchSync();
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
    }
  }

  static removeData(key: string): void {
    try {
      localStorage.removeItem(key);
      this.scheduleBatchSync();
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }

  // Batch sync to avoid too many API calls
  private static scheduleBatchSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(async () => {
      if (!this.pendingSync && ApiService.isLoggedIn()) {
        this.pendingSync = true;
        try {
          await ApiService.saveLocalStorageToBackend();
          console.log('Batch sync completed successfully');
        } catch (error) {
          console.error('Batch sync failed:', error);
        } finally {
          this.pendingSync = false;
        }
      }
    }, 500); // 500ms debounce for batch operations
  }

  // Force immediate sync
  static async forcSync(): Promise<boolean> {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }

    if (!this.pendingSync && ApiService.isLoggedIn()) {
      this.pendingSync = true;
      try {
        await ApiService.saveLocalStorageToBackend();
        console.log('Force sync completed successfully');
        return true;
      } catch (error) {
        console.error('Force sync failed:', error);
        return false;
      } finally {
        this.pendingSync = false;
      }
    }
    return false;
  }
}
