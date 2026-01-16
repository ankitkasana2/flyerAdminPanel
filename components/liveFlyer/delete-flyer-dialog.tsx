// "use client";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Trash2 } from "lucide-react";

// interface DeleteFlyerDialogProps {
//   isOpen: boolean;
//   flyerTitle: string;
//   onConfirm: () => void;
//   onCancel: () => void;
// }

// export function DeleteFlyerDialog({
//   isOpen,
//   flyerTitle,
//   onConfirm,
//   onCancel,
// }: DeleteFlyerDialogProps) {
//   return (
//     <AlertDialog open={isOpen} onOpenChange={onCancel}>
//       <AlertDialogContent className="bg-gradient-to-b from-card to-card/95 border border-border/40 backdrop-blur-sm">
//         <AlertDialogHeader className="border-b border-border/40 pb-4">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-red-600/20 rounded-lg">
//               <Trash2 className="h-5 w-5 text-red-600" />
//             </div>
//             <AlertDialogTitle className="text-xl font-bold text-foreground">
//               Delete Flyer
//             </AlertDialogTitle>
//           </div>
//           <AlertDialogDescription className="text-muted-foreground mt-3 text-base">
//             Are you sure you want to delete{" "}
//             <span className="font-semibold text-primary">{flyerTitle}</span>?
//             This action cannot be undone.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <div className="flex gap-3 justify-end pt-4">
//           <AlertDialogCancel className="border-border/40 text-muted-foreground hover:text-foreground">
//             Cancel
//           </AlertDialogCancel>
//           <AlertDialogAction
//             className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg"
//             onClick={onConfirm}
//           >
//             Delete
//           </AlertDialogAction>
//         </div>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }




"use client";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteFlyerDialogProps {
  isOpen: boolean;
  flyerTitle: string;
  /**
   * onConfirm may be sync or async. If async, return a truthy value
   * (or nothing) on success. Throw or return an object with { error }
   * on failure. The dialog will display the error and stay open.
   */
  onConfirm: () => void | Promise<void | { error?: string }>;
  onCancel: () => void;
}

export function DeleteFlyerDialog({
  isOpen,
  flyerTitle,
  onConfirm,
  onCancel,
}: DeleteFlyerDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state whenever dialog is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setDeleting(false);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setError(null);
    setDeleting(true);

    try {
      const result = await onConfirm();

      // parent may return an error object instead of throwing
      if (result && typeof result === "object" && "error" in result && result.error) {
        throw new Error(result.error);
      }

      // close dialog after successful delete
      onCancel();
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError(err?.message || "Failed to delete. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="bg-gradient-to-b from-card to-card/95 border border-border/40 backdrop-blur-sm">
        <AlertDialogHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 bg-red-600/20 rounded-lg flex items-center justify-center"
              aria-hidden
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Delete Flyer
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-muted-foreground mt-3 text-base">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-primary">{flyerTitle}</span>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel
            className="border-border/40 text-muted-foreground hover:text-foreground"
            disabled={deleting}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg disabled:opacity-60"
            aria-disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

