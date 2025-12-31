import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Specialist, SpecialistStatus } from '../entities/Specialist.entity';
import { AppError } from '../middleware/errorHandler';
import { Repository } from 'typeorm';

interface SpecialistQueryParams {
  page?: number;
  limit?: number;
  status?: SpecialistStatus | 'all';
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
        .leftJoinAndSelect('specialist.media', 'media');

      // Apply status filter
      if (status !== 'all') {
        queryBuilder.where('specialist.status = :status', { status });
      } else {
        // For 'all', we still want to show both draft and published
        queryBuilder.where('1=1');
      }

      // Apply search filter
      if (search) {
        queryBuilder.andWhere(
          '(specialist.name ILIKE :search OR specialist.email ILIKE :search OR specialist.specialization ILIKE :search)',
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

      if (!specialist) {
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

      // Set default status to DRAFT if not provided
      if (!specialistData.status) {
        specialistData.status = SpecialistStatus.DRAFT;
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

      if (!specialist) {
        throw new AppError('Specialist not found', 404);
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

  // Delete specialist
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

      if (!specialist) {
        throw new AppError('Specialist not found', 404);
      }

      await this.specialistRepository.remove(specialist);

      res.status(204).json({
        status: 'success',
        message: 'Specialist deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Publish/Unpublish specialist
  togglePublishStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const specialist = await this.specialistRepository.findOne({
        where: { id },
      });

      if (!specialist) {
        throw new AppError('Specialist not found', 404);
      }

      // Validate status
      if (status && !Object.values(SpecialistStatus).includes(status)) {
        throw new AppError('Invalid status. Use "draft" or "published"', 400);
      }

      // Toggle status if not provided
      if (!status) {
        specialist.status =
          specialist.status === SpecialistStatus.PUBLISHED
            ? SpecialistStatus.DRAFT
            : SpecialistStatus.PUBLISHED;
      } else {
        specialist.status = status;
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

