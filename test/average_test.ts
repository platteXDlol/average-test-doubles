import { assertEquals } from "@std/assert";
import { Average } from "../src/average.ts";
import { FileAccess } from "../src/file_access.ts";
import { IFileAccess } from "../src/file_access_interface.ts";

class FakeFileAccess implements IFileAccess {
  private readonly files = new Map<string, Array<number>>();

  constructor(private readonly path: string) {}

  public addFile(path: string, numbers: Array<number>): void {
    this.files.set(path, [...numbers]);
  }

  public async readNumbers(): Promise<Array<number>> {
    const numbers = this.files.get(this.path);
    if (numbers === undefined) {
      throw new Error(`No fake file configured for path: ${this.path}`);
    }
    return [...numbers];
  }
}

class HardCodedStub implements IFileAccess {
  public async readNumbers(): Promise<Array<number>> {
    return [1, 2, 3, 4, 5];
  }
}

class ConfigurableStub implements IFileAccess {
  constructor(private readonly numbers: Array<number>) {}

  public async readNumbers(): Promise<Array<number>> {
    return [...this.numbers];
  }
}

class MockFileAccess implements IFileAccess {
  public callCount = 0;

  public async readNumbers(): Promise<Array<number>> {
    this.callCount++;
    return [1, 2, 3, 4, 5];
  }
}

class SpyFileAccess implements IFileAccess {
  public callCount = 0;
  public readonly returnedValues: Array<Array<number>> = [];

  constructor(private readonly fileAccess: FileAccess) {}

  public async readNumbers(): Promise<Array<number>> {
    this.callCount++;
    const numbers = await this.fileAccess.readNumbers();
    this.returnedValues.push([...numbers]);
    return numbers;
  }
}

Deno.test("Average uses a fake file access", async () => {
  const fake = new FakeFileAccess("/path/to/some/file");
  fake.addFile("/path/to/some/file", [1, 2, 3, 4, 5]);

  const average = new Average(fake);

  assertEquals(await average.computeMeanOfFile(), 3);
});

Deno.test("Average uses a hard-coded stub", async () => {
  const average = new Average(new HardCodedStub());

  assertEquals(await average.computeMeanOfFile(), 3);
});

Deno.test("Average uses a configurable stub", async () => {
  const average = new Average(new ConfigurableStub([1, 2, 3, 4, 5]));

  assertEquals(await average.computeMeanOfFile(), 3);
});

Deno.test("Average calls the mock exactly once", async () => {
  const mock = new MockFileAccess();
  const average = new Average(mock);

  assertEquals(await average.computeMeanOfFile(), 3);
  assertEquals(mock.callCount, 1);
});

Deno.test("Average uses FileAccess through a spy", async () => {
  const path = await Deno.makeTempFile();
  try {
    await Deno.writeTextFile(path, "7\n34\n2\n");

    const spy = new SpyFileAccess(new FileAccess(path));
    const average = new Average(spy);

    assertEquals(await average.computeMeanOfFile(), 43 / 3);
    assertEquals(spy.callCount, 1);
    assertEquals(spy.returnedValues, [[7, 34, 2]]);
  } finally {
    await Deno.remove(path);
  }
});
