import { cn } from "../utils";

describe("utils -> cn()", () => {
  it("merges tailwind classes correctly", () => {
    const result = cn("bg-red-500", "text-white");
    expect(result).toBe("bg-red-500 text-white");
  });

  it("handles conditional classes correctly", () => {
    const isTrue = true;
    const isFalse = false;
    
    const result = cn("p-4", isTrue && "bg-blue-500", isFalse && "text-black");
    expect(result).toBe("p-4 bg-blue-500");
  });

  it("resolves tailwind conflicts (tailwind-merge)", () => {
    // p-4 should be overridden by p-8
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("handles arrays and objects (clsx)", () => {
    const result = cn("base-class", ["array-class"], { "obj-class": true, "false-class": false });
    expect(result).toBe("base-class array-class obj-class");
  });
});
