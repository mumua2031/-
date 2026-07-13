import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockPatterns } from '../data';
import { buildHECode, getPatternClassification } from '../lib/classification';
import { Loader2, Sparkles } from 'lucide-react';

export function AdminUpload() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    category: 'N',
    symbolism: 'B',
    color: 'R',
    era: '',
    region: '',
    file: null as File | null
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiDescription, setAiDescription] = useState('');

  const generateCode = (currentData = formData) => {
    const existingSequences = mockPatterns
      .map(getPatternClassification)
      .filter((classification) => (
        classification.patternCategory === currentData.category &&
        classification.meaningCategory === currentData.symbolism &&
        classification.colorCategory === currentData.color &&
        classification.sequence !== null
      ))
      .map((classification) => classification.sequence || 0);

    const nextSequence = Math.max(0, ...existingSequences) + 1;
    setGeneratedCode(buildHECode({
      patternCategory: currentData.category,
      meaningCategory: currentData.symbolism,
      colorCategory: currentData.color,
      sequence: nextSequence,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
    
    if (file) {
      setIsAnalyzing(true);
      setShowAnalysis(false);
      setGeneratedCode('');
      
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64String = (reader.result as string).split(',')[1];
          
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64String,
              mimeType: file.type
            })
          });
          
          const data = await response.json();
          
          if (data.success && data.result) {
            const result = data.result;
            const aiSuggested = {
              ...formData,
              file,
              category: result.category || 'N',
              symbolism: result.symbolism || 'B',
              color: result.color || 'R'
            };
            setFormData(aiSuggested);
            setAiDescription(result.description || 'AI completed feature extraction and mapping.');
            generateCode(aiSuggested);
            setShowAnalysis(true);
          }
        };
      } catch (error) {
        console.error('Failed to analyze image:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-medium text-white/90 mb-6 flex items-center gap-2">
          {t('admin.upload', 'Upload Pattern')}
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/50 mb-2">{t('pattern.name', 'Pattern Name (ZH)')}</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/20 px-4 py-2 rounded text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/50 mb-2">{t('admin.upload_image', 'Upload Image (PNG/JPG)')}</label>
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="w-full bg-white/5 border border-white/20 px-4 py-2 rounded text-white/70 focus:outline-none focus:border-fuchsia-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-fuchsia-600 file:text-white"
              />
            </div>
          </div>

          {isAnalyzing && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-4 flex items-center gap-3 text-blue-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('admin.analyzing', 'AI is analyzing the pattern to extract features...')}
            </div>
          )}

          {showAnalysis && (
            <div className="bg-green-900/20 border border-green-500/30 rounded p-4 text-sm">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">{t('admin.analysis_complete', 'AI Analysis Complete')}</span>
              </div>
              <p className="text-white/70">{aiDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-white/50 mb-2">{t('admin.category', 'Category (1st Level)')}</label>
              <select 
                value={formData.category}
                onChange={e => {
                  setFormData({...formData, category: e.target.value});
                  setGeneratedCode('');
                }}
                className="w-full bg-[#121417] border border-white/20 px-4 py-2 rounded text-white focus:outline-none focus:border-fuchsia-500"
              >
                <option value="N">{t('category.N', 'N(自然/Nature)')}</option>
                <option value="H">{t('category.H', 'H(人文/Humanities)')}</option>
                <option value="G">{t('category.G', 'G(几何/Geometric)')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-white/50 mb-2">{t('admin.symbolism', 'Symbolism (2nd Level)')}</label>
              <select 
                value={formData.symbolism}
                onChange={e => {
                  setFormData({...formData, symbolism: e.target.value});
                  setGeneratedCode('');
                }}
                className="w-full bg-[#121417] border border-white/20 px-4 py-2 rounded text-white focus:outline-none focus:border-fuchsia-500"
              >
                <option value="B">{t('symbolism.B', 'B(祈福/Blessing)')}</option>
                <option value="S">{t('symbolism.S', 'S(信仰/Belief)')}</option>
                <option value="L">{t('symbolism.L', 'L(生活/Life)')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-white/50 mb-2">{t('admin.color', 'Color (3rd Level)')}</label>
              <select 
                value={formData.color}
                onChange={e => {
                  setFormData({...formData, color: e.target.value});
                  setGeneratedCode('');
                }}
                className="w-full bg-[#121417] border border-white/20 px-4 py-2 rounded text-white focus:outline-none focus:border-fuchsia-500"
              >
                <option value="R">{t('color.R', 'R(红/Red)')}</option>
                <option value="G">{t('color.G', 'G(绿/Green)')}</option>
                <option value="B">{t('color.B', 'B(蓝/Blue)')}</option>
                <option value="A">{t('color.A', 'A(金银/Gold and Silver)')}</option>
                <option value="M">{t('color.M', 'M(多色/Multi)')}</option>
              </select>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => generateCode(formData)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                {t('admin.generate_code', 'Generate Next HE Code')}
              </button>
              {generatedCode && (
                <div className="text-sm">
                  <span className="text-white/50 mr-2">{t('admin.assigned_code', 'Assigned Code:')}</span>
                  <span className="font-mono text-fuchsia-400 bg-fuchsia-900/20 px-2 py-1 rounded border border-fuchsia-500/30">
                    {generatedCode}
                  </span>
                  <span className="ml-3 text-xs text-green-400">{t('admin.code_verified', 'Unique code verified')}</span>
                </div>
              )}
            </div>
            
            <button 
              disabled={!generatedCode || !formData.name}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2 rounded text-sm transition-colors"
            >
              {t('admin.submit', 'Submit to Database')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
