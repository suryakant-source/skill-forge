import React, { useState } from 'react';
import { FaRobot, FaPaperPlane, FaLightbulb, FaSpinner } from 'react-icons/fa';
import aiApi from '../api/aiApi';

const PRESET_PROMPTS = [
  'Create a 4-week React + TypeScript learning roadmap',
  'How do I implement JWT Authentication in Spring Boot 3?',
  'Explain the difference between SQL indexes and partitioning',
  'What are the best practices for Dockerizing a fullstack app?',
];

export const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your SkillForge AI Career Mentor. Ask me for a personalized learning roadmap, technical explanations, or project architecture advice.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await aiApi.chatWithAssistant({ message: prompt });
      const reply = res.data?.reply || res.reply || res.data || 'Roadmap and suggestions generated!';
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (error) {
      const mockReply =
        'Here is a recommended path based on your prompt:\n\n1. Master the fundamentals and official docs.\n2. Build a hands-on project with production-level code patterns.\n3. Integrate automated tests and containerization.\n4. Document and deploy your solution.';
      setMessages((prev) => [...prev, { sender: 'ai', text: mockReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-xs font-semibold text-secondary mb-3">
          <FaRobot />
          <span>Gemini & AI Powered</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Career Mentor</h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          Accelerate your learning curve with personalized tech guidance.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-xs px-3 py-1.5 rounded-full bg-surface border border-white/10 hover:border-secondary/50 text-gray-300 hover:text-white transition flex items-center space-x-1.5"
          >
            <FaLightbulb className="text-secondary text-[10px]" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      <div className="glass-card border border-white/10 flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={'flex items-start space-x-3 ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center text-sm border border-secondary/30 flex-shrink-0 mt-0.5">
                  <FaRobot />
                </div>
              )}
              <div
                className={'max-w-lg p-3.5 rounded-xl text-sm leading-relaxed whitespace-pre-line ' +
                  (msg.sender === 'user'
                    ? 'bg-primary text-white font-medium rounded-tr-none'
                    : 'bg-surface text-gray-200 border border-white/10 rounded-tl-none')}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-secondary pl-11">
              <FaSpinner className="animate-spin" />
              <span>AI Mentor is thinking...</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-surface/80 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about coding, roadmaps, or career progression..."
              className="input-field text-sm flex-1 !bg-background"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="gradient-btn px-4 py-2.5 text-sm disabled:opacity-50 flex items-center space-x-1.5"
            >
              <FaPaperPlane className="text-xs" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AIAssistantPage;
