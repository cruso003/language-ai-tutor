'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ScenarioSelector } from '@/components/ScenarioSelector';
import { TutorSelector } from '@/components/TutorSelector';
import { FluencyGate } from '@/components/FluencyGate';
import { apiClient } from '@/lib/api-client';
import { Message } from '@/types';
import { SCENARIOS } from '@/config/scenarios';
import { Send, ArrowLeft } from 'lucide-react';

type Step = 'scenario' | 'tutor' | 'chat';

export default function PracticePage() {
  const [step, setStep] = useState<Step>('scenario');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [fluencyGateActive, setFluencyGateActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  const handleTutorSelect = (tutorId: string) => {
    setSelectedTutor(tutorId);
  };

  const handleContinue = () => {
    if (step === 'scenario' && selectedScenario) {
      setStep('tutor');
    } else if (step === 'tutor' && selectedTutor) {
      startSession();
    }
  };

  const startSession = async () => {
    if (!selectedScenario || !selectedTutor) return;

    try {
      const session = await apiClient.createSession({
        scenarioId: selectedScenario,
        personalityId: selectedTutor,
        targetLanguage: 'Spanish',
        nativeLanguage: 'English',
      });

      setSessionId(session.id);

      // Add initial greeting
      const scenario = SCENARIOS[selectedScenario];
      if (scenario) {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: scenario.initialGreeting,
            timestamp: new Date(),
          },
        ]);
      }

      setStep('chat');
      setFluencyGateActive(true);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setFluencyGateActive(false);

    try {
      const response = await apiClient.sendMessage({
        message: userMessage.content,
        sessionId,
        scenarioId: selectedScenario || undefined,
        personalityId: selectedTutor || undefined,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        corrections: response.corrections,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setFluencyGateActive(true);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFluencyTimeout = () => {
    setFluencyGateActive(false);
    // Could track hesitation here
  };

  const handleBack = () => {
    if (step === 'tutor') {
      setStep('scenario');
    } else if (step === 'chat') {
      if (confirm('Are you sure you want to end this session?')) {
        setStep('scenario');
        setSelectedScenario(null);
        setSelectedTutor(null);
        setSessionId(null);
        setMessages([]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <FluencyGate
        isActive={fluencyGateActive}
        onTimeout={handleFluencyTimeout}
        timeLimit={3}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {step === 'scenario' && 'Choose a Scenario'}
            {step === 'tutor' && 'Choose Your Tutor'}
            {step === 'chat' && 'Practice Session'}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {step === 'scenario' && 'Select a real-world conversation scenario'}
            {step === 'tutor' && 'Pick an AI tutor personality'}
            {step === 'chat' && 'Have a conversation with your AI tutor'}
          </p>
        </div>
        {step !== 'scenario' && (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
        )}
      </div>

      {step === 'scenario' && (
        <div className="space-y-4">
          <ScenarioSelector
            selectedScenario={selectedScenario}
            onSelect={handleScenarioSelect}
          />
          {selectedScenario && (
            <div className="flex justify-end">
              <Button onClick={handleContinue} size="lg">
                Continue to Tutor Selection
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'tutor' && (
        <div className="space-y-4">
          <TutorSelector selectedTutor={selectedTutor} onSelect={handleTutorSelect} />
          {selectedTutor && (
            <div className="flex justify-end">
              <Button onClick={handleContinue} size="lg">
                Start Practice Session
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'chat' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="flex h-[600px] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.corrections && message.corrections.length > 0 && (
                        <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                          {message.corrections.map((correction, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-semibold">{correction.type}:</span>{' '}
                              <span className="line-through">{correction.original}</span> →{' '}
                              {correction.suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: '0.4s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4 dark:border-dark-border">
                <div className="flex gap-2">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message in Spanish..."
                    className="min-h-[60px] resize-none"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !inputValue.trim()}
                    className="px-6"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Key Phrases
              </h3>
              <ul className="space-y-2 text-sm">
                {selectedScenario &&
                  SCENARIOS[selectedScenario]?.keyPhrases.map((phrase, idx) => (
                    <li
                      key={idx}
                      className="rounded-md bg-primary/10 px-3 py-2 text-gray-700 dark:text-gray-300"
                    >
                      {phrase}
                    </li>
                  ))}
              </ul>
            </Card>

            <Card>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Vocabulary Hints
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {selectedScenario &&
                  SCENARIOS[selectedScenario]?.vocabularyHints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
