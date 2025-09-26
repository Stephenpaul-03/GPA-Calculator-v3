"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipeable } from "react-swipeable";

export interface Subject {
  number: number;
  code: string;
  semester: string;
  name: string;
  credits: string;
  grade: string;
}

interface SubjectRowProps {
  index: number;
  subject: Subject;
  updateSubject: (index: number, field: keyof Subject, value: string) => void;
  deleteSubject: (index: number) => void;
}

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
const grades = ["O", "A+", "A", "B+", "B", "C+", "C"];
const SWIPE_THRESHOLD = 100;

const SubjectRow: React.FC<SubjectRowProps> = ({
  index,
  subject,
  updateSubject,
  deleteSubject,
}) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [skipConfirmCount, setSkipConfirmCount] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  // detect if mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
    checkMobile();
  }, []);

  // long press delete (mobile)
  const handleHoldStart = () => {
    if (!isMobile) return;
    holdTimer.current = setTimeout(() => {
      setDeleteMode(true);
      // auto reset after 3s if no click
      setTimeout(() => setDeleteMode(false), 3000);
    }, 600);
  };

  const handleHoldEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleDeleteClick = () => {
    if (skipConfirmCount > 0) {
      deleteSubject(index);
      setSkipConfirmCount((c) => c - 1);
      setDeleteMode(false);
    } else {
      setOpenDelete(true);
    }
  };

  // swipe-to-delete (desktop only)
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!isMobile) setSwipeOffset(e.deltaX);
    },
    onSwiped: (e) => {
      if (!isMobile && Math.abs(e.deltaX) > SWIPE_THRESHOLD) {
        setOpenDelete(true);
      }
      setSwipeOffset(0);
    },
    trackMouse: true,
  });

  const interactiveStyle = cn(
    "outline-none relative border border-input rounded-md",
    "transition-colors duration-800 ease-in",
    "hover:border-blue-500 dark:hover:border-yellow-500",
    "focus:border-blue-500 dark:focus:border-yellow-500",
    "focus:ring-1 focus:ring-blue-500 dark:focus:ring-yellow-500",
    "focus:ring-offset-0",
    "focus-visible:border-blue-500 dark:focus-visible:border-yellow-500",
    "focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-yellow-500",
    "focus-visible:ring-offset-0"
  );

  return (
    <>
      <div
        {...(!isMobile ? handlers : {})} // swipe only on desktop
        className={cn(
          "subject-row interactive-top-bottom grid items-center p-1 select-none gap-3",
          "grid-cols-[40px_60px_minmax(120px,1fr)_minmax(120px,2fr)_minmax(64px,96px)_minmax(98px,98px)]",
          "sm:grid-cols-[40px_80px_minmax(140px,1fr)_minmax(160px,2fr)_minmax(72px,100px)_minmax(100px,100px)]"
        )}
        style={{
          transform: !isMobile ? `translateX(${swipeOffset}px)` : undefined,
          transition: swipeOffset === 0 ? "transform 0.2s ease-out" : "none",
        }}
      >
        {/* 1. Index (hold to delete on mobile) */}
        <div
          className={cn(
            "flex items-center justify-center h-10 w-10 rounded-md text-sm cursor-pointer select-none border-1",
            deleteMode
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "text-muted-foreground"
          )}
          // desktop uses click, mobile uses hold
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          onClick={() => {
            if (deleteMode) handleDeleteClick();
          }}
        >
          {deleteMode ? <Trash2 className="h-4 w-4" /> : index + 1}
        </div>

        {/* 2. Semester */}
        <Select
          value={subject.semester}
          onValueChange={(val) => updateSubject(index, "semester", val)}
        >
          <SelectTrigger className={cn("w-full h-10", interactiveStyle)}>
            <SelectValue placeholder="Sem" />
          </SelectTrigger>
          <SelectContent className="p-0">
            {semesters.map((sem) => (
              <SelectItem key={sem} value={sem}>
                {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 3. Subject Code */}
        <Input
          value={subject.code}
          onChange={(e) => updateSubject(index, "code", e.target.value)}
          placeholder="Subject Code"
          className={cn("w-full h-10", interactiveStyle)}
        />

        {/* 4. Subject Name */}
        <Input
          value={subject.name}
          onChange={(e) => updateSubject(index, "name", e.target.value)}
          placeholder="Subject Name"
          className={cn("w-full h-10", interactiveStyle)}
        />

        {/* 5. Credits */}
        <Input
          type="number"
          value={subject.credits}
          onChange={(e) => updateSubject(index, "credits", e.target.value)}
          placeholder="Credits"
          min={0}
          max={6}
          className={cn(
            "min-w-[64px] h-10 text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
            interactiveStyle
          )}
        />

        {/* 6. Grade */}
        <Select
          value={subject.grade}
          onValueChange={(val) => updateSubject(index, "grade", val)}
        >
          <SelectTrigger
            className={cn("min-w-[90px] h-10 text-center", interactiveStyle)}
          >
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Do you really want to delete this
              row?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center gap-2 py-2">
            <Switch
              checked={dontAskAgain}
              onCheckedChange={(val) => setDontAskAgain(val)}
            />
            <span className="text-sm text-muted-foreground">
              Don’t ask again for next 5 deletions
            </span>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteMode(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteSubject(index);
                setDeleteMode(false);
                if (dontAskAgain) {
                  setSkipConfirmCount(5);
                  setDontAskAgain(false);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubjectRow;
