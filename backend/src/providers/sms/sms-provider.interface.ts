export interface SmsProviderInterface {
  send(to: string, message: string): Promise<boolean>;
  getBalance(): Promise<number>;
  healthCheck(): Promise<boolean>;
}
