import { renderHook } from "@testing-library/react";
import { useBreadcrumbs } from "../use-breadcrumbs";
import { usePathname } from "next/navigation";

// Mock Next.js usePathname
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("useBreadcrumbs", () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns predefined breadcrumbs for exact route matches", () => {
    mockUsePathname.mockReturnValue("/dashboard/employee");

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { title: "Dashboard", link: "/dashboard" },
      { title: "Employee", link: "/dashboard/employee" },
    ]);
  });

  it("returns predefined breadcrumbs for /dashboard", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { title: "Dashboard", link: "/dashboard" },
    ]);
  });

  it("generates breadcrumbs dynamically for unknown paths", () => {
    mockUsePathname.mockReturnValue("/settings/security/passwords");

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { title: "Settings", link: "/settings" },
      { title: "Security", link: "/settings/security" },
      { title: "Passwords", link: "/settings/security/passwords" },
    ]);
  });

  it("handles empty or root path gracefully", () => {
    mockUsePathname.mockReturnValue("/");

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([]);
  });
});
