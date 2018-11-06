export class ChatMessage {
  constructor(
    public message: string,
    public speaker: string,
    public index: number,
    public emotion: string,
    public emoConfidence: number,
    public emoStrong: boolean,
    public score: number,
    public type: string
  ) {
    // Lett blank
  }
}
