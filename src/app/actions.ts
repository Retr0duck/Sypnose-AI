
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import type { Message } from "@/types";
import { generateInitialPrompt } from "@/ai/flows/generate-initial-prompt"; // Using this as a placeholder for actual chat

// Placeholder for a real chat AI flow.
// For now, we'll use generateInitialPrompt and just respond with its output, ignoring user message.
async function getAiResponse(userId: string, userMessageText: string, _chatHistory: Message[]): Promise<string> {
  try {
    // In a real scenario, you'd use userMessageText and chatHistory to generate a contextual response.
    // This might involve calling a Genkit flow like:
    // const response = await someChatCompletionFlow({ userId, message: userMessageText, history: chatHistory });
    // return response.aiMessage;

    // For demonstration, using generateInitialPrompt.
    // The topic could be dynamic or related to the user's message if more complex logic was added.
    const topic = userMessageText.split(" ").slice(0, 3).join(" ") || "a friendly conversation";
    const initialPromptResponse = await generateInitialPrompt({ topic });
    return initialPromptResponse.initialPrompt || "I'm sorry, I couldn't think of a response right now.";
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "There was an error processing your request.";
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
  const aiMessage: Omit<Message, "id" | "timestamp"> & { timestamp: any } = { // serverTimestamp is an object
    text: aiResponseText,
    sender: 'ai',
    userId: userId,
    timestamp: serverTimestamp(),
  };

  // 4. Save AI message to Firestore
  try {
    const messagesColRef = collection(db, "users", userId, "messages");
    const docRef = await addDoc(messagesColRef, aiMessage);
    return { ...aiMessage, id: docRef.id, timestamp: Timestamp.now() } as Message; // Return with ID and client-side timestamp
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

  const userMessage: Omit<Message, "id" | "timestamp"> & { timestamp: any } = {
    text: messageText,
    sender: 'user',
    userId: userId,
    timestamp: serverTimestamp(),
  };

  try {
    const messagesColRef = collection(db, "users", userId, "messages");
    const docRef = await addDoc(messagesColRef, userMessage);
    // For immediate UI update, return with client-side timestamp representation
    return { ...userMessage, id: docRef.id, timestamp: Timestamp.now() } as Message;
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
      // Ensure timestamp is serializable (convert Firestore Timestamp to Date or number if needed)
      // For this app, we'll assume ChatMessage component can handle Firestore Timestamp
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp, // Keep as Firestore Timestamp
      } as Message;
    });
    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}
