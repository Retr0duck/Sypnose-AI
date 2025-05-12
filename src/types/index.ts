import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

export interface UserProfile extends FirebaseUser {
  // Add any custom profile properties here if needed in future
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Timestamp | Date | number; // Store as Firestore Timestamp, allow Date/number for new messages
  userId: string;
}
