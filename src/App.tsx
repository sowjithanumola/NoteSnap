import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  List, 
  HelpCircle, 
  Key, 
  Copy, 
  Download, 
  Moon, 
  Sun, 
  MessageSquare, 
  X, 
  Send,
  Loader2,
  Sparkles,
  Mail
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  generateSummary, 
  generateBulletPoints, 
  generateQuiz, 
  generateKeyConcepts, 
  chatWithGemini 
} from './services/geminiService';

type OutputType = 'Summary' | 'Bullet Points' | 'Quiz' | 'Key Concepts' | null;

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function App() {
  const [notes, setNotes] = useState('');
  const [output, setOutput] = useState('');
  const [outputType, setOutputType] = useState<OutputType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleGenerate = async (type: OutputType) => {
    if (!notes.trim()) return;
    
    setIsLoading(true);
    setOutputType(type);
    setOutput('');
    
    try {
      let result = '';
      switch (type) {
        case 'Summary':
          result = await generateSummary(notes);
          break;
        case 'Bullet Points':
          result = await generateBulletPoints(notes);
          break;
        case 'Quiz':
          result = await generateQuiz(notes);
          break;
        case 'Key Concepts':
          result = await generateKeyConcepts(notes);
          break;
      }
      setOutput(result);
    } catch (error) {
      console.error("Error generating content:", error);
      setOutput("An error occurred while generating the content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([output], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${outputType?.toLowerCase().replace(' ', '_') || 'notes'}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsChatLoading(true);

    try {
      const response = await chatWithGemini(chatMessages, userMsg);
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950/20 text-zinc-100' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 text-zinc-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 border-b ${isDarkMode ? 'border-zinc-800/50 bg-zinc-950/80' : 'border-zinc-200/50 bg-white/80'} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="NoteSnap Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/20" />
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">NoteSnap</h1>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input */}
          <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
            <label htmlFor="notes" className="block text-sm font-medium mb-3 opacity-80 pl-1">
              Paste your study notes here
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy..."
              className={`flex-1 w-full p-5 rounded-3xl resize-none outline-none transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-zinc-100 placeholder-zinc-600 shadow-inner' 
                  : 'bg-white/50 border border-zinc-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 placeholder-zinc-400 shadow-xl shadow-indigo-500/5 backdrop-blur-sm'
              }`}
            />
          </div>

          {/* Right Column: Actions & Output */}
          <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] min-h-[500px]">
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleGenerate('Summary')}
                disabled={isLoading || !notes.trim()}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-medium transition-all duration-300 group ${
                  isDarkMode 
                    ? 'bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-indigo-500/10' 
                    : 'bg-white/80 hover:bg-white border border-zinc-200/80 text-zinc-700 hover:text-indigo-600 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 disabled:opacity-50 disabled:hover:bg-white/80 backdrop-blur-sm'
                }`}
              >
                <div className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-indigo-500/20 group-hover:text-indigo-400' : 'bg-zinc-100 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span>Summary</span>
              </button>
              
              <button
                onClick={() => handleGenerate('Bullet Points')}
                disabled={isLoading || !notes.trim()}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-medium transition-all duration-300 group ${
                  isDarkMode 
                    ? 'bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-teal-500/10' 
                    : 'bg-white/80 hover:bg-white border border-zinc-200/80 text-zinc-700 hover:text-teal-600 hover:border-teal-200 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 disabled:opacity-50 disabled:hover:bg-white/80 backdrop-blur-sm'
                }`}
              >
                <div className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-teal-500/20 group-hover:text-teal-400' : 'bg-zinc-100 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                  <List className="w-5 h-5" />
                </div>
                <span>Bullet Points</span>
              </button>
              
              <button
                onClick={() => handleGenerate('Quiz')}
                disabled={isLoading || !notes.trim()}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-medium transition-all duration-300 group ${
                  isDarkMode 
                    ? 'bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-rose-500/10' 
                    : 'bg-white/80 hover:bg-white border border-zinc-200/80 text-zinc-700 hover:text-rose-600 hover:border-rose-200 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 disabled:opacity-50 disabled:hover:bg-white/80 backdrop-blur-sm'
                }`}
              >
                <div className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-rose-500/20 group-hover:text-rose-400' : 'bg-zinc-100 group-hover:bg-rose-50 group-hover:text-rose-600'}`}>
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span>Quiz Generator</span>
              </button>
              
              <button
                onClick={() => handleGenerate('Key Concepts')}
                disabled={isLoading || !notes.trim()}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-medium transition-all duration-300 group ${
                  isDarkMode 
                    ? 'bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-purple-500/10' 
                    : 'bg-white/80 hover:bg-white border border-zinc-200/80 text-zinc-700 hover:text-purple-600 hover:border-purple-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 disabled:opacity-50 disabled:hover:bg-white/80 backdrop-blur-sm'
                }`}
              >
                <div className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-purple-500/20 group-hover:text-purple-400' : 'bg-zinc-100 group-hover:bg-purple-50 group-hover:text-purple-600'}`}>
                  <Key className="w-5 h-5" />
                </div>
                <span>Key Concepts</span>
              </button>
            </div>

            {/* Output Area */}
            <div className={`flex-1 flex flex-col rounded-3xl overflow-hidden transition-all duration-300 ${
              isDarkMode ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white/80 border border-zinc-200/80 shadow-xl shadow-indigo-500/5 backdrop-blur-sm'
            }`}>
              {/* Output Header */}
              <div className={`px-5 py-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-100 bg-white/50'
              }`}>
                <h2 className="font-medium text-sm opacity-80">
                  {outputType ? outputType : 'Output'}
                </h2>
                
                {output && !isLoading && (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleCopy}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700'
                      }`}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleDownload}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700'
                      }`}
                      title="Download as TXT"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Output Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-medium animate-pulse">Generating {outputType?.toLowerCase()}...</p>
                  </div>
                ) : output ? (
                  <div className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                    <Markdown>{output}</Markdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Sparkles className="w-12 h-12 mb-4" />
                    <p className="text-sm text-center max-w-[250px]">
                      Paste your notes and select an option above to generate study material.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center text-sm ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
        <p>
          Created by <span className="font-medium text-indigo-500">Sowjith Anumola</span>
        </p>
        <a 
          href="mailto:sowjith.anumola@gmail.com" 
          className="inline-flex items-center gap-1.5 mt-2 hover:text-indigo-500 transition-colors"
        >
          <Mail className="w-4 h-4" />
          sowjith.anumola@gmail.com
        </a>
      </footer>

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-40 ${
          isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        } ${isChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 w-full max-w-[380px] h-[500px] max-h-[calc(100vh-3rem)] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden ${
              isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
            }`}
          >
            {/* Chat Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Tutor</h3>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 ${
              isDarkMode ? 'bg-zinc-950/50' : 'bg-zinc-50/50'
            }`}>
              {chatMessages.length === 0 && (
                <div className="text-center my-auto opacity-50 text-sm">
                  Ask me anything about your notes!
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : isDarkMode 
                        ? 'bg-zinc-800 text-zinc-200 rounded-bl-sm' 
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm shadow-sm'
                  }`}>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:text-zinc-100">
                      <Markdown>{msg.parts[0].text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm rounded-bl-sm flex items-center gap-2 ${
                    isDarkMode ? 'bg-zinc-800 text-zinc-200' : 'bg-white border border-zinc-200 text-zinc-800 shadow-sm'
                  }`}>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="opacity-70">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className={`p-3 border-t ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
            }`}>
              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-shadow ${
                    isDarkMode 
                      ? 'bg-zinc-800 border-transparent focus:bg-zinc-950 focus:ring-2 focus:ring-indigo-500/50 text-zinc-100 placeholder-zinc-500' 
                      : 'bg-zinc-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 placeholder-zinc-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className={`p-2.5 rounded-xl transition-colors ${
                    !chatInput.trim() || isChatLoading
                      ? isDarkMode ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-100 text-zinc-400'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
