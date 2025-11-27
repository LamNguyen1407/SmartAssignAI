export enum MessageType {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}

export interface Message {
    id: string
    type: MessageType
    content: string
    timestamp: Date
}

export interface ChatSession {
  _id: string
  userId: string
  summaryContext?: string
  documentId?: string
  title: string
  createdAt: string
  updatedAt: string
}