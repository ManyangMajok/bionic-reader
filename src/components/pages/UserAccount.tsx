import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  FileText,
  Calendar,
  Download,
  Trash2,
  ArrowLeft,
  Database,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface FileHistoryItem {
  id: string;
  file_name: string;
  original_text: string;
  processed_text: string;
  bold_intensity: number;
  file_size?: number;
  file_type?: string;
  created_at: string;
  updated_at?: string;
}

export default function UserAccount() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFileHistory();
    }
  }, [user]);

  const fetchFileHistory = async () => {
    try {
      setLoading(true);
      // Use local storage instead of database
      const storedFiles = localStorage.getItem(`fileHistory_${user?.id}`);
      if (storedFiles) {
        const parsedFiles = JSON.parse(storedFiles);
        setFileHistory(parsedFiles);
      } else {
        setFileHistory([]);
      }
    } catch (err) {
      setError("Failed to load file history from local storage");
      console.error("Error fetching file history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: FileHistoryItem) => {
    const blob = new Blob([item.processed_text.replace(/<\/?strong>/g, "")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bionic-${item.file_name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `${item.file_name} is being downloaded.`,
    });
  };

  const handleDelete = async (id: string, fileName: string) => {
    try {
      const updatedHistory = fileHistory.filter((item) => item.id !== id);
      localStorage.setItem(
        `fileHistory_${user?.id}`,
        JSON.stringify(updatedHistory),
      );
      setFileHistory(updatedHistory);
      toast({
        title: "File deleted",
        description: `${fileName} has been removed from your history.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete file from history.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to access your account.
            </p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 safe-area-inset-top safe-area-inset-bottom">
      <div className="responsive-container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link to="/bionic-reader">
              <Button variant="outline" size="sm" className="mobile-tap-target">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Back to App</span>
                <span className="xs:hidden">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Account
            </h1>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <Alert className="py-2 px-3 bg-yellow-50 border-yellow-200 text-xs sm:text-sm">
              <Database className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                <span className="hidden sm:inline">
                  Using local storage (database offline)
                </span>
                <span className="sm:hidden">Local storage</span>
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="mobile-tap-target"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Section */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col xs:flex-row items-center xs:items-start gap-4">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.email || ""}
                  />
                  <AvatarFallback className="text-sm sm:text-lg">
                    {user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center xs:text-left">
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                    {user.email}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Member since {format(new Date(user.created_at), "MMM yyyy")}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Total Files Processed
                  </span>
                  <Badge variant="secondary">{fileHistory.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File History Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File History
                </CardTitle>
                <CardDescription>
                  Your processed files and download history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner text="Loading file history..." />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : fileHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No files processed yet</p>
                    <Link to="/bionic-reader">
                      <Button>Process Your First File</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {fileHistory.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                  {item.file_name}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs flex-shrink-0"
                              >
                                {item.bold_intensity}% intensity
                              </Badge>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(item.created_at),
                                  "MMM d, yyyy",
                                )}
                              </div>
                              {item.file_size && (
                                <span>
                                  {Math.round(item.file_size / 1024)} KB
                                </span>
                              )}
                              {item.file_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.file_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(item)}
                              className="mobile-tap-target"
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDelete(item.id, item.file_name)
                              }
                              className="mobile-tap-target"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
