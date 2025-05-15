import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical } from 'lucide-react';

export interface Widget {
  i: string;
  title: string; // Keep for identification in hidden widgets list
  isVisible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  content?: React.ReactNode;
}

interface DraggableWidgetLayoutProps {
  widgets: Widget[];
  onWidgetVisibilityChange: (widgetId: string, isVisible: boolean) => void;
  onLayoutChange: (layout: any) => void;
  isEditMode: boolean;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const DraggableWidgetLayout: React.FC<DraggableWidgetLayoutProps> = ({ 
  widgets, 
  onWidgetVisibilityChange,
  onLayoutChange,
  isEditMode
}) => {
  const [mounted, setMounted] = useState(false);

  // This ensures the grid doesn't render until the component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const generateLayout = () => {
    return widgets.filter(widget => widget.isVisible).map(widget => ({
      i: widget.i,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: widget.minW || 1,
      minH: widget.minH || 1,
      isDraggable: isEditMode,
      isResizable: isEditMode,
    }));
  };

  const handleLayoutChange = (currentLayout: any) => {
    if (isEditMode) {
      onLayoutChange(currentLayout);
    }
  };

  const handleHideWidget = (e: React.MouseEvent, widgetId: string) => {
    e.stopPropagation();
    e.preventDefault();
    onWidgetVisibilityChange(widgetId, false);
  };

  const visibleWidgets = widgets.filter(widget => widget.isVisible);
  const hiddenWidgets = widgets.filter(widget => !widget.isVisible);

  if (!mounted) return null;

  return (
    <div className="mb-4">
      {isEditMode && hiddenWidgets.length > 0 && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Hidden Widgets</h3>
          <div className="flex flex-wrap gap-2">
            {hiddenWidgets.map(widget => (
              <Button
                key={widget.i}
                variant="outline"
                size="sm"
                onClick={() => onWidgetVisibilityChange(widget.i, true)}
                className="flex items-center gap-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>{widget.title}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: generateLayout() }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={90}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        draggableHandle={isEditMode ? ".drag-handle" : undefined}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        preventCollision={false}
        autoSize={true}
      >
        {visibleWidgets.map(widget => (
          <div key={widget.i} className="bg-white rounded-lg border shadow overflow-hidden">
            {/* Only show controls in edit mode */}
            {isEditMode && (
              <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                <div className="drag-handle cursor-move p-1">
                  <GripVertical className="h-4 w-4 text-gray-500" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => handleHideWidget(e, widget.i)}
                  className="h-7 w-7 p-0"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className={`p-4 overflow-auto ${isEditMode ? 'h-[calc(100%-40px)]' : 'h-full'}`}>
              {widget.content}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DraggableWidgetLayout;
