"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Image as ImageIcon, Loader2, ArrowRight, Tag, Palette, Briefcase, Shirt, CheckCircle } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [occasion, setOccasion] = useState("casual outing");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const analyzeOutfit = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("occasion", occasion);
    formData.append("preferences", preferences);

    try {
      // Assuming backend runs on 8000
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      const data = await response.json();
      if (data.status === "success") {
        setResult(data.data);
      } else {
        alert("Partial success: AI might have returned unexpected format.");
        console.log(data.raw_response);
      }
    } catch (error) {
      console.error(error);
      alert("Error analyzing outfit. Make sure backend is running and API key is set.");
    } finally {
      setLoading(false);
    }
  };

  const occasions = [
    "college", "party", "interview", "wedding", "gym", "vacation", "office", "casual outing"
  ];

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center space-x-2 bg-primary/10 text-primary-dark px-4 py-1.5 rounded-full mb-6 font-medium text-sm backdrop-blur-md border border-primary/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Fashion Stylist</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Elevate Your <span className="gradient-text">Style</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
        >
          Upload an image, and our AI will analyze your vibe, detect dominant colors, and recommend the perfect outfit for any occasion.
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Upload & Controls Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                Upload Image
              </h3>
              
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                  ${preview ? 'border-primary/50 bg-primary/5' : 'border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="relative rounded-xl overflow-hidden shadow-md mx-auto w-full max-w-[280px] h-[300px]"
                    >
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium flex items-center"><Upload className="w-4 h-4 mr-2" /> Change Image</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="upload-prompt"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-medium">Click or drag image here</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Support for JPEG, PNG, WEBP</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary" />
              Styling Preferences
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Occasion</label>
                <div className="flex flex-wrap gap-2">
                  {occasions.map(occ => (
                    <button
                      key={occ}
                      onClick={() => setOccasion(occ)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        occasion === occ 
                        ? 'bg-primary text-white shadow-md shadow-primary/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {occ.charAt(0).toUpperCase() + occ.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Preferences (Optional)</label>
                <input 
                  type="text" 
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g., sustainable brands, budget under $100, modest..." 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                />
              </div>

              <button
                onClick={analyzeOutfit}
                disabled={!file || loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  !file || loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-1'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Style...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Recommendations</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={`glass-card rounded-3xl p-8 min-h-[600px] transition-all duration-500 ${!result && !loading ? 'flex items-center justify-center opacity-50' : ''}`}>
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-6 animate-pulse">
                <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <h3 className="text-2xl font-bold gradient-text">Consulting AI Stylist...</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  Analyzing body type, color palette, and matching trending styles for {occasion}...
                </p>
              </div>
            )}

            {!loading && !result && (
              <div className="text-center">
                <Shirt className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-xl font-medium">Your Recommendations Will Appear Here</h3>
                <p className="text-sm text-slate-500 mt-2">Upload a photo to get started</p>
              </div>
            )}

            {result && !loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                  <h2 className="text-2xl font-bold">Style Analysis</h2>
                  <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Complete
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm text-slate-500 dark:text-slate-400 flex items-center mb-1"><Tag className="w-4 h-4 mr-1" /> Aesthetic</h4>
                    <p className="font-bold text-lg capitalize">{result.detected_features.aesthetic}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm text-slate-500 dark:text-slate-400 flex items-center mb-1"><Sparkles className="w-4 h-4 mr-1" /> Vibe</h4>
                    <p className="font-bold text-lg capitalize">{result.detected_features.vibe}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                    <Palette className="w-4 h-4 mr-2" /> Dominant Colors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.detected_features.dominant_colors.map((color: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium shadow-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative mt-8 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-3xl border border-primary/20">
                  <div className="absolute -top-3 -right-3 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">Recommended Outfit</h3>
                  
                  <div className="space-y-4">
                    {result.recommendation.suggested_outfit_pieces.map((item: any, i: number) => (
                      <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-slate-700/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{item.piece}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{item.reason}</p>
                          </div>
                          <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md ml-2 whitespace-nowrap">
                            {item.color}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-primary/20 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase">Footwear</h4>
                      <p className="font-medium mt-1">{result.recommendation.footwear}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase">Accessories</h4>
                      <p className="font-medium mt-1">{result.recommendation.accessories.join(", ")}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border-l-4 border-primary">
                    <h4 className="text-sm font-bold text-primary uppercase mb-1">Stylist Tip</h4>
                    <p className="text-sm italic">{result.recommendation.styling_tip}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
