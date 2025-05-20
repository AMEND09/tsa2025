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
  // Example: User Login
  static async login(credentials: { username: string; password: string }): Promise<any> {
    const data = await request<any>('login/', 'POST', credentials);
    if (data.token) {
      localStorage.setItem('authToken', data.token); // Store token
      localStorage.setItem('currentUser', JSON.stringify({ username: data.username, email: data.email, id: data.user_id }));
    }
    return data;
  }

  // Example: User Registration
  static async register(userData: any): Promise<any> {
    const data = await request<any>('register/', 'POST', userData);
     if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify({ username: data.username, email: data.email, id: data.user_id }));
    }
    return data;
  }

  static logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    // Potentially call a backend logout endpoint if it invalidates tokens server-side
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
  
  // ... other methods for setData, removeData would now be addEntity, updateEntity, deleteEntity
}

// The old DataStorage methods for walkthrough can remain if they are purely client-side
export class DataStorage {
  static isWalkthroughCompleted(): boolean {
    return !!localStorage.getItem('walkthroughCompleted');
  }

  static markWalkthroughCompleted(): void {
    localStorage.setItem('walkthroughCompleted', 'true');
  }
   // Keep setData and getData for non-API related local storage if needed
  static getData<T>(key: string, defaultValue: T): T {
    console.log(`DataStorage: Getting data for key '${key}'`);
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return defaultValue;
    }
  }

  static setData(key: string, data: any): void {
    console.log(`DataStorage: Setting data for key '${key}'`, data);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
    }
  }
   static removeData(key: string): void {
    console.log(`DataStorage: Removing data for key '${key}'`);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }
}
