import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";
import { AUTH_CREDENTIALS } from "../constants/test-data";
import { vi } from "vitest";

// Mock de dependencias
const signUpMock = vi.fn();
vi.mock("../core/auth/supabaseClient", () => ({
  default: {
    auth: {
      signUp: signUpMock,
    },
  },
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe permitir al usuario escribir en los campos de registro", () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(AUTH_CREDENTIALS.EMAIL_LABEL) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(AUTH_CREDENTIALS.PASSWORD_LABEL) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: AUTH_CREDENTIALS.TEST_EMAIL } });
    fireEvent.change(passwordInput, { target: { value: AUTH_CREDENTIALS.TEST_PASSWORD } });

    expect(emailInput.value).toBe(AUTH_CREDENTIALS.TEST_EMAIL);
    expect(passwordInput.value).toBe(AUTH_CREDENTIALS.TEST_PASSWORD);
  });

  it("debe llamar a signUp al hacer clic en el botón de registro", () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByLabelText(AUTH_CREDENTIALS.EMAIL_LABEL);
    const passwordInput = screen.getByLabelText(AUTH_CREDENTIALS.PASSWORD_LABEL);
    const registerButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: AUTH_CREDENTIALS.TEST_EMAIL } });
    fireEvent.change(passwordInput, { target: { value: AUTH_CREDENTIALS.TEST_PASSWORD } });
    fireEvent.click(registerButton);

    expect(signUpMock).toHaveBeenCalledWith({
      email: AUTH_CREDENTIALS.TEST_EMAIL,
      password: AUTH_CREDENTIALS.TEST_PASSWORD,
    });
  });
});
