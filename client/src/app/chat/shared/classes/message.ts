export class ChatMessage {
  constructor(
    public message: string,
    public speaker: string,
    public type: string,
    public emotion?: string,
    public emotionStrong?: boolean,
    public score?: number,
  ) {
    // Lett blank
  }
}
