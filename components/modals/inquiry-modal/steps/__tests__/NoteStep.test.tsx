import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import NoteStep from "../NoteStep";

describe("NoteStep Component", () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = (errors: any = {}) => {
    return render(<NoteStep register={mockRegister as any} errors={errors} />);
  };

  it("renders the message textarea", () => {
    setup();

    expect(screen.getByText(/3. Special Request/i)).toBeInTheDocument();
    
    // Check for the textarea using its placeholder
    const textarea = screen.getByPlaceholderText(/request a lower bunk bed/i);
    expect(textarea).toBeInTheDocument();
    
    // Verify it was registered with react-hook-form
    expect(mockRegister).toHaveBeenCalledWith("message", expect.any(Object));
  });

  it("displays validation error messages when present", () => {
    const errors = {
      message: { message: "Message must be at least 10 characters long." }
    };
    setup(errors);

    expect(screen.getByText("Message must be at least 10 characters long.")).toBeInTheDocument();
  });

  it("displays XSS validation error message", () => {
    const errors = {
      message: { message: "Special characters like (< > { } [ ]) are not allowed for security reasons." }
    };
    setup(errors);

    expect(screen.getByText("Special characters like (< > { } [ ]) are not allowed for security reasons.")).toBeInTheDocument();
  });

  it("executes validation rules correctly", () => {
    setup();
    // Retrieve the second argument passed to register('message', options)
    const registerCallArgs = mockRegister.mock.calls.find(call => call[0] === 'message');
    expect(registerCallArgs).toBeDefined();
    
    const options = registerCallArgs[1];
    
    // 1. noXss rule
    expect(options.validate.noXss("clean string")).toBe(true);
    expect(options.validate.noXss("string with <script>")).toBe("Special characters like (< > { } [ ]) are not allowed for security reasons.");
    
    // 2. noSql rule
    expect(options.validate.noSql("SELECT * FROM users")).toBe(true);
    expect(options.validate.noSql("regular message")).toBe(true);
    
    // 3. secureContent rule
    expect(options.validate.secureContent("clean string")).toBe(true);
    expect(options.validate.secureContent("I want to SELECT a room")).toBe("Input contains restricted keywords for security.");
  });
});
