import type { JwtPayload } from 'jsonwebtoken';
import type { Request, Response, RequestHandler } from 'express';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { AppRole } from '@/shared/auth/roles';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RouteContextBase {
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
  auth?: JwtPayload;
}

export interface ExpressRouteContext extends RouteContextBase {
  framework: 'express';
  raw: Request;
  reply: Response;
}

export interface FastifyRouteContext extends RouteContextBase {
  framework: 'fastify';
  raw: FastifyRequest;
  reply: FastifyReply;
}

export type RouteContext = ExpressRouteContext | FastifyRouteContext;

export interface RouteResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string | string[]>;
  raw?: boolean;
}

export type RouteHandler = (ctx: RouteContext) => Promise<RouteResponse> | RouteResponse;

export interface RouteDefinition {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  requiresAuth?: boolean;
  requiredRoles?: AppRole[];
}

export interface ModuleBuildResult {
  routes: RouteDefinition[];
}

export interface ModuleDefinition extends ModuleBuildResult {
  prefix: string;
}

export type ModuleFactory = () => ModuleBuildResult;

export interface GlobalMiddleware {
  express?: RequestHandler;
  fastify?: (instance: FastifyInstance) => Promise<void> | void;
}

export interface HttpServer {
  register(module: ModuleDefinition): void;
  registerGlobalMiddleware(middleware: GlobalMiddleware): void;
  setErrorHandler(handler: unknown): void;
  start(port: number, host: string): Promise<void>;
  stop(): Promise<void>;
}
