import { Home, House, Building2, Building, LandPlot, Store, Briefcase, type LucideIcon } from 'lucide-react';

// Icon names come from property_categories.icon. Only these are bundled; any
// other name falls back to Home (importing every icon would bloat the bundle).
const ICONS: Record<string, LucideIcon> = {
  House,
  Building2,
  Building,
  LandPlot,
  Store,
  Briefcase,
  Home,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

const CategoryIcon = ({ name, className }: CategoryIconProps) => {
  const Icon = ICONS[name] ?? Home;
  return <Icon className={className} aria-hidden="true" />;
};

export default CategoryIcon;
