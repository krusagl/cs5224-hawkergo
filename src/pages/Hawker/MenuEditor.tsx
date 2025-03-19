
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, 
  DollarSign, Tag, ChevronRight, ChevronLeft, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

// Mock data for menu items
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

interface MenuCategoryGroup {
  name: string;
  items: MenuItem[];
}

// Initial menu items
const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Rice',
    description: 'Tender poached chicken served with fragrant rice, cucumber slices, and homemade chili sauce.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Main Dishes',
    available: true
  },
  {
    id: '2',
    name: 'Wanton Mee',
    description: 'Egg noodles with char siu (barbecued pork), leafy vegetables, and wonton dumplings.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Main Dishes',
    available: true
  },
  {
    id: '3',
    name: 'Ice Kacang',
    description: 'Shaved ice dessert with sweet syrup, red beans, and various toppings.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Desserts',
    available: true
  },
  {
    id: '4',
    name: 'Iced Teh Tarik',
    description: 'Pulled milk tea served cold.',
    price: 2.0,
    image: 'https://images.unsplash.com/photo-1561504809-b9c78594de7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Beverages',
    available: true
  }
];

const MenuEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [originalItem, setOriginalItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Group menu items by category
  const categorizedItems: MenuCategoryGroup[] = React.useMemo(() => {
    const categories: { [key: string]: MenuItem[] } = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    
    return Object.keys(categories).map(name => ({
      name,
      items: categories[name]
    }));
  }, [menuItems]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);
  
  const handleAddNewItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      image: '',
      category: 'Main Dishes',
      available: true
    };
    setEditingItem(newItem);
    setOriginalItem(null);
    setHasChanges(true);
  };
  
  const handleEditItem = (item: MenuItem) => {
    setEditingItem({ ...item });
    setOriginalItem({ ...item });
    setHasChanges(false);
  };
  
  const handleDeleteItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    if (editingItem?.id === id) {
      setEditingItem(null);
      setOriginalItem(null);
    }
    toast({
      title: 'Item Deleted',
      description: 'Menu item has been removed successfully',
    });
  };
  
  const handleSaveItem = async () => {
    if (!editingItem) return;
    
    if (!editingItem.name.trim()) {
      toast({
        title: 'Error',
        description: 'Item name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (editingItem.price <= 0) {
      toast({
        title: 'Error',
        description: 'Price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMenuItems(prev => {
        const exists = prev.some(item => item.id === editingItem.id);
        if (exists) {
          return prev.map(item => item.id === editingItem.id ? editingItem : item);
        } else {
          return [...prev, editingItem];
        }
      });
      
      setEditingItem(null);
      setOriginalItem(null);
      setHasChanges(false);
      
      toast({
        title: 'Success',
        description: 'Menu item has been saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save menu item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingItem(null);
    setOriginalItem(null);
    setHasChanges(false);
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editingItem) return;
    
    const { name, value } = e.target;
    
    setEditingItem(prev => {
      if (!prev) return prev;
      
      if (name === 'price') {
        return { ...prev, [name]: parseFloat(value) || 0 };
      }
      
      return { ...prev, [name]: value };
    });
    
    setHasChanges(true);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && editingItem) {
        setEditingItem({ ...editingItem, image: e.target.result as string });
        setHasChanges(true);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleToggleAvailable = (id: string) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, available: !item.available } 
          : item
      )
    );
    
    toast({
      title: 'Item Updated',
      description: 'Item availability has been toggled',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const canSave = editingItem && hasChanges;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Button
            variant="ghost"
            className="mb-2 -ml-3 md:hidden"
            onClick={() => navigate('/hawker/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Menu Editor</h1>
          <p className="text-muted-foreground mt-1">Add, update, or remove items from your menu</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/hawker/dashboard')}
            className="hidden md:flex"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            onClick={handleAddNewItem}
            disabled={!!editingItem}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menu Items List */}
        <div className="space-y-6">
          <AnimatedTransition>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Menu Items</CardTitle>
                <CardDescription>
                  {menuItems.length} items in your menu. Click on an item to edit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={categorizedItems.length > 0 ? categorizedItems[0].name : ""}>
                  <TabsList className="mb-4 w-full flex overflow-x-auto">
                    {categorizedItems.map(category => (
                      <TabsTrigger 
                        key={category.name} 
                        value={category.name}
                        className="flex-shrink-0"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {categorizedItems.map(category => (
                    <TabsContent key={category.name} value={category.name} className="m-0">
                      {category.items.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          No items in this category
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {category.items.map(item => (
                            <div 
                              key={item.id}
                              className={`p-4 border rounded-lg flex items-center cursor-pointer transition-colors
                                ${editingItem?.id === item.id ? 'border-primary bg-primary/5' : 
                                  'hover:bg-muted/50'} 
                                ${!item.available ? 'opacity-60' : ''}
                              `}
                              onClick={() => handleEditItem(item)}
                            >
                              <div 
                                className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden mr-4"
                                style={{ backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${item.image})` }}
                              >
                                {!item.image && <ImageIcon className="w-full h-full p-4 text-muted-foreground" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{item.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {item.description.substring(0, 60)}{item.description.length > 60 ? '...' : ''}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-sm font-medium">S${item.price.toFixed(2)}</span>
                                  <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {item.available ? 'Available' : 'Unavailable'}
                                  </span>
                                </div>
                              </div>
                              
                              <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>
        
        {/* Edit Form */}
        <div>
          <AnimatedTransition delay={0.1}>
            {editingItem ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {originalItem ? `Edit ${originalItem.name}` : 'Add New Menu Item'}
                  </CardTitle>
                  <CardDescription>
                    Fill in the details for your menu item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editingItem.name}
                      onChange={handleInputChange}
                      placeholder="Chicken Rice"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={editingItem.description}
                      onChange={handleInputChange}
                      placeholder="Delicious chicken rice with fragrant rice and fresh chicken..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (S$)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.1"
                          min="0"
                          value={editingItem.price}
                          onChange={handleInputChange}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <select
                          id="category"
                          name="category"
                          value={editingItem.category}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <option value="Main Dishes">Main Dishes</option>
                          <option value="Side Dishes">Side Dishes</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Desserts">Desserts</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Item Image</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-24 h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden"
                      >
                        {editingItem.image ? (
                          <img 
                            src={editingItem.image} 
                            alt={editingItem.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a clear image of your menu item (max 2MB)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="available"
                      name="available"
                      checked={editingItem.available}
                      onChange={() => setEditingItem({...editingItem, available: !editingItem.available})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="available" className="cursor-pointer">
                      This item is currently available for ordering
                    </Label>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      
                      {originalItem && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleDeleteItem(editingItem.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                    
                    <Button
                      type="button"
                      onClick={handleSaveItem}
                      disabled={isSubmitting || !canSave}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className={`${isSubmitting ? '' : 'mr-2'} h-4 w-4`} />
                      Save Changes
                    </Button>
                  </div>
                  
                  {!canSave && !isSubmitting && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Make changes to save this item
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="rounded-full bg-muted/50 p-4 mb-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Item Selected</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Select an item from the list to edit or add a new item to your menu.
                  </p>
                  <Button
                    onClick={handleAddNewItem}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Item
                  </Button>
                </CardContent>
              </Card>
            )}
          </AnimatedTransition>
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;
