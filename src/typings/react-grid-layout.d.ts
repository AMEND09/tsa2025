declare module 'react-grid-layout' {
  import * as React from 'react';
  
  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    moved?: boolean;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
  }
  
  export interface Layouts {
    [breakpoint: string]: Layout[];
  }
  
  export interface ReactGridLayoutProps {
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    autoSize?: boolean;
    cols?: number;
    draggableCancel?: string;
    draggableHandle?: string;
    verticalCompact?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
    layout?: Layout[];
    margin?: [number, number];
    containerPadding?: [number, number];
    rowHeight?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    preventCollision?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    children?: React.ReactNode;
    onLayoutChange?: (layout: Layout[]) => void;
    onDragStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onDrag?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onDragStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResizeStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResize?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResizeStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
  }
  
  export default class GridLayout extends React.Component<ReactGridLayoutProps> {}
  
  export interface ResponsiveProps extends ReactGridLayoutProps {
    breakpoints?: {[breakpoint: string]: number};
    breakpoint?: string;
    cols?: {[breakpoint: string]: number};
    layouts?: Layouts;
    width?: number;
    margin?: [number, number] | {[breakpoint: string]: [number, number]};
    containerPadding?: [number, number] | {[breakpoint: string]: [number, number]};
    onBreakpointChange?: (breakpoint: string, cols: number) => void;
    onLayoutChange?: (layout: Layout[], layouts: Layouts) => void;
    onWidthChange?: (width: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void;
  }
  
  export class Responsive extends React.Component<ResponsiveProps> {}
  
  export function WidthProvider<P>(ComposedComponent: React.ComponentType<P>): React.ComponentType<P>;
}
