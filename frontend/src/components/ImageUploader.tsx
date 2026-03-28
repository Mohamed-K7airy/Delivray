'use client';
import { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  endpoint: '/upload/store-image' | '/upload/product-image';
  currentImage?: string;
  label?: string;
  aspectRatio?: 'square' | 'video';
}

export default function ImageUploader({ 
  onUploadSuccess, 
  endpoint, 
  currentImage, 
  label = 'Upload Image',
  aspectRatio = 'square'
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    // Create local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const data = await apiClient(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          // Note: fetch with FormData should not have Content-Type set manually
          // as it needs the boundary string
        }
      });

      if (data && data.url) {
        onUploadSuccess(data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
      setPreview(currentImage || null); // Revert preview on failure
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>}
      
      <div 
        className={`relative group cursor-pointer transition-all duration-300 rounded-[2rem] overflow-hidden border-2 border-dashed
          ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'}
          ${dragActive ? 'border-slate-900 bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-300'}
          ${uploading ? 'opacity-70 pointer-events-none' : 'opacity-100'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Upload size={24} className="text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                 <Loader2 size={32} className="animate-spin text-slate-900" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Synchronizing...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
               <Upload size={24} />
            </div>
            <div className="space-y-1">
               <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Select Asset Source</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Drop file or click manual init</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
      </div>
      <p className="px-2 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center justify-between">
         <span>Format: JPG, PNG, WEBP</span>
         <span>Limit: 5MB</span>
      </p>
    </div>
  );
}
