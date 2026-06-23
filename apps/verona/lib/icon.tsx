import {
  Home, Image, Star, IdCard, CheckSquare, Bookmark, AlertCircle, Box, Table, List,
  Share2, Tablet, Copy, Menu as Bars, MessageSquare, File, BarChart3, CircleOff,
  LayoutGrid, Calendar, MessagesSquare, Folder, Inbox, Pencil, Gem, Eye, Globe,
  Compass, Palette, Monitor, Briefcase, User, LogIn, XCircle, Lock, UserPlus,
  HelpCircle, Phone, DollarSign, History, Plus, ShoppingCart, AlignLeft, Download,
  Info, Wallet, AlignJustify, Search, Cog, Power, ChevronDown, Check, Minus,
  CircleDot, Circle, type LucideIcon
} from 'lucide-react';

// lucide no exporta algunos nombres pi 1:1; mapear a los equivalentes reales.
const MAP: Record<string, LucideIcon> = {
  'home': Home, 'image': Image, 'star': Star, 'id-card': IdCard, 'check-square': CheckSquare,
  'bookmark': Bookmark, 'exclamation-circle': AlertCircle, 'box': Box, 'table': Table,
  'list': List, 'share-alt': Share2, 'tablet': Tablet, 'clone': Copy, 'bars': Bars,
  'comment': MessageSquare, 'comments': MessagesSquare, 'file': File, 'chart-bar': BarChart3,
  'circle-off': CircleOff, 'th-large': LayoutGrid, 'calendar': Calendar, 'folder': Folder,
  'inbox': Inbox, 'pencil': Pencil, 'prime': Gem, 'eye': Eye, 'eye-slash': Eye, 'globe': Globe,
  'compass': Compass, 'palette': Palette, 'desktop': Monitor, 'briefcase': Briefcase,
  'user': User, 'user-plus': UserPlus, 'sign-in': LogIn, 'times-circle': XCircle, 'lock': Lock,
  'question': HelpCircle, 'question-circle': HelpCircle, 'cog': Cog, 'envelope': MessageSquare,
  'phone': Phone, 'dollar': DollarSign, 'history': History, 'plus': Plus, 'shopping-cart': ShoppingCart,
  'align-left': AlignLeft, 'download': Download, 'info-circle': Info, 'wallet': Wallet,
  'align-justify': AlignJustify, 'search': Search, 'power-off': Power, 'angle-down': ChevronDown,
  'check': Check, 'minus': Minus, 'circle-fill': CircleDot
};

function tokenFrom(name: string): string | null {
  const parts = name.split(/\s+/).filter(Boolean);
  for (const p of parts) {
    if (p === 'pi' || p === 'pi-fw') continue;
    if (p.startsWith('pi-')) return p.slice(3);
  }
  return null;
}

export function Icon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const token = tokenFrom(name);
  const Cmp = (token && MAP[token]) || Circle;
  return <Cmp className={className} size={16} aria-hidden />;
}
