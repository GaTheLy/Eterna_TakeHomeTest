import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProjectDto } from './create-project.dto';
import { UpdateProjectDto } from './update-project.dto';
import { ProjectQueryDto } from './project-query.dto';
import { ProjectStatus } from '../entities/project.entity';

describe('Project DTOs Validation', () => {
  describe('CreateProjectDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 'Valid Project Name',
        description: 'Valid description',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation without optional description', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 'Valid Project Name',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when name is empty', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: '',
        description: 'Valid description',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when name is missing', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        description: 'Valid description',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name exceeds 255 characters', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 'a'.repeat(256),
        description: 'Valid description',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation when description exceeds 5000 characters', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 'Valid Project Name',
        description: 'a'.repeat(5001),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation when name is not a string', async () => {
      const dto = plainToInstance(CreateProjectDto, {
        name: 123,
        description: 'Valid description',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('UpdateProjectDto', () => {
    it('should pass validation with all fields', async () => {
      const dto = plainToInstance(UpdateProjectDto, {
        name: 'Updated Name',
        description: 'Updated description',
        status: ProjectStatus.ACTIVE,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only name', async () => {
      const dto = plainToInstance(UpdateProjectDto, {
        name: 'Updated Name',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only description', async () => {
      const dto = plainToInstance(UpdateProjectDto, {
        description: 'Updated description',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only status', async () => {
      const dto = plainToInstance(UpdateProjectDto, {
        status: ProjectStatus.ARCHIVED,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty object (all fields optional)', async () => {
      const dto = plainToInstance(UpdateProjectDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when name exceeds 255 characters', async () => {
      const dto = plainToInstance(UpdateProjectDto, {
        name: 'a'.repeat(256),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation when description exceeds 5000 characters', async () => {
      const dto = plainToInstance(UpdateProjectDto, {
        description: 'a'.repeat(5001),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation when status is invalid', async () => {
      const dto = plainToInstance(UpdateProjectDto, {
        status: 'INVALID_STATUS' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('ProjectQueryDto', () => {
    it('should pass validation with all fields', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        page: 1,
        limit: 10,
        search: 'test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with default values', async () => {
      const dto = plainToInstance(ProjectQueryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only page', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        page: 2,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only limit', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        limit: 20,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only search', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        search: 'project name',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when page is less than 1', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        page: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when limit is less than 1', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when limit exceeds 100', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        limit: 101,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when page is not an integer', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        page: 1.5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when limit is not an integer', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        limit: 10.5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should transform string numbers to integers', async () => {
      const dto = plainToInstance(ProjectQueryDto, {
        page: '2',
        limit: '20',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.limit).toBe('number');
    });
  });
});
