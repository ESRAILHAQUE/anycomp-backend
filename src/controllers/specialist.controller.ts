import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Specialist } from "../entities/Specialist.entity";
import { Media } from "../entities/Media.entity";
import { ServiceOffering } from "../entities/ServiceOffering.entity";
import { AppError } from "../middleware/errorHandler";
import { Repository } from "typeorm";
import path from "path";

interface SpecialistQueryParams {
  page?: number;
  limit?: number;
  status?: "all" | "draft" | "published";
  search?: string;
}

export class SpecialistController {
  private specialistRepository: Repository<Specialist>;
  private mediaRepository: Repository<Media>;
  private serviceOfferingRepository: Repository<ServiceOffering>;

  constructor() {
    this.specialistRepository = AppDataSource.getRepository(Specialist);
    this.mediaRepository = AppDataSource.getRepository(Media);
    this.serviceOfferingRepository =
      AppDataSource.getRepository(ServiceOffering);
  }

  private ensureUniqueSlug = async (
    baseSlug: string,
    excludeSpecialistId?: string
  ): Promise<string> => {
    let slug = baseSlug;
    let suffix = 0;
    const maxAttempts = 100;
    for (let i = 0; i < maxAttempts; i++) {
      const qb = this.specialistRepository
        .createQueryBuilder("s")
        .where("s.slug = :slug", { slug });
      if (excludeSpecialistId) {
        qb.andWhere("s.id != :id", { id: excludeSpecialistId });
      }
      const existing = await qb.getOne();
      if (!existing) return slug;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    return `${baseSlug}-${Date.now()}`;
  };

  // Get all specialists with filters, search, and pagination
  getAllSpecialists = async (
    req: Request<{}, {}, {}, SpecialistQueryParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page = 1, limit = 10, status = "all", search = "" } = req.query;

      const pageNumber = parseInt(page.toString());
      const limitNumber = parseInt(limit.toString());
      const skip = (pageNumber - 1) * limitNumber;

      // Build query
      const queryBuilder = this.specialistRepository
        .createQueryBuilder("specialist")
        .leftJoinAndSelect("specialist.service_offerings", "services")
        .leftJoinAndSelect("specialist.media", "media")
        .where("specialist.deleted_at IS NULL");

      // Apply status filter (is_draft)
      if (status === "draft") {
        queryBuilder.andWhere("specialist.is_draft = :isDraft", {
          isDraft: true,
        });
      } else if (status === "published") {
        queryBuilder.andWhere("specialist.is_draft = :isDraft", {
          isDraft: false,
        });
      }

      // Apply search filter
      if (search) {
        queryBuilder.andWhere(
          "(specialist.title ILIKE :search OR specialist.description ILIKE :search OR specialist.slug ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const specialists = await queryBuilder
        .orderBy("specialist.created_at", "DESC")
        .skip(skip)
        .take(limitNumber)
        .getMany();

      res.status(200).json({
        status: "success",
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
        relations: ["service_offerings", "media"],
      });

      if (!specialist || specialist.deleted_at) {
        throw new AppError("Specialist not found", 404);
      }

      res.status(200).json({
        status: "success",
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
      // Handle both JSON and FormData
      let specialistData: any = {};

      if (req.body.data) {
        // If data is sent as JSON string in FormData
        try {
          specialistData =
            typeof req.body.data === "string"
              ? JSON.parse(req.body.data)
              : req.body.data;
        } catch (parseError) {
          throw new AppError("Invalid JSON data in FormData", 400);
        }
      } else {
        // Regular JSON request
        specialistData = req.body;
      }

      // Validate required fields
      if (!specialistData.title) {
        throw new AppError("Title is required", 400);
      }
      if (
        !specialistData.base_price ||
        isNaN(parseFloat(specialistData.base_price))
      ) {
        throw new AppError("Base price must be a valid number", 400);
      }
      if (
        !specialistData.duration_days ||
        !Number.isInteger(parseInt(specialistData.duration_days))
      ) {
        throw new AppError("Duration days must be a valid integer", 400);
      }

      // Generate slug from title if not provided, and ensure uniqueness to avoid duplicate key
      if (specialistData.title && !specialistData.slug) {
        const baseSlug = specialistData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        specialistData.slug = await this.ensureUniqueSlug(baseSlug);
      }

      // Set default is_draft to true if not provided
      if (specialistData.is_draft === undefined) {
        specialistData.is_draft = true;
      }

      // Calculate final_price if base_price and platform_fee are provided
      if (specialistData.base_price && specialistData.platform_fee) {
        specialistData.final_price =
          parseFloat(specialistData.base_price) +
          parseFloat(specialistData.platform_fee);
      } else if (specialistData.base_price) {
        specialistData.final_price = parseFloat(specialistData.base_price);
      }

      const specialist = this.specialistRepository.create(specialistData);
      const savedSpecialist = (await this.specialistRepository.save(
        specialist
      )) as unknown as Specialist;

      // Handle image uploads if files are present
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const specialistId = savedSpecialist.id;
        const mediaPromises = (req.files as Express.Multer.File[]).map(
          async (file: any, index) => {
            // Check if file has Cloudinary URL (production) or local path (development)
            let filePath: string;

            // Cloudinary upload - check multiple possible properties
            if (file.secure_url) {
              // Cloudinary secure URL (preferred)
              filePath = file.secure_url;
            } else if (file.url) {
              // Cloudinary URL (fallback)
              filePath = file.url;
            } else if (file.path && file.path.startsWith("http")) {
              // Cloudinary URL in path property
              filePath = file.path;
            } else if (file.filename) {
              // Local upload - construct local path
              filePath = `/uploads/${file.filename}`;
            } else {
              // Fallback
              filePath = file.originalname;
            }

            const media = this.mediaRepository.create({
              specialists: specialistId,
              file_name: file.originalname || "image",
              file_path: filePath,
              file_size: file.size || file.bytes || 0,
              display_order: index,
              mime_type: file.mimetype as any,
              media_type: "image" as any,
              uploaded_at: new Date(),
            });
            return await this.mediaRepository.save(media);
          }
        );

        await Promise.all(mediaPromises);
      }

      // Handle direct Cloudinary uploads (URLs sent from client)
      if (
        Array.isArray(specialistData.media_urls) &&
        specialistData.media_urls.length > 0
      ) {
        const specialistId = savedSpecialist.id;
        const urls = specialistData.media_urls.slice(0, 3);
        const urlPromises = urls.map(async (url: string, index: number) => {
          if (!url) return null;
          const media = this.mediaRepository.create({
            specialists: specialistId,
            file_name: `image-${index + 1}`,
            file_path: url,
            file_size: 0,
            display_order: index,
            mime_type: undefined as any,
            media_type: "image" as any,
            uploaded_at: new Date(),
          });
          return await this.mediaRepository.save(media);
        });
        await Promise.all(urlPromises.filter(Boolean) as Promise<any>[]);
      }

      // Handle service offerings if provided
      if (
        specialistData.service_offerings &&
        Array.isArray(specialistData.service_offerings) &&
        specialistData.service_offerings.length > 0
      ) {
        const offeringPromises = specialistData.service_offerings.map(
          async (offering: any) => {
            const serviceOffering = this.serviceOfferingRepository.create({
              specialists: savedSpecialist.id,
              name: offering.name || "",
              description: offering.description || "",
            });
            return await this.serviceOfferingRepository.save(serviceOffering);
          }
        );

        await Promise.all(offeringPromises);
      }

      // Reload specialist with relations
      const specialistId = savedSpecialist.id;
      const specialistWithMedia = await this.specialistRepository.findOne({
        where: { id: specialistId },
        relations: ["service_offerings", "media"],
      });

      res.status(201).json({
        status: "success",
        data: { specialist: specialistWithMedia },
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
      // Support both JSON and multipart/form-data ("data" JSON string)
      let updateData: any = { ...req.body };
      if (updateData?.data) {
        try {
          const parsed =
            typeof updateData.data === "string"
              ? JSON.parse(updateData.data)
              : updateData.data;
          updateData = { ...updateData, ...parsed };
        } catch (e) {
          throw new AppError("Invalid data format", 400);
        }
        delete updateData.data;
      }

      const specialist = await this.specialistRepository.findOne({
        where: { id },
      });

      if (!specialist || specialist.deleted_at) {
        throw new AppError("Specialist not found", 404);
      }

      const serviceOfferingsPayload = Array.isArray(
        updateData.service_offerings
      )
        ? updateData.service_offerings
        : undefined;
      delete updateData.service_offerings;

      // Update slug if title changed, and ensure uniqueness to avoid duplicate key
      if (updateData.title && updateData.title !== specialist.title) {
        const baseSlug = updateData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        updateData.slug = await this.ensureUniqueSlug(baseSlug, id);
      }

      // Recalculate final_price if base_price or platform_fee changed
      if (
        updateData.base_price !== undefined ||
        updateData.platform_fee !== undefined
      ) {
        const basePrice =
          updateData.base_price !== undefined
            ? parseFloat(updateData.base_price)
            : parseFloat(specialist.base_price.toString());
        const platformFee =
          updateData.platform_fee !== undefined
            ? parseFloat(updateData.platform_fee)
            : parseFloat((specialist.platform_fee || 0).toString());
        updateData.final_price = basePrice + platformFee;
      }

      // Update specialist (no service_offerings in updateData)
      Object.assign(specialist, updateData);
      const updatedSpecialist = await this.specialistRepository.save(
        specialist
      );

      // Replace service offerings: remove existing, create new with specialists = id
      if (serviceOfferingsPayload !== undefined) {
        await this.serviceOfferingRepository.delete({ specialists: id });
        if (serviceOfferingsPayload.length > 0) {
          const offeringPromises = serviceOfferingsPayload.map(
            async (offering: { name?: string; description?: string }) => {
              const serviceOffering = this.serviceOfferingRepository.create({
                specialists: id,
                name: offering.name || "",
                description: offering.description || "",
              });
              return await this.serviceOfferingRepository.save(serviceOffering);
            }
          );
          await Promise.all(offeringPromises);
        }
      }

      // Handle image uploads for update (image0, image1, image2)
      const filesByField = req.files as
        | Record<string, Express.Multer.File[]>
        | undefined;
      if (filesByField && !Array.isArray(filesByField)) {
        const fieldNames = ["image0", "image1", "image2"] as const;
        const mediaPromises = fieldNames
          .map((fieldName, displayOrder) => {
            const fileArr = filesByField[fieldName];
            const file: any = fileArr && fileArr.length > 0 ? fileArr[0] : null;
            if (!file) return null;

            return (async () => {
              // Remove existing media for that slot (keep other slots)
              await this.mediaRepository.delete({
                specialists: id,
                display_order: displayOrder,
              });

              let filePath: string;
              if (file.secure_url) {
                filePath = file.secure_url;
              } else if (file.url) {
                filePath = file.url;
              } else if (file.path && file.path.startsWith("http")) {
                filePath = file.path;
              } else if (file.filename) {
                filePath = `/uploads/${file.filename}`;
              } else {
                filePath = file.originalname;
              }

              const media = this.mediaRepository.create({
                specialists: id,
                file_name: file.originalname || "image",
                file_path: filePath,
                file_size: file.size || file.bytes || 0,
                display_order: displayOrder,
                mime_type: file.mimetype as any,
                media_type: "image" as any,
                uploaded_at: new Date(),
              });
              return await this.mediaRepository.save(media);
            })();
          })
          .filter(Boolean) as Promise<any>[];

        if (mediaPromises.length > 0) {
          await Promise.all(mediaPromises);
        }
      }

      // Handle direct Cloudinary uploads on update (media_urls[0..2])
      if (
        Array.isArray(updateData.media_urls) &&
        updateData.media_urls.length > 0
      ) {
        const urls = updateData.media_urls.slice(0, 3);
        for (let displayOrder = 0; displayOrder < urls.length; displayOrder++) {
          const url = urls[displayOrder];
          if (!url) continue;
          await this.mediaRepository.delete({
            specialists: id,
            display_order: displayOrder,
          });
          const media = this.mediaRepository.create({
            specialists: id,
            file_name: `image-${displayOrder + 1}`,
            file_path: url,
            file_size: 0,
            display_order: displayOrder,
            mime_type: undefined as any,
            media_type: "image" as any,
            uploaded_at: new Date(),
          });
          await this.mediaRepository.save(media);
        }
      }

      // Reload specialist with relations for response
      const specialistWithRelations = await this.specialistRepository.findOne({
        where: { id },
        relations: ["service_offerings", "media"],
      });

      res.status(200).json({
        status: "success",
        data: { specialist: specialistWithRelations ?? updatedSpecialist },
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
        throw new AppError("Specialist not found", 404);
      }

      // Soft delete
      specialist.deleted_at = new Date();
      await this.specialistRepository.save(specialist);

      res.status(204).json({
        status: "success",
        message: "Specialist deleted successfully",
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
        throw new AppError("Specialist not found", 404);
      }

      // Toggle is_draft if not provided
      if (is_draft === undefined) {
        specialist.is_draft = !specialist.is_draft;
      } else {
        specialist.is_draft = is_draft;
      }

      const updatedSpecialist = await this.specialistRepository.save(
        specialist
      );

      res.status(200).json({
        status: "success",
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
