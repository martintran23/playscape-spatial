import { useRef, type ChangeEvent } from 'react';
import { isPlaygroundSceneSchema } from '../../types/scene';
import { useSceneStore } from '../../store/useSceneStore';

function buildExportFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `playscape_layout_${yyyy}${mm}${dd}_${hh}${min}.json`;
}

function downloadJson(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Client-side layout persistence controls: export / import PlaygroundSceneSchema JSON.
 */
export function FileActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportSceneJSON = useSceneStore((state) => state.exportSceneJSON);
  const importSceneJSON = useSceneStore((state) => state.importSceneJSON);

  const handleExport = () => {
    const schema = exportSceneJSON();
    const json = JSON.stringify(schema, null, 2);
    downloadJson(buildExportFilename(), json);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow re-selecting the same file later.
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const parsed: unknown = JSON.parse(text);

        if (!isPlaygroundSceneSchema(parsed)) {
          window.alert(
            'Import failed: JSON is missing required Playscape Spatial v1.0.0 fields (version, metadata, environment, or valid items).',
          );
          return;
        }

        const ok = importSceneJSON(parsed);
        if (!ok) {
          window.alert('Import failed: the layout could not be applied.');
          return;
        }
      } catch {
        window.alert(
          'Import failed: the selected file is not valid JSON or is corrupted.',
        );
      }
    };
    reader.onerror = () => {
      window.alert('Import failed: could not read the selected file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleExport}
        className="border border-slate-600 bg-slate-800/90 px-2.5 py-1 text-xs text-slate-100 hover:bg-slate-700"
      >
        Export Layout
      </button>
      <button
        type="button"
        onClick={handleImportClick}
        className="border border-slate-600 bg-slate-800/90 px-2.5 py-1 text-xs text-slate-100 hover:bg-slate-700"
      >
        Import Layout
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
