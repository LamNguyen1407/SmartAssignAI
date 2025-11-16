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
  id: string
  title: string
  lastMessage: string
  timestamp: Date

}