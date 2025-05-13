"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import type { Message } from "@/types";
import { generateInitialPrompt } from "@/ai/flows/generate-initial-prompt"; 

// Internal function to get AI response. Errors are handled here or propagated.
async function getAiResponse(userId: string, userMessageText: string, _chatHistory: Message[]): Promise<string> {
  if (!userId) {
    console.error("getAiResponse llamado sin userId.");
    return "Error: No se proporcionó el ID del usuario.";
  }

  try {
    const topic = userMessageText.split(" ").slice(0, 3).join(" ") || "una conversación amistosa";

    console.log("Solicitando a Gemini con topic:", topic);

    const initialPromptResponse = await generateInitialPrompt({ topic });

    console.log("Respuesta completa de Gemini:", initialPromptResponse);

    // Validar que sea un objeto y tenga el campo esperado
    if (initialPromptResponse && typeof initialPromptResponse.initialPrompt === "string") {
      return initialPromptResponse.initialPrompt;
    } else {
      console.warn("La IA no devolvió un prompt válido:", initialPromptResponse);
      return "Lo siento, no pude generar una respuesta en este momento.";
    }

  } catch (error) {
    console.error("Error al obtener respuesta de la IA:", error);
    return "Hubo un error al procesar tu mensaje con la IA.";
  }
}

export async function sendMessageAndGetResponse(userId: string, userMessageText: string, chatHistory: Message[]): Promise<Message | null> {
  if (!userId) {
    console.error("User ID is required to send a message.");
    return null;
  }

  try {
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
    const messagesColRef = collection(db, "users", userId, "messages");
    const docRef = await addDoc(messagesColRef, aiMessageData);
    // For return to client, use a serializable timestamp (Date object)
    const savedTimestamp = new Date(); 
    return { 
        id: docRef.id,
        text: aiMessageData.text,
        sender: aiMessageData.sender,
        userId: aiMessageData.userId,
        timestamp: savedTimestamp 
    } as Message;
  } catch (error) {
    console.error("Error in sendMessageAndGetResponse:", error);
    return null;
  }
}

export async function saveUserMessage(userId: string, messageText: string): Promise<Message | null> {
  if (!userId) {
    console.error("User ID is required to save a message.");
    return null;
  }

  try {
    const userMessageData: Omit<Message, "id" | "timestamp"> & { timestamp: any } = {
      text: messageText,
      sender: 'user',
      userId: userId,
      timestamp: serverTimestamp(), // Use serverTimestamp for writing to Firestore
    };

    const messagesColRef = collection(db, "users", userId, "messages");
    const docRef = await addDoc(messagesColRef, userMessageData);
    // For immediate UI update and return to client, use a serializable timestamp (Date object)
    const savedTimestamp = new Date(); 
    return { 
        id: docRef.id,
        text: userMessageData.text,
        sender: userMessageData.sender,
        userId: userMessageData.userId,
        timestamp: savedTimestamp 
    } as Message;
  } catch (error) {
    console.error("Error in saveUserMessage:", error);
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

