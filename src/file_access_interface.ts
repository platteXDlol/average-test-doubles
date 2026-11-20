export interface IFileAccess {
  readNumbers(): Promise<Array<number>>;
}