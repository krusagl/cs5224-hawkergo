
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Search, AlertCircle, ArrowLeft, Trash } from 'lucide-react';
import { MenuItem } from '@/hooks/useOrders';
import MenuItemCard from '@/components/ui/MenuItemCard';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

const categories = [
  { value: 'mains', label: 'Main Dishes' },
  { value: 'sides', label: 'Side Dishes' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'specials', label: 'Specials' },
];

const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Rice',
    description: 'Tender poached chicken served with fragrant rice, cucumber slices, and a side of chili sauce.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'mains',
    available: true,
  },
  {
    id: '2',
    name: 'Hokkien Mee',
    description: 'Stir-fried noodles with prawns, squid, pork belly, and bean sprouts in a rich seafood broth.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'mains',
    available: true,
  },
  {
    id: '3',
    name: 'Iced Teh Tarik',
    description: 'Sweet milk tea served over ice, pulled to create a frothy top.',
    price: 2.0,
    image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'drinks',
    available: true,
  },
];

const MenuEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    available: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [itemImage, setItemImage] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    } else {
      // In a real app, fetch menu items from API
      // For now, use mock data
      setTimeout(() => {
        setMenuItems(initialMenuItems);
        setLoading(false);
      }, 1000);
    }
  }, [authLoading, user, navigate]);

  const resetForm = () => {
    setItemForm({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      available: true,
    });
    setCurrentItem(null);
    setImagePreview(null);
    setItemImage(null);
  };

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      available: item.available,
    });
    setImagePreview(item.image);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    // In a real app, call API to delete item
    setMenuItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Deleted',
      description: 'Menu item has been deleted.',
    });
  };

  const handleToggleAvailability = (id: string, available: boolean) => {
    // In a real app, call API to update availability
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, available } : item
      )
    );
    toast({
      title: available ? 'Item Available' : 'Item Unavailable',
      description: `Menu item is now ${available ? 'available' : 'unavailable'} for ordering.`,
    });
  };

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.description || !itemForm.category || itemForm.price <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, upload image to storage and get URL
    // For now, we'll use the preview or existing image
    const imageUrl = imagePreview || 'https://via.placeholder.com/500?text=Food+Image';

    if (currentItem) {
      // Update existing item
      setMenuItems(prev => 
        prev.map(item => 
          item.id === currentItem.id 
            ? { 
                ...item, 
                ...itemForm,
                image: imageUrl,
              } 
            : item
        )
      );
      toast({
        title: 'Updated',
        description: 'Menu item has been updated.',
      });
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: itemForm.name!,
        description: itemForm.description!,
        price: itemForm.price!,
        image: imageUrl,
        category: itemForm.category!,
        available: itemForm.available ?? true,
      };
      setMenuItems(prev => [newItem, ...prev]);
      toast({
        title: 'Added',
        description: 'New menu item has been added.',
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setItemImage(file);

    // For preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      const numericValue = parseFloat(value);
      setItemForm(prev => ({ ...prev, [name]: isNaN(numericValue) ? 0 : numericValue }));
    } else {
      setItemForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setItemForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setItemForm(prev => ({ ...prev, [name]: checked }));
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <AnimatedTransition>
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/hawker/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Editor</h1>
            <p className="text-muted-foreground">Manage your stall's menu items</p>
          </div>
        </div>
      </AnimatedTransition>

      <div className="grid gap-6">
        <AnimatedTransition>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{currentItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                      <DialogDescription>
                        {currentItem 
                          ? 'Update the details of your menu item.' 
                          : 'Add a new item to your menu. All fields are required except where noted.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Item Name*</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="e.g., Chicken Rice"
                            value={itemForm.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (S$)*</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.00"
                            value={itemForm.price}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description*</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe your dish..."
                          rows={3}
                          value={itemForm.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category*</Label>
                        <Select
                          value={itemForm.category}
                          onValueChange={(value) => handleSelectChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">Item Image</Label>
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">No image</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload a clear image of your dish for the best presentation
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="available"
                          checked={itemForm.available}
                          onCheckedChange={(checked) => handleSwitchChange('available', checked)}
                        />
                        <Label htmlFor="available">Available for ordering</Label>
                      </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                      {currentItem && (
                        <Button
                          variant="destructive"
                          type="button"
                          onClick={() => {
                            setIsDialogOpen(false);
                            if (currentItem) {
                              handleDeleteItem(currentItem.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Item
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveItem}>
                          {currentItem ? 'Update Item' : 'Add Item'}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </AnimatedTransition>

        <AnimatedTransition>
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              {filteredItems.length === 0 ? (
                <Alert className="bg-muted">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {searchQuery
                      ? `No menu items found matching "${searchQuery}"`
                      : `No menu items in the "${
                          categories.find((c) => c.value === activeCategory)?.label || 'All Items'
                        }" category`}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      editable={true}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      onToggleAvailability={handleToggleAvailability}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </AnimatedTransition>
      </div>
    </div>
  );
};

export default MenuEditor;
