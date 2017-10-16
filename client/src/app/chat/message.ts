export class ChatMessage {
  constructor(
    public message: string,
    public speaker: string,
    public index: number,
    public type: string,
    public score: number
  ) {
    // Lett blank
  }
}
