import { IFileAccess } from "./file_access_interface.ts";
import { mean, median, mode } from "./statistics.ts";

export class Average {
  constructor(private fileAccess: IFileAccess) {}

  public async computeMeanOfFile(): Promise<number> {
    const numbers: Array<number> = await this.fileAccess.readNumbers();
    return mean(numbers);
  }

  public async computeMedianOfFile(): Promise<number> {
    const numbers: Array<number> = await this.fileAccess.readNumbers();
    return median(numbers);
  }

  public async computeModeOfFile(): Promise<Array<number>> {
    const numbers: Array<number> = await this.fileAccess.readNumbers();
    return mode(numbers);
  }
}
