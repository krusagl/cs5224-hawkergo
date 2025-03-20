
import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  const addToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id
      );

      if (existingItemIndex >= 0) {
        // Item already exists in cart, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { 
          id: item.id, 
          name: item.name, 
          price: item.price,
          quantity: 1 
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === itemId
      );

      if (existingItemIndex >= 0) {
        // Item exists in cart
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];

        if (currentItem.quantity > 1) {
          // Decrease quantity if more than 1
          updatedItems[existingItemIndex] = {
            ...currentItem,
            quantity: currentItem.quantity - 1
          };
          return updatedItems;
        } else {
          // Remove item if quantity is 1
          return prevItems.filter(item => item.id !== itemId);
        }
      }
      
      return prevItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart
  };
};
