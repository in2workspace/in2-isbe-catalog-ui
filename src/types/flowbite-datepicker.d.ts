declare module 'flowbite-datepicker/Datepicker' {
  export interface DatepickerOptions {
    autohide?: boolean;
    format?: string;
    [key: string]: unknown;
  }

  export default class Datepicker {
    constructor(element: HTMLElement, options?: DatepickerOptions);
    destroy(): void;
  }
}
