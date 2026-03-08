import { injectable } from 'tsyringe';

import {
  CreateProjectDto,
  IProjectsRepository,
  PaginatedProjects,
  PaginationInput,
  Project,
  UpdateProjectDto,
} from '@/modules/projects/projects.interface';

@injectable()
export class ProjectsRepository implements IProjectsRepository {
  private readonly rows: Project[] = [];

  async listByUser(userId: string, pagination: PaginationInput): Promise<PaginatedProjects> {
    const filtered = this.rows.filter((item) => item.userId === userId);
    const start = (pagination.page - 1) * pagination.limit;
    const pageData = filtered.slice(start, start + pagination.limit);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pagination.limit));

    return {
      data: pageData,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    };
  }

  async create(userId: string, payload: CreateProjectDto): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      userId,
      name: payload.name,
      description: payload.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.rows.unshift(project);
    return project;
  }

  async findById(userId: string, projectId: string): Promise<Project | null> {
    return this.rows.find((item) => item.userId === userId && item.id === projectId) ?? null;
  }

  async update(
    userId: string,
    projectId: string,
    payload: UpdateProjectDto,
  ): Promise<Project | null> {
    const index = this.rows.findIndex(
      (item) => item.userId === userId && item.id === projectId,
    );
    if (index < 0) {
      return null;
    }

    const current = this.rows[index];
    const updated: Project = {
      ...current,
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      updatedAt: new Date().toISOString(),
    };

    this.rows[index] = updated;
    return updated;
  }

  async delete(userId: string, projectId: string): Promise<boolean> {
    const before = this.rows.length;
    const keep = this.rows.filter((item) => !(item.userId === userId && item.id === projectId));
    this.rows.splice(0, this.rows.length, ...keep);
    return keep.length !== before;
  }
}
