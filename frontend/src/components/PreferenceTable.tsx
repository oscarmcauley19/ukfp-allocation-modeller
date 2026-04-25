import { CSSProperties, useMemo } from "react";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// other imports
import chroma from "chroma-js";
import { DeaneryModel } from "../models/deanery";
import { Button, Tooltip, Typography } from "@mui/material";

const scale = chroma.scale(["green", "orange", "red"]).domain([0, 2]);

// Cell Component
const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <Button {...attributes} {...listeners} size="small">
      🟰
    </Button>
  );
};

// Row Component
const DraggableRow = ({ row }: { row: Row<DeaneryModel> }) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.deaneryId.toString(),
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };
  return (
    // connect row ref to dnd-kit, apply important styles
    <tr ref={setNodeRef} style={style}>
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export const DnDTable = ({
  data,
  setData,
}: {
  data: DeaneryModel[];
  setData: (newRanking: DeaneryModel[]) => void;
}) => {
  const columns = useMemo<ColumnDef<DeaneryModel>[]>(
    () => [
      // Create a dedicated drag handle column. Alternatively, you could just set up dnd events on the rows themselves.
      {
        id: "drag-handle",
        header: "Move",
        cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
        size: 60,
      },
      {
        accessorKey: "deaneryName",
        header: "Name",
      },
      {
        accessorKey: "places",
        header: "Places",
      },
      {
        accessorKey: "applicants",
        header: "Applicants",
      },
      {
        accessorKey: "ratio",
        header: "Ratio",
        cell: ({ row, getValue }) => (
          <Tooltip
            title={`For every place available in ${row.original.deaneryName}, ${getValue()} people put it as their first choice.`}
          >
            <Typography color={scale(getValue()).toString()}>
              {getValue()}
            </Typography>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ deaneryId }) => deaneryId.toString()),
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.deaneryId.toString(), //required because row indexes will change
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    console.log("Drag Ended", active, over);
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);
      const updated = arrayMove(data, oldIndex, newIndex); //this is just a splice util
      console.log("Reordering from", oldIndex, "to", newIndex);
      setData(updated);
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  return (
    // NOTE: This provider creates div elements, so don't nest inside of <table> elements
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          <SortableContext
            items={dataIds}
            strategy={verticalListSortingStrategy}
          >
            {table.getRowModel().rows.map((row) => (
              <DraggableRow key={row.id} row={row} />
            ))}
          </SortableContext>
        </tbody>
      </table>
    </DndContext>
  );
};
