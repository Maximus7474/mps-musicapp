export * from './user';
export * from './transfer';
export * from './callbacks';

export type BasicResponse = { success: true } | { success: false; message: string };
