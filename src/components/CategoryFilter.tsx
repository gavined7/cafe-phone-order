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
  return <div className="border border-coffee-light/20 rounded-lg py-[8px] px-[14px]">
      <h3 className="text-lg font-semibold text-coffee-dark mb-4">Categories</h3>
      
      <div className="w-full overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden scrollbar-hide">
        <div className="flex space-x-2 p-2">
          <Button variant={selectedCategory === null ? "coffee" : "cream"} size="sm" onClick={() => onCategorySelect(null)} className="flex-shrink-0 rounded-full">
            Most Popular
          </Button>
          
          {categories.map(category => <Button key={category.id} variant={selectedCategory === category.id ? "coffee" : "cream"} size="sm" onClick={() => onCategorySelect(category.id)} className="flex-shrink-0 rounded-full">
              {category.name}
            </Button>)}
        </div>
      </div>
    </div>;
};
