import { useBionicReader } from "../../../context/BionicReaderContext";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Slider } from "../../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import {
  Settings,
  Focus,
  Activity,
  Palette,
  Type,
  RotateCcw,
  Monitor,
  LayoutTemplate,
} from "lucide-react";

export const SettingsModal = () => {
  const {
    showSettings,
    setShowSettings,
    readingSettings,
    setReadingSettings,
    applySettings,
    boldIntensity,
  } = useBionicReader();
  const { toast } = useToast();

  // Helper to reset to optimal defaults
  const handleReset = () => {
    setReadingSettings({
      fixationControl: "bold",
      saccadeControl: true,
      opacityLevel: 80,
      textSize: 16,
      fontFamily: "Inter, sans-serif",
      lineSpacing: 1.5,
      letterSpacing: 0,
      theme: "light",
      columnWidth: "medium",
      fixationFrequency: 1,
    });
    toast({
      title: "Settings Reset",
      description: "Restored to default reading configuration.",
    });
  };

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Reading Settings
          </DialogTitle>
          <DialogDescription>
            Customize your bionic reading experience with advanced controls
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fixation Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Focus className="h-4 w-4 text-purple-600" />
              <Label className="text-base font-semibold">
                Fixation Control
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Control how fixation points are displayed or emphasized
            </p>
            <Select
              value={readingSettings.fixationControl}
              onValueChange={(value: "highlight" | "bold" | "off") =>
                setReadingSettings((prev) => ({
                  ...prev,
                  fixationControl: value,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bold">Bold (Standard)</SelectItem>
                <SelectItem value="highlight">Highlight (Yellow)</SelectItem>
                <SelectItem value="off">Off (Normal Text)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Theme Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-indigo-600" />
              <Label className="text-base font-semibold">Reading Theme</Label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "light", label: "Light", bg: "bg-white border-gray-200" },
                {
                  id: "sepia",
                  label: "Sepia",
                  bg: "bg-[#f4ecd8] border-[#e6dbbe]",
                },
                {
                  id: "slate",
                  label: "Slate",
                  bg: "bg-slate-100 border-slate-200",
                },
                {
                  id: "dark",
                  label: "Dark",
                  bg: "bg-gray-900 border-gray-700 text-white",
                },
              ].map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() =>
                    setReadingSettings((prev) => ({
                      ...prev,
                      theme: themeOption.id as any,
                    }))
                  }
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                    ${
                      readingSettings.theme === themeOption.id
                        ? "border-blue-600 ring-1 ring-blue-600"
                        : "border-transparent hover:border-gray-200"
                    }
                `}
                >
                  <div
                    className={`w-full h-8 rounded-md mb-2 shadow-sm ${themeOption.bg}`}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">
                    {themeOption.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Layout Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-semibold">Line Width</Label>
            </div>
            <p className="text-sm text-gray-600">
              Narrower lines improve reading speed
            </p>
            <Select
              value={readingSettings.columnWidth}
              onValueChange={(value: any) =>
                setReadingSettings((prev) => ({ ...prev, columnWidth: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">
                  Narrow (Newspaper - 600px)
                </SelectItem>
                <SelectItem value="medium">
                  Medium (Standard - 800px)
                </SelectItem>
                <SelectItem value="wide">Wide (Laptop - 1000px)</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Frequency Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <Label className="text-base font-semibold">
                Bionic Frequency
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              How often should words be processed?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <Button
                  key={num}
                  variant={
                    readingSettings.fixationFrequency === num
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setReadingSettings((prev) => ({
                      ...prev,
                      fixationFrequency: num as 1 | 2 | 3,
                    }))
                  }
                  className="flex-1"
                >
                  {num === 1
                    ? "Every Word"
                    : `Every ${num === 2 ? "2nd" : "3rd"} Word`}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Saccade Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <Label className="text-base font-semibold">Saccade Control</Label>
            </div>
            <p className="text-sm text-gray-600">
              Enable visual cues to help guide eye movement
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={readingSettings.saccadeControl}
                onCheckedChange={(checked) =>
                  setReadingSettings((prev) => ({
                    ...prev,
                    saccadeControl: checked,
                  }))
                }
              />
              <Label className="text-sm">
                {readingSettings.saccadeControl ? "Enabled" : "Disabled"}
              </Label>
            </div>
          </div>

          <Separator />

          {/* Opacity Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-orange-600" />
                <Label className="text-base font-semibold">
                  Fixation Opacity
                </Label>
              </div>
              <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                {readingSettings.opacityLevel}%
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Control the transparency of non-bolded text parts
            </p>
            <Slider
              value={[readingSettings.opacityLevel]}
              onValueChange={(value) =>
                setReadingSettings((prev) => ({
                  ...prev,
                  opacityLevel: value[0],
                }))
              }
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Transparent</span>
              <span>Opaque</span>
            </div>
          </div>

          <Separator />

          {/* Text Detail Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-semibold">Text Styling</Label>
            </div>

            {/* Text Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Text Size</Label>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {readingSettings.textSize}px
                </span>
              </div>
              <Slider
                value={[readingSettings.textSize]}
                onValueChange={(value) =>
                  setReadingSettings((prev) => ({
                    ...prev,
                    textSize: value[0],
                  }))
                }
                min={12}
                max={32}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Font Family</Label>
              <Select
                value={readingSettings.fontFamily}
                onValueChange={(value) =>
                  setReadingSettings((prev) => ({
                    ...prev,
                    fontFamily: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, sans-serif">
                    Inter (Sans-serif)
                  </SelectItem>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia (Serif)</SelectItem>
                  <SelectItem value="Times New Roman, serif">
                    Times New Roman
                  </SelectItem>
                  <SelectItem value="Helvetica, sans-serif">
                    Helvetica
                  </SelectItem>
                  <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Line Spacing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Line Spacing</Label>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  {readingSettings.lineSpacing}x
                </span>
              </div>
              <Slider
                value={[readingSettings.lineSpacing]}
                onValueChange={(value) =>
                  setReadingSettings((prev) => ({
                    ...prev,
                    lineSpacing: value[0],
                  }))
                }
                min={1.0}
                max={3.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Tight</span>
                <span>Loose</span>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Letter Spacing</Label>
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {readingSettings.letterSpacing}px
                </span>
              </div>
              <Slider
                value={[readingSettings.letterSpacing]}
                onValueChange={(value) =>
                  setReadingSettings((prev) => ({
                    ...prev,
                    letterSpacing: value[0],
                  }))
                }
                min={-1}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Condensed</span>
                <span>Expanded</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            {/* Reset Button */}
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-red-600"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Defaults
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  applySettings(boldIntensity[0]);
                  setShowSettings(false);
                  toast({
                    title: "Settings applied",
                    description: "Your reading preferences have been updated.",
                  });
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Apply Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};