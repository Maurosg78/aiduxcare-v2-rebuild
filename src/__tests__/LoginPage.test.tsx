import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";
import { AUTH_CREDENTIALS } from "../constants/test-data";
import { vi } from "vitest";

// Mock de dependencias
const signInWithPasswordMock = vi.fn();
vi.mock("../core/auth/supabaseClient", () => ({
  default: {
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe permitir al usuario escribir en los campos de email y contraseña", () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(AUTH_CREDENTIALS.EMAIL_LABEL) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(AUTH_CREDENTIALS.PASSWORD_LABEL) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: AUTH_CREDENTIALS.TEST_EMAIL } });
    fireEvent.change(passwordInput, { target: { value: AUTH_CREDENTIALS.TEST_PASSWORD } });

    expect(emailInput.value).toBe(AUTH_CREDENTIALS.TEST_EMAIL);
    expect(passwordInput.value).toBe(AUTH_CREDENTIALS.TEST_PASSWORD);
  });

  it("debe llamar a signInWithPassword al hacer clic en el botón de login", () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(AUTH_CREDENTIALS.EMAIL_LABEL);
    const passwordInput = screen.getByLabelText(AUTH_CREDENTIALS.PASSWORD_LABEL);
    const loginButton = screen.getByRole("button", { name: AUTH_CREDENTIALS.LOGIN_BUTTON_NAME });

    fireEvent.change(emailInput, { target: { value: AUTH_CREDENTIALS.TEST_EMAIL } });
    fireEvent.change(passwordInput, { target: { value: AUTH_CREDENTIALS.TEST_PASSWORD } });
    fireEvent.click(loginButton);

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: AUTH_CREDENTIALS.TEST_EMAIL,
      password: AUTH_CREDENTIALS.TEST_PASSWORD,
    });
  });
});
