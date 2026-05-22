import React, { useState } from 'react';

export default function ImageGenerator() {
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('@cf/stabilityai/stable-diffusion-xl-base-1.0');
  const [generatedWithModel, setGeneratedWithModel] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const key = import.meta.env.PUBLIC_API_SECRET;

      const res = await fetch('/api/image-gen', {
        method: 'POST',
        headers: {
          'Authorization': key || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: selectedModel,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok || (contentType && contentType.includes('application/json'))) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed at edge node.');
      }

      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);

      setImageUrl(localUrl);
      setGeneratedWithModel(selectedModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100/50">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span className="text-blue-600">⚡</span> Edge Cloudflare AI Image Generator
      </h2>

      <form onSubmit={generateImage} className="space-y-5">
        <div>
          <label className="block font-semibold text-slate-700 text-sm mb-2">
            Select Model Architecture
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-50 transition-all cursor-pointer"
          >
            <option value="@cf/stabilityai/stable-diffusion-xl-base-1.0">Stable Diffusion XL 1.0 (Standard)</option>
            <option value="@cf/blackforestlabs/flux-2-klein-4b">FLUX.2 Klein (Ultra-Fast & Detailed)</option>
            <option value="@cf/blackforestlabs/flux-2-klein-9b">FLUX.2 Klein 9B (High Fidelity)</option>
          </select>
        </div>

        <div className="block sm:flex-row gap-3">
          <label className="block font-semibold text-slate-700 text-sm mb-2">
            Describe your image
          </label>
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            disabled={loading}
            placeholder="A majestic golden owl on a throne..."
            className="w-full flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all min-h-[100px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading || !imagePrompt.trim()}
            className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/10 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center min-w-[120px]"
          >
            <span>{loading ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {imageUrl && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-500">
            ✅ Generated using: <code className="bg-blue-50 text-blue-700 font-mono px-2 py-1 rounded-md border border-blue-100">{generatedWithModel}</code>
          </p>
          <div className="overflow-hidden rounded-xl bg-slate-50 border border-slate-100 shadow-inner p-4">
            <img
              src={imageUrl}
              alt={imagePrompt}
              className="w-full max-h-[450px] object-contain mx-auto transition-all duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}