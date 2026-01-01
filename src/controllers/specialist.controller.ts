import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Specialist } from '../entities/Specialist.entity';
import { AppError } from '../middleware/errorHandler';
import { Repository } from 'typeorm';

interface SpecialistQueryParams {
  page?: number;
  limit?: number;
  status?: 'all' | 'draft' | 'published';
  search?: string;
}

export class SpecialistController {
  private specialistRepository: Repository<Specialist>;

  constructor() {
    this.specialistRepository = AppDataSource.getRepository(Specialist);
  }

  // Get all specialists with filters, search, and pagination
  getAllSpecialists = async (
    req: Request<{}, {}, {}, SpecialistQueryParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'all',
        search = '',
      } = req.query;

      const pageNumber = parseInt(page.toString());
      const limitNumber = parseInt(limit.toString());
      const skip = (pageNumber - 1) * limitNumber;

      // Build query
      const queryBuilder = this.specialistRepository
        .createQueryBuilder('specialist')
        .leftJoinAndSelect('specialist.service_offerings', 'services')
        .leftJoinAndSelect('specialist.media', 'media')
        .where('specialist.deleted_at IS NULL');

      // Apply status filter (is_draft)
      if (status === 'draft') {
        queryBuilder.andWhere('specialist.is_draft = :isDraft', { isDraft: true });
      } else if (status === 'published') {
        queryBuilder.andWhere('specialist.is_draft = :isDraft', { isDraft: false });
      }
      // For 'all', show both draft and published

      // Apply search filter
      if (search) {
        queryBuilder.andWhere(
          '(specialist.title ILIKE :search OR specialist.description ILIKE :search OR specialist.slug ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const specialists = await queryBuilder
        .orderBy('specialist.created_at', 'DESC')
        .skip(skip)
        .take(limitNumber)
        .getMany();

      res.status(200).json({
        status: 'success',
        data: {
          specialists,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get specialist by ID
  getSpecialistById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const specialist = await this.specialistRepository.findOne({
        where: { id },
        relations: ['service_offerings', 'media'],
      });

      if (!specialist || specialist.deleted_at) {
        throw new AppError('Specialist not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { specialist },
      });
    } catch (error) {
      next(error);
    }
  };

  // Create new specialist
  createSpecialist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const specialistData = req.body;

      // Generate slug from title if not provided
      if (specialistData.title && !specialistData.slug) {
        specialistData.slug = specialistData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Set default is_draft to true if not provided
      if (specialistData.is_draft === undefined) {
        specialistData.is_draft = true;
      }

      // Calculate final_price if base_price and platform_fee are provided
      if (specialistData.base_price && specialistData.platform_fee) {
        specialistData.final_price = parseFloat(specialistData.base_price) + parseFloat(specialistData.platform_fee);
      } else if (specialistData.base_price) {
        specialistData.final_price = parseFloat(specialistData.base_price);
      }

      const specialist = this.specialistRepository.create(specialistData);
      const savedSpecialist = await this.specialistRepository.save(specialist);

      res.status(201).json({
        status: 'success',
        data: { specialist: savedSpecialist },
      });
    } catch (error) {
      if (error instanceof Error) {
        next(new AppError(error.message, 400));
      } else {
        next(error);
      }
    }
  };

  // Update specialist
  updateSpecialist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const specialist = await this.specialistRepository.findOne({
        where: { id },
      });

      if (!specialist || specialist.deleted_at) {
        throw new AppError('Specialist not found', 404);
      }

      // Update slug if title changed
      if (updateData.title && updateData.title !== specialist.title) {
        updateData.slug = updateData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Recalculate final_price if base_price or platform_fee changed
      if (updateData.base_price !== undefined || updateData.platform_fee !== undefined) {
        const basePrice = updateData.base_price !== undefined 
          ? parseFloat(updateData.base_price) 
          : parseFloat(specialist.base_price.toString());
        const platformFee = updateData.platform_fee !== undefined 
          ? parseFloat(updateData.platform_fee) 
          : parseFloat((specialist.platform_fee || 0).toString());
        updateData.final_price = basePrice + platformFee;
      }

      // Update specialist
      Object.assign(specialist, updateData);
      const updatedSpecialist = await this.specialistRepository.save(specialist);

      res.status(200).json({
        status: 'success',
        data: { specialist: updatedSpecialist },
      });
    } catch (error) {
      if (error instanceof Error) {
        next(new AppError(error.message, 400));
      } else {
        next(error);
      }
    }
  };

  // Delete specialist (soft delete)
  deleteSpecialist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const specialist = await this.specialistRepository.findOne({
        where: { id },
      });

      if (!specialist || specialist.deleted_at) {
        throw new AppError('Specialist not found', 404);
      }

      // Soft delete
      specialist.deleted_at = new Date();
      await this.specialistRepository.save(specialist);

      res.status(204).json({
        status: 'success',
        message: 'Specialist deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Toggle publish status (is_draft)
  togglePublishStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { is_draft } = req.body;

      const specialist = await this.specialistRepository.findOne({
        where: { id },
      });

      if (!specialist || specialist.deleted_at) {
        throw new AppError('Specialist not found', 404);
      }

      // Toggle is_draft if not provided
      if (is_draft === undefined) {
        specialist.is_draft = !specialist.is_draft;
      } else {
        specialist.is_draft = is_draft;
      }

      const updatedSpecialist = await this.specialistRepository.save(specialist);

      res.status(200).json({
        status: 'success',
        data: { specialist: updatedSpecialist },
      });
    } catch (error) {
      if (error instanceof Error) {
        next(new AppError(error.message, 400));
      } else {
        next(error);
      }
    }
  };
}
