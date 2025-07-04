import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
interface Category {
  id: string;
  name: string;
  description: string;
}
interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}
export const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategorySelect
}: CategoryFilterProps) => {
  return <div className="bg-card border border-coffee-light/20 rounded-lg p-4 shadow-warm">
      <h3 className="text-lg font-semibold text-coffee-dark mb-4">Categories</h3>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-2">
          <Button variant={selectedCategory === null ? "coffee" : "cream"} size="sm" onClick={() => onCategorySelect(null)} className="flex-shrink-0 rounded-full">
            All Items
          </Button>
          
          {categories.map(category => <Button key={category.id} variant={selectedCategory === category.id ? "coffee" : "cream"} size="sm" onClick={() => onCategorySelect(category.id)} className="flex-shrink-0">
              {category.name}
            </Button>)}
        </div>
      </ScrollArea>
    </div>;
};