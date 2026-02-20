export interface MenuItem {
  label: string;
  url?: string;
  icon?: string;
  isVisible?: boolean;
  children?: MenuItem[];
  
  // Internal state
  isExpanded?: boolean;
  isSelected?: boolean;
}
