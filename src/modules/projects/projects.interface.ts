export const PROJECTS_REPOSITORY_TOKEN = Symbol('PROJECTS_REPOSITORY_TOKEN');

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IProjectsRepository {
  listByUser(userId: string, pagination: PaginationInput): Promise<PaginatedProjects>;
  create(userId: string, payload: CreateProjectDto): Promise<Project>;
  findById(userId: string, projectId: string): Promise<Project | null>;
  update(
    userId: string,
    projectId: string,
    payload: UpdateProjectDto,
  ): Promise<Project | null>;
  delete(userId: string, projectId: string): Promise<boolean>;
}
