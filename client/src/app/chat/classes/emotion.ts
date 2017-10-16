export class Emotion {
  constructor(
    public lastPredom: string,
    public lastPredomConf: number,
    public lastUtterance: object,
    public averages: number
  ) {
    // Lett blank
  }
}
