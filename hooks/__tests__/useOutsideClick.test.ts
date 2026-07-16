import { renderHook, act } from "@testing-library/react";
import { useOutsideClick } from "../useOutsideClick";

describe("useOutsideClick hook", () => {
  it("calls action when clicking outside the element", () => {
    const mockAction = jest.fn();
    
    const { result } = renderHook(() => 
      useOutsideClick({ action: mockAction })
    );

    // Mock a div ref
    const div = document.createElement("div");
    result.current.ref.current = div;
    document.body.appendChild(div);

    // Click outside (on the body)
    act(() => {
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    
    // Clean up
    document.body.removeChild(div);
  });

  it("does not call action when clicking inside the element", () => {
    const mockAction = jest.fn();
    
    const { result } = renderHook(() => 
      useOutsideClick({ action: mockAction })
    );

    const div = document.createElement("div");
    result.current.ref.current = div;
    document.body.appendChild(div);

    // Click inside the div
    act(() => {
      div.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockAction).not.toHaveBeenCalled();
    
    document.body.removeChild(div);
  });

  it("does not call action if enable is false", () => {
    const mockAction = jest.fn();
    
    const { result } = renderHook(() => 
      useOutsideClick({ action: mockAction, enable: false })
    );

    const div = document.createElement("div");
    result.current.ref.current = div;
    document.body.appendChild(div);

    // Click outside
    act(() => {
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockAction).not.toHaveBeenCalled();
    
    document.body.removeChild(div);
  });

  it("does not call action if clicked element is removed from DOM", () => {
    const mockAction = jest.fn();
    
    const { result } = renderHook(() => 
      useOutsideClick({ action: mockAction })
    );

    const div = document.createElement("div");
    result.current.ref.current = div;
    document.body.appendChild(div);

    // Create an element that is NOT in the document
    const detachedElement = document.createElement("button");

    act(() => {
      detachedElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Should not trigger because detachedElement is not in document
    expect(mockAction).not.toHaveBeenCalled();
    
    document.body.removeChild(div);
  });
});
