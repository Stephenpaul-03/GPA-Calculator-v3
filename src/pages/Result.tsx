"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type ResultRow = {
  index: number;
  semester: string;
  subjectCode: string;
  name: string;
  credits: number;
  grade: string;
  score: number;
};

export type GPAResults = {
  rows: ResultRow[];
  totalCredits: number;
  totalScore: number;
  gpa: string;
};

interface ResultProps {
  results: GPAResults;
}

const Result: React.FC<ResultProps> = ({ results }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<ResultRow>[] = [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.original.index,
    },
    {
      accessorKey: "semester",
      header: "Semester",
      cell: ({ row }) => row.original.semester || "-",
    },
    {
      accessorKey: "subjectCode",
      header: "Subject Code",
      cell: ({ row }) => row.original.subjectCode || "-",
    },
    {
      accessorKey: "name",
      header: "Subject",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "credits",
      header: "Credits",
      cell: ({ row }) => row.original.credits,
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => row.original.grade || "-",
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => row.original.score.toFixed(2),
    },
  ];

  const table = useReactTable({
    data: results.rows,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const disabledColumns = ["credits", "grade", "score"];

  return (
    <div className="flex flex-1 flex-row mb-2">
      <Card className="w-full mx-auto px-4 min-h-[430px] max-h-[430px] min-w-4xl sm:min-w-2xl overflow-hidden mr-2">
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <div className="font-mono font-bold text-xl text-blue-500 dark:text-yellow-500">
              RESULT
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:text-blue-500 hover:dark:text-yellow-500"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className="p-3 w-fit flex flex-col gap-2"
              >
                {table
                  .getAllLeafColumns()
                  .filter((col) => col.getCanHide())
                  .map((column) => {
                    const isDisabled = disabledColumns.includes(column.id);
                    return (
                      <div
                        key={column.id}
                        className={`flex items-center gap-2 p-1 rounded hover:bg-accent ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Checkbox
                          id={column.id}
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            !isDisabled && column.toggleVisibility(!!value)
                          }
                          disabled={isDisabled}
                        />
                        <Label htmlFor={column.id} className="capitalize text-sm">
                          {column.id}
                        </Label>
                      </div>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-auto min-h-[325px] max-h-[325px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-1 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-bold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full mx-auto p-4 flex justify-between text-sm sm:text-base sm:min-w-1xl">
        <div>Total Credits: {results.totalCredits}</div>
        <div>Total Score: {results.totalScore.toFixed(2)}</div>
        <div className="font-semibold">GPA: {results.gpa}</div>
      </Card>
    </div>
  );
};

export default Result;
