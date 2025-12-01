import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "../components/ui/use-toast";
import { FileHistoryItem, User } from "../types";
// ⚠️ CHECK THIS PATH: Verify where you initialized 'supabase' client
import { supabase } from "../../supabase/supabase"; 

export const useFileHistory = (user: User | null) => {
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  const [showFileHistory, setShowFileHistory] = useState(false);
  const [selectedHistoryFile, setSelectedHistoryFile] =
    useState<FileHistoryItem | null>(null);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  
  // Ref to track updates that happen while a file is still uploading/saving
  const pendingUpdatesRef = useRef<Record<string, Partial<FileHistoryItem>>>({});
  
  const { toast } = useToast();

  // 1. Load History
  const loadFileHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("file_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("DEBUG: Supabase Load Error:", error);
        if (error.code === '42501') {
            console.error("RLS POLICY ERROR: You do not have permission to select rows. Run the SQL migration provided.");
        }
        // Don't throw, just log, so app doesn't crash
        return; 
      }

      if (data) {
        setFileHistory(data);
      }
    } catch (error) {
      console.error("DEBUG: Unexpected error loading history:", error);
    }
  }, [user]);

  // 3. Update Existing File (Defined before addFileToHistory so it can be called)
  const updateFileHistory = useCallback(
    async (fileId: string, updates: Partial<FileHistoryItem>) => {
      if (!user) {
        console.warn("DEBUG: Cannot update history - User is not logged in.");
        return;
      }

      console.log(`DEBUG: Request to update file ${fileId}`, updates);

      // Optimistic UI Update (Always apply to local state immediately)
      setFileHistory((prev) =>
        prev.map((item) =>
          item.id === fileId 
            ? { ...item, ...updates, updated_at: new Date().toISOString() } 
            : item
        )
      );

      // Check if we are trying to update a temp ID (Race Condition Handler)
      if (fileId.startsWith("temp-")) {
        console.log(`DEBUG: Queuing update for temp ID ${fileId}`);
        // Store updates to be applied once the real ID is known
        pendingUpdatesRef.current[fileId] = {
            ...(pendingUpdatesRef.current[fileId] || {}),
            ...updates
        };
        return;
      }

      try {
        const { error } = await supabase
          .from("file_history")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", fileId);

        if (error) {
            console.error("DEBUG: DB Update Failed:", error);
            if (error.code === '42501') {
                toast({
                    title: "Permission Error",
                    description: "Database update failed. Check RLS policies.",
                    variant: "destructive",
                });
            } else if (error.code === '42703') {
                 toast({
                    title: "Database Error",
                    description: "Missing columns (summary/mind_map_code). Did you run the migration?",
                    variant: "destructive",
                });
            }
        } else {
            console.log("DEBUG: DB Update Successful");
        }
      } catch (error) {
        console.error("DEBUG: Network/Code error updating history:", error);
      }
    },
    [user, toast],
  );

  // 2. Add New File
  const addFileToHistory = useCallback(
    async (item: Omit<FileHistoryItem, "id" | "created_at" | "updated_at">) => {
      if (!user) {
        console.warn("DEBUG: Cannot save file - User is not logged in.");
        toast({
            title: "Not Logged In",
            description: "Please sign in to save your history.",
            variant: "destructive",
        });
        return;
      }

      // Optimistic Update (Temp ID)
      const tempId = "temp-" + Date.now();
      const optimisticItem: FileHistoryItem = {
        ...item,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setFileHistory((prev) => [optimisticItem, ...prev]);

      try {
        const { data, error } = await supabase
          .from("file_history")
          .insert([
            {
              ...item,
              user_id: user.id,
              summary: item.summary || null,
              mind_map_code: item.mind_map_code || null,
              audio_path: item.audio_path || null,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Swap Temp ID for Real UUID
        if (data) {
          console.log("DEBUG: File saved. Swapping temp ID", tempId, "for", data.id);
          
          // Check if there were any pending updates for this temp ID
          const queuedUpdates = pendingUpdatesRef.current[tempId];
          
          setFileHistory((prev) =>
            prev.map((f) => {
                if (f.id === tempId) {
                    // Merge DB data with any queued updates that happened during save
                    return { ...data, ...queuedUpdates };
                }
                return f;
            })
          );

          // If we had queued updates, apply them to the DB immediately
          if (queuedUpdates) {
              console.log("DEBUG: Applying queued updates to new record...");
              await updateFileHistory(data.id, queuedUpdates);
              // Clean up ref
              delete pendingUpdatesRef.current[tempId];
          }
        }
      } catch (error) {
        console.error("DEBUG: Save Error:", error);
        toast({
          title: "Save Failed",
          description: "Could not save to history. Check console.",
          variant: "destructive",
        });
        // Rollback on fatal error
        setFileHistory((prev) => prev.filter((f) => f.id !== tempId));
      }
    },
    [user, toast, updateFileHistory],
  );

  // 4. Delete File
  const deleteFileFromHistory = useCallback(
    async (fileId: string, fileName: string) => {
      if (!user) return;

      const previousHistory = [...fileHistory];
      setFileHistory((prev) => prev.filter((item) => item.id !== fileId));

      try {
        const { error } = await supabase
          .from("file_history")
          .delete()
          .eq("id", fileId);

        if (error) throw error;

        toast({
          title: "File deleted",
          description: `${fileName} removed.`,
        });
      } catch (error) {
        console.error("DEBUG: Delete Error:", error);
        setFileHistory(previousHistory);
        toast({
          title: "Delete Failed",
          description: "Could not delete the file.",
          variant: "destructive",
        });
      }
    },
    [user, toast, fileHistory],
  );

  useEffect(() => {
    if (user) {
        loadFileHistory();
    } else {
        // Clear history if user logs out
        setFileHistory([]);
    }
  }, [user, loadFileHistory]);

  return {
    fileHistory,
    setFileHistory,
    showFileHistory,
    setShowFileHistory,
    selectedHistoryFile,
    setSelectedHistoryFile,
    historySearchTerm,
    setHistorySearchTerm,
    loadFileHistory,
    addFileToHistory,
    updateFileHistory,
    deleteFileFromHistory,
  };
};