import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });

    return this.productRepository.save(product);
  }

  async findAll(filters?: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
  }) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (filters) {
      if (filters.name) {
        queryBuilder.andWhere('product.name LIKE :name', {
          name: `%${filters.name}%`,
        });
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const minPrice = filters.minPrice ?? 0;
        const maxPrice = filters.maxPrice ?? Number.MAX_SAFE_INTEGER;
        queryBuilder.andWhere('CAST(product.price AS DECIMAL) BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      }

      if (filters.categoryId) {
        queryBuilder.andWhere('product.categoryId = :categoryId', {
          categoryId: filters.categoryId,
        });
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
} 