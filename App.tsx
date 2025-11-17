
import React, { useState } from 'react';
import BrandGenerator from './components/BrandGenerator';
import Chatbot from './components/Chatbot';
import { BrandIcon, ChatIcon } from './components/icons';

type Tab = 'generator' | 'chatbot';

const App = () => {
    const [activeTab, setActiveTab] = useState<Tab>('generator');

    const renderContent = () => {
        switch (activeTab) {
            case 'generator':
                return <BrandGenerator />;
            case 'chatbot':
                return <div className="h-[calc(100vh-80px)]"><Chatbot /></div>;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabName: Tab; icon: React.ReactNode; label: string }> = ({ tabName, icon, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tabName 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">BrandWise AI</h1>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-xl">
                            <TabButton tabName="generator" icon={<BrandIcon className="w-5 h-5" />} label="Generator" />
                            <TabButton tabName="chatbot" icon={<ChatIcon className="w-5 h-5" />} label="Chatbot" />
                        </div>
                    </div>
                </nav>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
