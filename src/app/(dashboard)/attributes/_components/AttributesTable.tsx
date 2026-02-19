"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type AttributeItem = {
  id: number;
  name: string;
  color: string | null;
  order?: number;
};

type AttributesTableProps = {
  items: AttributeItem[];
  onEdit?: (item: AttributeItem) => void;
  onDelete?: (id: number) => Promise<void>;
  onReorder?: (items: AttributeItem[]) => Promise<void>;
  showOrder?: boolean;
};

function SortableRow({ item, showOrder, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b hover:bg-custom-background/50 transition-colors"
    >
      <td className="p-3">
        <div className="flex items-center gap-2">
          {showOrder && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <DragIndicatorIcon className="h-5 w-5 text-custom-secondary-text" />
            </div>
          )}
          <div
            className="w-3 h-3 rounded-full border-2"
            style={{ backgroundColor: item.color || "#gray" }}
          />
        </div>
      </td>
      <td className="p-3">
        <span className="font-medium text-custom-primary-text">
          {item.name}
        </span>
      </td>
      <td className="p-3">
        <span className="text-sm text-custom-secondary-text font-mono">
          {item.color}
        </span>
      </td>
      {showOrder && (
        <td className="p-3">
          <span className="text-sm text-custom-secondary-text">
            {item.order}
          </span>
        </td>
      )}
      {(onEdit || onDelete) && (
        <td className="p-3">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
                className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
              >
                <DeleteIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

export function AttributesTable({
  items,
  onEdit,
  onDelete,
  onReorder,
  showOrder = false,
}: AttributesTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          order: index,
        }),
      );

      if (onReorder) {
        onReorder(newItems);
      }
    }
  };

  return (
    <div className="mt-6 w-full max-w-4xl mx-auto">
      <div className="border rounded-lg overflow-hidden bg-custom-foreground">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-custom-background">
              <th className="text-left p-3 text-sm font-medium text-custom-secondary-text w-16"></th>
              <th className="text-left p-3 text-sm font-medium text-custom-secondary-text">
                Name
              </th>
              <th className="text-left p-3 text-sm font-medium text-custom-secondary-text w-32">
                Color
              </th>
              {showOrder && (
                <th className="text-left p-3 text-sm font-medium text-custom-secondary-text w-24">
                  Order
                </th>
              )}
              {(onEdit || onDelete) && (
                <th className="text-left p-3 text-sm font-medium text-custom-secondary-text w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {showOrder && onReorder ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      showOrder={showOrder}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-custom-background/50 transition-colors"
                >
                  <td className="p-3">
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{ backgroundColor: item.color || "#gray" }}
                    />
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-custom-primary-text">
                      {item.name}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs  text-custom-primary-text bg-custom-foreground  border p-1 rounded-full font-mono">
                      {item.color}
                    </span>
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="p-3">
                      <div className="flex gap-4">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-4 w-4  hover:text-blue-600"
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item.id)}
                            className="h-4 w-4  hover:text-red-600"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="py-12 text-center text-custom-secondary-text">
            No items yet. Click Create to get started!
          </div>
        )}
      </div>
    </div>
  );
}
