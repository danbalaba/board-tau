import { renderHook } from "@testing-library/react";
import { useKYC } from "../useKYC";

describe("useKYC hook", () => {
  it("initializes lightweight KYC hook", () => {
    const { result } = renderHook(() => useKYC());
    expect(result.current.isInitializing).toBe(false);
    expect(result.current.isProcessing).toBe(false);
  });
});
