/**
 * DataStorage service provides an abstraction layer for data persistence operations.
 * Currently implemented with localStorage, but can be replaced with database operations.
 */
export class DataStorage {
  /**
   * Retrieves data for the given key
   * @param key The storage key
   * @returns Parsed data or default value if not found
   */
  static getData<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Stores data for the given key
   * @param key The storage key
   * @param data The data to store
   */
  static setData(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
    }
  }

  /**
   * Removes data for the given key
   * @param key The storage key
   */
  static removeData(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }

  /**
   * Checks if the walkthrough has been completed
   * @returns true if completed, false otherwise
   */
  static isWalkthroughCompleted(): boolean {
    return !!localStorage.getItem('walkthroughCompleted');
  }

  /**
   * Marks the walkthrough as completed
   */
  static markWalkthroughCompleted(): void {
    this.setData('walkthroughCompleted', true);
  }
}
