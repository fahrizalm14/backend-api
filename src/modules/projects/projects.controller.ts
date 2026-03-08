import { inject, injectable } from 'tsyringe';

import { AppError } from '@/core/errors/AppError';
import { BaseController } from '@/core/http/BaseController';
import { RouteContext, RouteResponse } from '@/core/http/types';
import { ProjectsService } from '@/modules/projects/projects.service';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from '@/modules/projects/projects.validation';

@injectable()
export class ProjectsController extends BaseController {
  constructor(@inject(ProjectsService) private readonly service: ProjectsService) {
    super();
  }

  async list(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    const query = listProjectsQuerySchema.safeParse(ctx.query);
    if (!query.success) {
      throw new AppError(400, query.error.issues[0]?.message ?? 'Invalid query');
    }

    const result = await this.service.listProjects(
      userId,
      query.data.page,
      query.data.limit,
    );
    return this.ok(result, 'Projects retrieved successfully');
  }

  async create(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    const payload = createProjectSchema.safeParse(ctx.body);
    if (!payload.success) {
      throw new AppError(400, payload.error.issues[0]?.message ?? 'Invalid payload');
    }

    const project = await this.service.createProject(userId, payload.data);
    return this.created(project, 'Project created successfully');
  }

  async detail(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    const projectId = this.requireParam(ctx, 'projectId');
    const project = await this.service.getProject(userId, projectId);
    return this.ok(project, 'Project retrieved successfully');
  }

  async update(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    const projectId = this.requireParam(ctx, 'projectId');
    const payload = updateProjectSchema.safeParse(ctx.body);
    if (!payload.success) {
      throw new AppError(400, payload.error.issues[0]?.message ?? 'Invalid payload');
    }

    const project = await this.service.updateProject(userId, projectId, payload.data);
    return this.ok(project, 'Project updated successfully');
  }

  async remove(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    const projectId = this.requireParam(ctx, 'projectId');
    const deleted = await this.service.deleteProject(userId, projectId);
    return this.ok(deleted, 'Project deleted successfully');
  }

  private requireParam(ctx: RouteContext, key: string): string {
    const value = ctx.params[key];
    if (!value) {
      throw new AppError(400, `${key} is required`);
    }
    return value;
  }
}
