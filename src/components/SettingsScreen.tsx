'use client';

import { useState } from 'react';
import { AssessmentState, Screen, WeightsConfig } from '../lib/types';
import { CATEGORIES } from '../lib/questions';

interface SettingsScreenProps {
  state: AssessmentState;
  onUpdateWeights: (weights: WeightsConfig) => void;
  onNavigate: (screen: Screen) => void;
}

export default function SettingsScreen({
  state,
  onUpdateWeights,
  onNavigate,
}: SettingsScreenProps) {
  const [weights, setWeights] = useState<WeightsConfig>({ ...state.weightsConfig });

  const totalWeight = weights.categoryWeights.reduce((sum, cw) => sum + cw.weight, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.5;

  const updateCategoryWeight = (category: string, value: number) => {
    setWeights((prev) => ({
      ...prev,
      mode: 'custom' as const,
      categoryWeights: prev.categoryWeights.map((cw) =>
        cw.category === category ? { ...cw, weight: value } : cw
      ),
    }));
  };

  const handleSave = () => {
    if (!isValid) {
      alert(`Weights must total 100%. Current total: ${totalWeight.toFixed(1)}%`);
      return;
    }
    onUpdateWeights(weights);
    onNavigate('results');
  };

  const handleReset = () => {
    const defaultWeights: WeightsConfig = {
      mode: 'equal',
      categoryWeights: CATEGORIES.map((c) => ({ category: c, weight: 12.5 })),
    };
    setWeights(defaultWeights);
    onUpdateWeights(defaultWeights);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-shore-navy border-b border-shore-slate/30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('results')}
            className="text-sm text-shore-mist/70 hover:text-white flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Results
          </button>
          <h1 className="text-sm font-semibold text-white">Category Weights</h1>
          <div />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Explanation */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-shore-navy mb-2">Strategic Weighting</h2>
          <p className="text-xs text-shore-slate leading-relaxed">
            By default, all 8 HR functions are weighted equally at 12.5% each.
            Use custom weighting to assign higher or lower importance to specific functions
            based on your organization&apos;s strategic priorities. Weights must total 100%.
          </p>
        </div>

        {/* Weight Mode */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleReset}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                weights.mode === 'equal'
                  ? 'bg-shore-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Equal Weighting
            </button>
            <button
              onClick={() => setWeights((prev) => ({ ...prev, mode: 'custom' }))}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                weights.mode === 'custom'
                  ? 'bg-shore-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Strategic Weighting
            </button>
          </div>

          {/* Weight sliders */}
          <div className="space-y-4">
            {weights.categoryWeights.map((cw) => (
              <div key={cw.category} className="flex items-center gap-3">
                <label className="text-sm text-gray-700 w-56 flex-shrink-0">{cw.category}</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={cw.weight}
                  onChange={(e) => updateCategoryWeight(cw.category, parseFloat(e.target.value))}
                  className="flex-1"
                  disabled={weights.mode === 'equal'}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={cw.weight}
                  onChange={(e) => updateCategoryWeight(cw.category, parseFloat(e.target.value) || 0)}
                  className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm text-center focus:border-shore-teal focus:outline-none"
                  disabled={weights.mode === 'equal'}
                />
                <span className="text-xs text-gray-400 w-4">%</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-shore-navy">Total</span>
            <span className={`text-sm font-bold ${isValid ? 'text-shore-teal' : 'text-red-600'}`}>
              {totalWeight.toFixed(1)}%
              {!isValid && ' (must equal 100%)'}
            </span>
          </div>
        </div>

        {/* Save/Reset */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="rounded-xl bg-shore-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-shore-slate transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save & View Results
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Reset to Equal
          </button>
        </div>
      </main>
    </div>
  );
}
