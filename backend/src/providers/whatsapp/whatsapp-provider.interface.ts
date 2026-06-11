export interface WhatsAppProviderInterface {
  send(to: string, message: string): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}
