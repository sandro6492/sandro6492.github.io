'use client';
/** Binds the chat store's mock socket to component lifecycle. */
import { useEffect } from 'react';
import { useChatStore } from '@/lib/store';

export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const onlineCount = useChatStore((s) => s.onlineCount);
  const rainCountdown = useChatStore((s) => s.rainCountdown);
  const send = useChatStore((s) => s.send);
  const triggerRain = useChatStore((s) => s.triggerRain);
  const connect = useChatStore((s) => s.connect);

  useEffect(() => {
    const disconnect = connect();
    return () => disconnect();
  }, [connect]);

  return { messages, onlineCount, rainCountdown, send, triggerRain };
}
