import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const savedCart = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (savedCart) {
        setProducts(JSON.parse(savedCart));
      }

      console.log(products);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      //

      const index = products.findIndex(element => element.id === product.id);

      if (index === -1) {
        const newProduct: Product = {
          id: product.id,
          image_url: product.image_url,
          price: product.price,
          title: product.title,
          quantity: 1,
        };
        setProducts([newProduct, ...products]);
      } else {
        const newProduct: Product = {
          id: products[index].id,
          image_url: products[index].image_url,
          price: products[index].price,
          title: products[index].title,
          quantity: products[index].quantity + 1,
        };
        const newProducts = [...products];
        newProducts.splice(index, 1, newProduct);
        setProducts(newProducts);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(element => element.id === id);

      if (index >= 0) {
        const newProduct: Product = {
          id: products[index].id,
          image_url: products[index].image_url,
          price: products[index].price,
          title: products[index].title,
          quantity: products[index].quantity + 1,
        };
        const newProducts = [...products];
        newProducts.splice(index, 1, newProduct);
        setProducts(newProducts);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(element => element.id === id);

      if (index >= 0) {
        if (products[index].quantity > 1) {
          const newProduct: Product = {
            id: products[index].id,
            image_url: products[index].image_url,
            price: products[index].price,
            title: products[index].title,
            quantity: products[index].quantity - 1,
          };
          const newProducts = [...products];
          newProducts.splice(index, 1, newProduct);
          setProducts(newProducts);
        } else {
          const newProducts = [...products];
          newProducts.splice(index, 1);
          setProducts(newProducts);
        }
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
