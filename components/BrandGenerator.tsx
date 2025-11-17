
import React, { useState, useCallback } from 'react';
import { generateBrandIdentityPlan, generateImage } from '../services/geminiService';
import type { BrandBible, ColorInfo, FontPairing } from '../types';
import { SparklesIcon, CopyIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

const LOADING_MESSAGES = [
    "Analyzing your mission...",
    "Crafting brand strategy...",
    "Designing logo concepts...",
    "Mixing the perfect color palette...",
    "Pairing elegant fonts...",
    "Finalizing your brand bible...",
];

const BrandResultDisplay: React.FC<{ brandBible: BrandBible }> = ({ brandBible }) => {
    const [copiedHex, setCopiedHex] = useState<string | null>(null);

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 2000);
    };

    const HeaderFont = brandBible.fontPairing.headerFont.replace(/\s/g, '+');
    const BodyFont = brandBible.fontPairing.bodyFont.replace(/\s/g, '+');

    return (
        <div className="animate-fade-in space-y-12">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=${HeaderFont}:wght@700&family=${BodyFont}:wght@400&display=swap');
             `}</style>
            <div className="text-center p-6 bg-gray-800 rounded-lg">
                <h2 className="text-3xl font-bold text-purple-400" style={{fontFamily: `'${brandBible.fontPairing.headerFont}', sans-serif`}}>Your Brand Bible</h2>
                <p className="text-lg text-gray-300 mt-2 max-w-2xl mx-auto" style={{fontFamily: `'${brandBible.fontPairing.bodyFont}', sans-serif`}}>Based on your mission: "{brandBible.mission}"</p>
            </div>

            {/* Logos */}
            <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-200" style={{fontFamily: `'${brandBible.fontPairing.headerFont}', sans-serif`}}>Logos & Marks</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center">
                        <h4 className="text-lg font-semibold mb-3 text-gray-400">Primary Logo</h4>
                        <img src={brandBible.primaryLogoUrl} alt="Primary Logo" className="w-48 h-48 object-contain bg-white rounded-md shadow-lg" />
                    </div>
                    {brandBible.secondaryMarkUrls.map((url, index) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center">
                            <h4 className="text-lg font-semibold mb-3 text-gray-400">Secondary Mark {index + 1}</h4>
                            <img src={url} alt={`Secondary Mark ${index + 1}`} className="w-32 h-32 object-contain bg-white rounded-md shadow-lg" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Palette */}
            <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-200" style={{fontFamily: `'${brandBible.fontPairing.headerFont}', sans-serif`}}>Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {brandBible.colorPalette.map((color, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="h-24 w-full" style={{ backgroundColor: color.hex }}></div>
                            <div className="p-4">
                                <p className="font-semibold text-lg">{color.name}</p>
                                <div className="flex items-center justify-between text-sm text-gray-400 mt-1">
                                    <span>{color.hex}</span>
                                    <button onClick={() => handleCopy(color.hex)} className="text-gray-500 hover:text-white transition-colors">
                                        {copiedHex === color.hex ? 'Copied!' : <CopyIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{color.usage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Font Pairings */}
            <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-200" style={{fontFamily: `'${brandBible.fontPairing.headerFont}', sans-serif`}}>Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Header Font</p>
                        <h4 className="text-3xl" style={{fontFamily: `'${brandBible.fontPairing.headerFont}', sans-serif`}}>{brandBible.fontPairing.headerFont}</h4>
                        <p className="text-4xl mt-4" style={{fontFamily: `'${brandBible.fontPairing.headerFont}', sans-serif`}}>The quick brown fox jumps over the lazy dog.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Body Font</p>
                        <h4 className="text-3xl" style={{fontFamily: `'${brandBible.fontPairing.bodyFont}', sans-serif`}}>{brandBible.fontPairing.bodyFont}</h4>
                        <p className="text-lg mt-4" style={{fontFamily: `'${brandBible.fontPairing.bodyFont}', sans-serif`}}>The quick brown fox jumps over the lazy dog.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const BrandGenerator = () => {
    const [mission, setMission] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!mission.trim()) {
            setError("Please enter your company's mission.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setBrandBible(null);

        try {
            let messageIndex = 0;
            const interval = setInterval(() => {
                setLoadingMessage(LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]);
                messageIndex++;
            }, 2000);

            const plan = await generateBrandIdentityPlan(mission);
            const primaryLogoUrl = await generateImage(plan.logoPrompt);
            const secondaryMarkUrls = await Promise.all(
                plan.secondaryMarkPrompts.map(prompt => generateImage(prompt))
            );

            setBrandBible({
                ...plan,
                primaryLogoUrl,
                secondaryMarkUrls,
                mission,
            });

            clearInterval(interval);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [mission]);

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        Brand Identity Generator
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        Describe your company's mission, and let AI craft your unique brand identity.
                    </p>
                </div>

                {!brandBible && (
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
                        <textarea
                            value={mission}
                            onChange={(e) => setMission(e.target.value)}
                            placeholder="e.g., 'To empower small businesses with affordable and easy-to-use financial tools, making entrepreneurship accessible to everyone.'"
                            className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner />
                                    <span>{loadingMessage || 'Generating...'}</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    Generate Brand Bible
                                </>
                            )}
                        </button>
                        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                    </div>
                )}
                
                {brandBible && (
                    <div className="mt-8">
                        <BrandResultDisplay brandBible={brandBible} />
                         <button
                            onClick={() => setBrandBible(null)}
                            className="mt-8 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            Generate a New Brand
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandGenerator;
