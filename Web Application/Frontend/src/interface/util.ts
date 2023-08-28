export interface FormField {
  isInvalid: boolean;
  label: string;
  type?: string;
  value: any;
  setValue: (value: any) => void;
  placeholder?: string;
  invalidMessage: string;
}