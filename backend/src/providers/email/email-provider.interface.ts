export interface EmailProviderInterface {
  send(to: string, subject: string, html: string): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}
