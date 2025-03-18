
import React, { useState } from 'react';
import { Edit, Trash, ImageOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MenuItem } from '@/hooks/useOrders';
import AnimatedTransition from './AnimatedTransition';

interface MenuItemCardProps {
  item: MenuItem;
  editable?: boolean;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onToggleAvailability?: (id: string, available: boolean) => void;
  onClick?: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  editable = false,
  onEdit,
  onDelete,
  onToggleAvailability,
  onClick,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick && !editable) {
      onClick(item);
    }
  };

  return (
    <AnimatedTransition animation="slide" className="h-full">
      <Card 
        className={`h-full overflow-hidden transition-all duration-300 ${
          !item.available ? 'opacity-70' : ''
        } ${onClick && !editable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
        onClick={handleClick}
      >
        <div className="relative w-full h-48 overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse w-10 h-10 rounded-full bg-gray-200"></div>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <ImageOff className="h-10 w-10 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">Image not available</span>
            </div>
          ) : (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}

          {item.category && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm shadow-sm">
                {item.category}
              </Badge>
            </div>
          )}

          {editable && (
            <div className="absolute top-2 right-2 flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(item);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(item.id);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-base line-clamp-1">{item.name}</h3>
            <span className="font-semibold text-sm">S${item.price.toFixed(2)}</span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
          
          {editable && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
              <span className="text-sm">Available</span>
              <Switch 
                checked={item.available}
                onCheckedChange={(checked) => {
                  onToggleAvailability && onToggleAvailability(item.id, checked);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
};

export default MenuItemCard;
