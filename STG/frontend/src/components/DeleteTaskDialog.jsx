import { useState } from "react";
import API from "../api/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DeleteTaskDialog({ open, onOpenChange, task, onTaskDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!task) return;
    
    setIsDeleting(true);
    setError("");

    try {
      await API.delete(`/tasks/${task.id}`);
      onTaskDeleted(task.id);
    } catch (error) {
      console.error("Error deleting task:", error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to delete task. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setError("");
    }
    onOpenChange(isOpen);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Task
          </DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}


        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="capitalize">{task.status.replace('_', ' ')}</span>
            {task.due_date && (
              <>
                <span>•</span>
                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}