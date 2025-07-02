/**
 * ApiService provides methods to interact with the Django backend API.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Your Django API base URL

// Helper to get the auth token from localStorage (or context/state management)
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Force logout and clear all cached data
function forceLogout(): void {
  localStorage.removeItem('authToken');
  DataStorage.clearUserData();
  // Clear all other cached data
  // localStorage.clear(); // This was wiping all data, which is not ideal.
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
    // Handle authentication errors - force logout if token is invalid
    if (response.status === 401) {
      console.warn('Authentication failed - token invalid or user deleted');
      forceLogout();
      // Optionally reload the page to force re-authentication
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
    
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
      DataStorage.setUserData({
        username: data.username,
        email: data.email,
        name: data.name,
        id: data.user_id
      });
      // await ApiService.saveLocalStorageToBackend(); // Let's load first, then save.
      await ApiService.loadLocalStorageFromBackend();
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
      DataStorage.setUserData({
        username: data.username,
        email: data.email,
        name: data.name,
        id: data.user_id
      });
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
      DataStorage.clearUserData();
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
      DataStorage.updateUserData({
        name: userData.name,
        email: userData.email
      });
      await ApiService.saveLocalStorageToBackend();
    }
    return data;
  }
  
  static getCurrentUser(): any | null {
    return DataStorage.getUserData();
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
      if (key && key !== 'authToken' && 
          !key.startsWith('user_')) { // Don't sync auth-related data or individual user data keys
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
  static async loadLocalStorageFromBackend(): Promise<boolean> {
    if (!ApiService.isLoggedIn()) {
      return false;
    }
    try {
      const backendData = await request<Record<string, string>>('sync/localstorage/load/', 'GET');
      
      // Check if we received actual data or just an empty object
      const hasData = backendData && Object.keys(backendData).length > 0;
      
      if (hasData) {
        // Store auth-related data and user data before clearing
        const authToken = localStorage.getItem('authToken');
        const userData = DataStorage.getUserData();
        localStorage.clear();
        
        // Restore auth-related data
        if (authToken) {
          localStorage.setItem('authToken', authToken);
        }
        if (userData) {
          DataStorage.setUserData(userData);
        }
        
        // Load data from backend
        for (const key in backendData) {
          if (Object.prototype.hasOwnProperty.call(backendData, key) && 
              key !== 'authToken' && !key.startsWith('user_')) {
            localStorage.setItem(key, backendData[key]);
          }
        }
        console.log('LocalStorage loaded from backend.');
        return true;
      } else {
        console.log('No localStorage data found in backend for user - will use defaults.');
        return false;
      }
    } catch (error) {
      // Only log if it's not an auth error
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Invalid token')) {
        console.error('Failed to load localStorage from backend:', error);
      }
      return false;
    }
  }

  // Validate current user against backend
  static async validateCurrentUser(): Promise<boolean> {
    try {
      if (!ApiService.isLoggedIn()) {
        return false;
      }
      
      // Try to fetch user profile to validate the token and user still exists
      const response = await request<any>('auth/profile/', 'GET');
      const currentUser = ApiService.getCurrentUser();
      
      if (!currentUser || !response) {
        console.warn('User validation failed: no current user or response');
        return false;
      }
      
      // Check if the user details match what we have cached
      if (currentUser.username !== response.username || 
          currentUser.email !== response.email ||
          currentUser.id !== response.user_id) {
        console.warn('User validation failed: cached user data does not match backend');
        return false;
      }
      
      // Update cached user with latest data from backend
      DataStorage.setUserData({
        username: response.username,
        email: response.email,
        name: response.name,
        id: response.user_id
      });
      
      return true;
    } catch (error: any) {
      console.error('User validation failed:', error.message);
      
      // If it's a 401 error, the forceLogout() will be called by the request function
      // For other errors (network issues), we might not want to force logout immediately
      if (error.message && error.message.includes('401')) {
        return false;
      }
      
      // For network errors, assume user is still valid but log the issue
      if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
        console.warn('Network error during user validation, assuming user is still valid');
        return true;
      }
      
      return false;
    }
  }

  // Force logout and clear all cached data
  static forceLogout(): void {
    forceLogout();
  }

  // ...existing code...
}

// The old DataStorage methods for walkthrough can remain if they are purely client-side
export class DataStorage {
  private static syncTimer: NodeJS.Timeout | null = null;
  private static pendingSync = false;

  // User data keys for individual storage
  private static readonly USER_DATA_KEYS = {
    USERNAME: 'user_username',
    EMAIL: 'user_email', 
    NAME: 'user_name',
    ID: 'user_id'
  } as const;

  // Utility functions for managing individual user data keys
  static setUserData(userData: {
    username: string;
    email: string;
    name: string;
    id: number | string;
  }): void {
    try {
      localStorage.setItem(this.USER_DATA_KEYS.USERNAME, userData.username);
      localStorage.setItem(this.USER_DATA_KEYS.EMAIL, userData.email);
      localStorage.setItem(this.USER_DATA_KEYS.NAME, userData.name);
      localStorage.setItem(this.USER_DATA_KEYS.ID, userData.id.toString());
      this.scheduleBatchSync();
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  static getUserData(): any | null {
    try {
      // Check if we need to migrate from old format
      this.migrateFromOldFormat();

      const username = localStorage.getItem(this.USER_DATA_KEYS.USERNAME);
      const email = localStorage.getItem(this.USER_DATA_KEYS.EMAIL);
      const name = localStorage.getItem(this.USER_DATA_KEYS.NAME);
      const id = localStorage.getItem(this.USER_DATA_KEYS.ID);

      if (!username || !email || !name || !id) {
        return null;
      }

      return {
        username,
        email,
        name,
        id: parseInt(id, 10)
      };
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  // Migration function to handle existing users with old format
  private static migrateFromOldFormat(): void {
    try {
      const oldCurrentUser = localStorage.getItem('currentUser');
      if (oldCurrentUser && !localStorage.getItem(this.USER_DATA_KEYS.USERNAME)) {
        // Migration needed - we have old data but no new data
        const userData = JSON.parse(oldCurrentUser);
        if (userData && userData.username) {
          console.log('Migrating user data from old format to new format');
          this.setUserData({
            username: userData.username,
            email: userData.email || '',
            name: userData.name || '',
            id: userData.id || userData.user_id || 0
          });
          // Remove the old format data
          localStorage.removeItem('currentUser');
        }
      }
    } catch (error) {
      console.warn('Error during user data migration:', error);
      // If migration fails, just continue with existing data
    }
  }

  static updateUserData(updates: Partial<{
    username: string;
    email: string;
    name: string;
    id: number | string;
  }>): void {
    try {
      if (updates.username !== undefined) {
        localStorage.setItem(this.USER_DATA_KEYS.USERNAME, updates.username);
      }
      if (updates.email !== undefined) {
        localStorage.setItem(this.USER_DATA_KEYS.EMAIL, updates.email);
      }
      if (updates.name !== undefined) {
        localStorage.setItem(this.USER_DATA_KEYS.NAME, updates.name);
      }
      if (updates.id !== undefined) {
        localStorage.setItem(this.USER_DATA_KEYS.ID, updates.id.toString());
      }
      this.scheduleBatchSync();
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  static clearUserData(): void {
    try {
      localStorage.removeItem(this.USER_DATA_KEYS.USERNAME);
      localStorage.removeItem(this.USER_DATA_KEYS.EMAIL);
      localStorage.removeItem(this.USER_DATA_KEYS.NAME);
      localStorage.removeItem(this.USER_DATA_KEYS.ID);
      this.scheduleBatchSync();
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

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
