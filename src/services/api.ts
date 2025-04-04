/**
 * API Service
 * This module contains all the API endpoints for the application.
 * Replace the base URL with your actual API URL when deploying.
 */

const API_BASE_URL =
  "https://xatcwdmrsg.execute-api.ap-southeast-1.amazonaws.com";

// Types
export interface User {
  userID: string;
  userName: string;
  email: string;
  password?: string;
}

export interface Stall {
  stallID: string;
  userID: string;
  stallName: string;
  stallAddress: string;
  stallDescription: string;
  stallLogo?: string;
}

export interface MenuItem {
  menuItemID: string;
  stallID: string;
  menuItemName: string;
  menuItemDescription: string;
  menuItemPrice: number;
  menuItemImage: string;
  menuAvailability: boolean;
}

export interface OrderItem {
  menuItemName: string;
  quantity: number;
}

export interface Order {
  orderID: string;
  stallID: string;
  customerName: string;
  customerContact: string;
  orderStatus:
    | "new"
    | "pending"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled"
    | "scheduled";
  orderDateTime: string;
  orderTotalCost: number;
  orderDetails: OrderItem[];
  paymentStatus: "paid" | "pending";
  paymentMethod: "card" | "qr" | "cash";
  amount: number;
}

// Helper function for making API requests
async function fetchAPI<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: Record<string, unknown>
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Add authentication headers if needed
      // 'Authorization': `Bearer ${getToken()}`
    },
    // Add CORS mode
    mode: "cors",
    credentials: "omit",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    return response.json();
  } catch (error: unknown) {
    console.error(`API request failed for ${endpoint}:`, error);

    // If this is a CORS error or network error, use mock data for development
    if (
      error instanceof TypeError &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("CORS"))
    ) {
      console.warn("CORS issue detected, falling back to mock data");
      return getMockData<T>(endpoint, method);
    }

    throw error;
  }
}

// Mock data function for development/testing
function getMockData<T>(endpoint: string, method: string): T {
  // Check if it's a stall profile request
  if (endpoint.match(/\/api\/stalls\/.*/) && method === "GET") {
    const stallID = endpoint.split("/").pop() || "1";

    const mockStall: Stall = {
      stallID: stallID,
      userID: "001",
      stallName: "Mock Hawker Stall",
      stallAddress: "123 Mock Street, #01-45",
      stallDescription: "This is a mock stall for development",
      stallLogo: "/placeholder.svg",
    };

    return mockStall as unknown as T;
  }

  // For stall profile update
  if (endpoint.match(/\/api\/stalls\/.*/) && method === "PUT") {
    const stallID = endpoint.split("/").pop() || "1";

    const mockResponse = {
      stallID: stallID,
      message: "Stall profile updated",
    };

    return mockResponse as unknown as T;
  }

  // Add more mock data for other endpoints as needed

  // Default fallback
  throw new Error(`No mock data available for ${endpoint}`);
}

// User API endpoints
export const userAPI = {
  // 1. Create a user (Jiayang)
  createUser: (userName: string, email: string, password: string) =>
    fetchAPI<{ userID: string; message: string }>("/api/users", "POST", {
      userName,
      email,
      password,
    }),

  // 2. Get a user profile (Jiayang)
  getUserProfile: (userID: string) =>
    fetchAPI<User>(`/api/users/${userID}`, "GET"),

  // 3. Update a user profile (Jiayang)
  updateUserProfile: (
    userID: string,
    userData: { userName?: string; email?: string }
  ) =>
    fetchAPI<{ userID: string; message: string }>(
      `/api/users/${userID}`,
      "PUT",
      userData
    ),

  // 4. Create a stall for a user (Jiayang)
  createStall: (
    userID: string,
    stallData: {
      stallName: string;
      stallAddress: string;
      stallDescription: string;
    }
  ) =>
    fetchAPI<{ userID: string; stallID: string; message: string }>(
      `/api/users/${userID}/stalls`,
      "POST",
      stallData
    ),
};

// Stall API endpoints
export const stallAPI = {
  // 5. Get a stall profile (Yufan)
  getStallProfile: (stallID: string) =>
    fetchAPI<Stall>(`/api/stalls/${stallID}`, "GET"),

  // 6. Update a stall profile (Yufan)
  updateStallProfile: (
    stallID: string,
    stallData: {
      stallName?: string;
      stallAddress?: string;
      stallDescription?: string;
    }
  ) =>
    fetchAPI<{ stallID: string; message: string }>(
      `/api/stalls/${stallID}`,
      "PUT",
      stallData
    ),

  // 7. Create a menu item for a stall
  createMenuItem: (
    stallID: string,
    menuItemData: {
      menuItemName: string;
      menuItemDescription: string;
      menuItemPrice: number;
      menuItemImage: string;
      menuAvailability: boolean;
    }
  ) =>
    fetchAPI<{ stallID: string; menuItemID: string; message: string }>(
      `/api/stalls/${stallID}/menu`,
      "POST",
      menuItemData
    ),

  // 8. Get all menu items for a stall
  getMenuItems: (stallID: string) =>
    fetchAPI<{ stallID: string; menuItems: MenuItem[] }>(
      `/api/stalls/${stallID}/menu`,
      "GET"
    ),

  // 9. Update a menu item for a stall
  updateMenuItem: (
    stallID: string,
    menuItemID: string,
    menuItemData: {
      menuItemName?: string;
      menuItemDescription?: string;
      menuItemPrice?: number;
      menuItemImage?: string;
      menuAvailability?: boolean;
    }
  ) =>
    fetchAPI<{ stallID: string; menuItemID: string; message: string }>(
      `/api/stalls/${stallID}/menu/${menuItemID}`,
      "PUT",
      menuItemData
    ),

  // 10. Create an order for a stall
  createOrder: (
    stallID: string,
    orderData: {
      customerName: string;
      customerContact: string;
      orderDetails: OrderItem[];
      orderTotalCost: number;
    }
  ) =>
    fetchAPI<{ stallID: string; orderID: string; message: string }>(
      `/api/stalls/${stallID}/orders`,
      "POST",
      orderData
    ),

  // 11. Get all orders for a stall
  getOrders: (stallID: string) =>
    fetchAPI<{ stallID: string; orders: Order[] }>(
      `/api/stalls/${stallID}/orders`,
      "GET"
    ),
};

// Order API endpoints
export const orderAPI = {
  // 12. Get an order detail
  getOrderDetail: (orderID: string) =>
    fetchAPI<Order>(`/api/orders/${orderID}`, "GET"),

  // 13. Update an order status
  updateOrderStatus: (orderID: string, orderStatus: Order["orderStatus"]) =>
    fetchAPI<{ orderID: string; message: string }>(
      `/api/orders/${orderID}`,
      "PUT",
      { orderStatus }
    ),
};

export default {
  user: userAPI,
  stall: stallAPI,
  order: orderAPI,
};
