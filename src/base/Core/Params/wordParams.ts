import type Params from "./params";

export default class WordParams implements Params {
  word: string;

  constructor(word: string = "") {
    this.word = word;
  }

  toMap(): { [key: string]: any } {
    const data: { [key: string]: any } = {};
    data["word"] = this.word;
    return data;
  }

  validate(): { isValid: boolean; errors: [] } {
    return { isValid: true, errors: [] };
  }

  validateOrThrow(): void {}
}
