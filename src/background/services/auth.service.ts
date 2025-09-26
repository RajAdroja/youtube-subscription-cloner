export class AuthService {
    static async getAuthToken(interactive = true): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!chrome?.identity?.getAuthToken) {
          return reject(new Error("Chrome Identity API not available"));
        }
  
        chrome.identity.getAuthToken({ interactive }, (token) => {
          if (chrome.runtime.lastError) {
            console.error("OAuth error:", chrome.runtime.lastError.message);
            return reject(new Error(chrome.runtime.lastError.message));
          }
  
          if (token && typeof token === 'string') {
            resolve(token);
          } else {
            return reject(new Error("No token retrieved"));
          }
        });
      });
    }
  }