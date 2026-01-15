// Quick local declarations to avoid type-check failures when dev deps aren't installed
declare module 'express';
declare module 'cors';
declare module 'dotenv';
declare module 'body-parser';
declare module '@google/genai';
declare module 'morgan';
declare module 'express-rate-limit';
declare module 'swagger-ui-express';
declare module 'better-sqlite3';
declare module 'bcryptjs';
declare module 'jsonwebtoken';

// Minimal process declaration for simple usage in dev
declare const process: any;
// Allow using require in this small server file without installing @types/node
declare var require: any;