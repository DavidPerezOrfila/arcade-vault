export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormState {
  success: boolean;
  error?: string;
}
