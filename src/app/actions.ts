"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import type { Message } from "@/types";
import { generateInitialPrompt } from "@/ai/flows/generate-initial-prompt"; 

// Placeholder for a real chat AI flow.
async function getAiResponse(userId: string, userMessageText: string, _chatHistory: Message[]): Promise<string> {
  try {
    // The topic could be dynamic or related to the user's message if more complex logic was added.
    const topic = userMessageText.split(" ").slice(0, 3).join(" ") || "a friendly conversation";
    const initialPromptResponse = await generateInitialPrompt({ topic });
    
    if (initialPromptResponse && initialPromptResponse.initialPrompt) {
        return initialPromptResponse.initialPrompt;
    }
    console.warn("AI did not provide an initial prompt. Falling back.");
    return "I'm sorry, I couldn't think of a response right now.";

  } catch (error) {
    console.error("Error getting AI response:", error);
    // Ensure the error is logged, but return a user-friendly message.
    // The actual error object might not be serializable or appropriate to send to the client directly.
    return "There was an error processing your request with the AI.";
  }
}

export async function sendMessageAndGetResponse(userId: string, userMessageText: string, chatHistory: Message[]): Promise<Message | null> {
  if (!userId) {
    console.error("User ID is required to send a message.");
    return null;
  }

  // 1. User message is already saved by the client before calling this.
  // 2. Get AI response
  const aiResponseText = await getAiResponse(userId, userMessageText, chatHistory);

  // 3. Create AI message object
  const aiMessageData: Omit<Message, "id" | "timestamp"> & { timestamp: any } = { 
    text: aiResponseText,
    sender: 'ai',
    userId: userId,
    timestamp: serverTimestamp(), // Use serverTimestamp for writing to Firestore
  };

  // 4. Save AI message to Firestore
  try {
    const messagesColRef = collection(db, "users", userId, "messages");
    const docRef = await addDoc(messagesColRef, aiMessageData);
    // For return to client, use a serializable timestamp (Date object)
    const savedTimestamp = new Date(); // Approximate with current client time, or re-fetch for precision if needed
    return { 
        id: docRef.id,
        text: aiMessageData.text,
        sender: aiMessageData.sender,
        userId: aiMessageData.userId,
        timestamp: savedTimestamp 
    } as Message;
  } catch (error) {
    console.error("Error saving AI message to Firestore:", error);
    return null;
  }
}

export async function saveUserMessage(userId: string, messageText: string): Promise<Message | null> {
  if (!userId) {
    console.error("User ID is required to save a message.");
    return null;
  }

  const userMessageData: Omit<Message, "id" | "timestamp"> & { timestamp: any } = {
    text: messageText,
    sender: 'user',
    userId: userId,
    timestamp: serverTimestamp(), // Use serverTimestamp for writing to Firestore
  };

  try {
    const messagesColRef = collection(db, "users", userId, "messages");
    const docRef = await addDoc(messagesColRef, userMessageData);
    // For immediate UI update and return to client, use a serializable timestamp (Date object)
    const savedTimestamp = new Date(); // Approximate with current client time for optimistic update
    return { 
        id: docRef.id,
        text: userMessageData.text,
        sender: userMessageData.sender,
        userId: userMessageData.userId,
        timestamp: savedTimestamp 
    } as Message;
  } catch (error) {
    console.error("Error saving user message to Firestore:", error);
    return null;
  }
}


export async function getChatHistory(userId: string): Promise<Message[]> {
  if (!userId) return [];

  try {
    const messagesColRef = collection(db, "users", userId, "messages");
    const q = query(messagesColRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to Date object for client-side use
      const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
      return {
        id: doc.id,
        text: data.text,
        sender: data.sender,
        userId: data.userId,
        timestamp: timestamp,
      } as Message;
    });
    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}
