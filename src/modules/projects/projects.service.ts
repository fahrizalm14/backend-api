import { inject, injectable } from 'tsyringe';

import { AppError } from '@/core/errors/AppError';
import {
  CreateProjectDto,
  IProjectsRepository,
  PROJECTS_REPOSITORY_TOKEN,
  UpdateProjectDto,
} from '@/modules/projects/projects.interface';

@injectable()
export class ProjectsService {
  constructor(
    @inject(PROJECTS_REPOSITORY_TOKEN)
    private readonly repository: IProjectsRepository,
  ) {}

  async listProjects(userId: string, page: number, limit: number) {
    return this.repository.listByUser(userId, { page, limit });
  }

  async createProject(userId: string, payload: CreateProjectDto) {
    return this.repository.create(userId, payload);
  }

  async getProject(userId: string, projectId: string) {
    return this.requireProject(userId, projectId);
  }

  async updateProject(userId: string, projectId: string, payload: UpdateProjectDto) {
    await this.requireProject(userId, projectId);
    const updated = await this.repository.update(userId, projectId, payload);
    if (!updated) {
      throw new AppError(404, 'Project not found');
    }
    return updated;
  }

  async deleteProject(userId: string, projectId: string) {
    await this.requireProject(userId, projectId);
    const deleted = await this.repository.delete(userId, projectId);
    if (!deleted) {
      throw new AppError(404, 'Project not found');
    }
    return true;
  }

  private async requireProject(userId: string, projectId: string) {
    const project = await this.repository.findById(userId, projectId);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    return project;
  }
}
