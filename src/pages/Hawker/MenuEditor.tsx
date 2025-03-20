import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, 
  DollarSign, Loader2, AlertCircle, Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { Switch } from '@/components/ui/switch';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Fishball Noodles',
    description: 'Delicious noodles served with handmade fishballs in a savory broth.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1573570095791-df66f86d5b58?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    available: true
  },
  {
    id: '2',
    name: 'Bak Chor Mee',
    description: 'Minced pork noodles with black vinegar, chili, and various toppings.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    available: true
  },
  {
    id: '3',
    name: 'Fishball Soup',
    description: 'A light and tasty soup with handmade fishballs.',
    price: 4,
    image: 'https://images.unsplash.com/photo-1618866734754-033010aa4de0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    available: true
  },
  {
    id: '4',
    name: 'Laksa',
    description: 'Spicy noodle soup with coconut milk, prawns, and fish cake.',
    price: 6,
    image: 'https://images.unsplash.com/photo-1583947582893-604451e5e3d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
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
  const [showPreview, setShowPreview] = useState(false);
  
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    
    if (editingItem && editingItem.id === id) {
      setEditingItem(prev => {
        if (!prev) return prev;
        return { ...prev, available: !prev.available };
      });
      setHasChanges(true);
    }
    
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

  if (showPreview) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Preview</h1>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
        </div>
        
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="h-48 bg-muted relative">
              <img 
                src="https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Chinese Noodle Stall" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h2 className="text-2xl font-bold">{user.stallName}</h2>
                  <p className="text-sm opacity-90">{user.stallAddress}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-muted-foreground">{user.stallDescription}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Menu Items</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {menuItems.filter(item => item.available).map(item => (
              <Card key={item.id} className="overflow-hidden">
                {item.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <span className="font-bold">S${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  <div className="mt-4 flex items-center">
                    <Button variant="outline" size="sm" className="w-full">
                      + Add to cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
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
                <div className="space-y-4">
                  {menuItems.map(item => (
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
                            {item.available ? 'Available' : 'Currently not available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>
        
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
                      placeholder="Fishball Noodles"
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
                      placeholder="Delicious noodles with handmade fishballs..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                  
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
                        inputMode="decimal"
                      />
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
                    <Switch
                      id="available"
                      checked={editingItem.available}
                      onCheckedChange={(checked) => setEditingItem({...editingItem, available: checked})}
                    />
                    <Label htmlFor="available" className="cursor-pointer">
                      {editingItem.available ? 'Available' : 'Currently not available'}
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
