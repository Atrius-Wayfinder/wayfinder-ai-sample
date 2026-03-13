import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChatMessage,
  TypingIndicator,
  ChatInput,
  ChatSuggestions,
  type Message,
} from "@core/chat-ui";
import { Agent } from "@core/agent";
import type { AgentConfig } from "@core/agent";
import { GeminiClient } from "@core/gemini";
import tools from "@core/agent-tools";
import { search, showDirections, searchNearby } from "../tools";
import { buildSystemInstruction, MAX_ITERATIONS } from "../prompts";
import type { AppConfig } from "@core/config";
import styles from "./ChatDrawer.module.css";

interface ChatDrawerProps {
  config: AppConfig;
  onOpenSettings: () => void;
}

/**
 * Create the Agent from runtime config.
 * Called once when the component first mounts with a valid config.
 */
function createAgent(config: AppConfig): Agent {
  const agentConfig: AgentConfig = {
    client: new GeminiClient({
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature,
    }),
    tools: [search, showDirections, searchNearby, ...tools],
    buildSystemInstruction: (iteration: number) =>
      buildSystemInstruction(iteration, config.venueId),
    maxIterations: MAX_ITERATIONS,
  };
  return new Agent(agentConfig);
}

export function ChatDrawer({ config, onOpenSettings }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<Agent>(createAgent(config));

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call the AI agent
      const result = await agentRef.current.chat(content);

      const assistantMessage: Message = {
        id: result.message.id,
        role: "assistant",
        content: result.message.content,
        timestamp: result.message.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Agent error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      // Add error message to chat
      const errorAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      handleSendMessage(suggestion);
    },
    [handleSendMessage],
  );

  const showEmptyState = messages.length === 0 && !isTyping;

  return (
    <div className={styles.chatDrawer}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderContent}>
          <div>
            <h2>Venue Assistant</h2>
            <p>Ask me about locations, directions, and amenities</p>
          </div>
          <button
            className={styles.settingsButton}
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Open settings"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {showEmptyState ? (
          <div className={styles.chatEmptyState}>
            <svg
              className={styles.chatEmptyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <h3>Welcome to Venue Assistant</h3>
            <p>
              Ask me anything about this venue - find locations, get directions,
              or discover amenities.
            </p>
            <ChatSuggestions
              suggestions={[
                "Where can I get a snack?",
                "Show me current security wait times",
                "Get directions to my gate",
                "Find coffee shops nearby",
              ]}
              onSelect={handleSuggestionSelect}
            />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
