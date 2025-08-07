import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, DeliveryMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PaymentRecord } from './entities/payment-record.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';
import { CartsService } from '../carts/carts.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    private productsService: ProductsService,
    private cartsService: CartsService,
    private dataSource: DataSource,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId?: string,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate order totals
      let subtotal = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productsService.findOne(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        let price = product.price;
        let specs = null;

        if (item.variantId) {
          const variant = product.variants?.find(
            (v) => v.id === item.variantId,
          );
          if (!variant) {
            throw new NotFoundException(`Variant ${item.variantId} not found`);
          }
          if (!variant.canPurchase(item.quantity)) {
            throw new BadRequestException(
              `Variant ${variant.variantTitle || variant.sku} is not available or insufficient stock`,
            );
          }
          price = variant.price;
          specs = variant.specs;
        } else if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Product ${product.name} has insufficient stock`,
          );
        }

        subtotal += price * item.quantity;

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: price,
          specs: specs,
        });
      }

      // Calculate shipping fee based on delivery info
      const shippingFee = createOrderDto.deliveryInfo?.fee || 0;
      const total = subtotal + shippingFee;

      // Create order
      const order = this.orderRepository.create({
        userId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: createOrderDto.paymentMethod,
        deliveryMethod: createOrderDto.deliveryInfo?.method,
        subtotal,
        shippingFee,
        total,
        customerInfo: createOrderDto.customerInfo,
        deliveryInfo: createOrderDto.deliveryInfo,
        notes: createOrderDto.notes,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create order items
      for (const itemData of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...itemData,
          orderId: savedOrder.id,
        });
        await queryRunner.manager.save(orderItem);
      }

      // Clear cart if user is logged in or session is provided
      if (userId || createOrderDto.sessionId) {
        await this.cartsService.clear(userId, createOrderDto.sessionId);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId?: string): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .orderBy('order.createdAt', 'DESC');

    if (userId) {
      query.where('order.userId = :userId', { userId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('order.paymentRecords', 'paymentRecords')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('order.paymentRecords', 'paymentRecords')
      .where('order.orderNumber = :orderNumber', { orderNumber })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (
      updateOrderDto.status === OrderStatus.CANCELLED &&
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Can only cancel pending or processing orders',
      );
    }

    await this.orderRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    const order = await this.findOne(id);

    await this.orderRepository.update(id, {
      paymentStatus,
      status:
        paymentStatus === PaymentStatus.PAID
          ? OrderStatus.PROCESSING
          : order.status,
    });

    return this.findOne(id);
  }

  async cancel(id: string, userId?: string): Promise<Order> {
    const order = await this.findOne(id);

    if (userId && order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Can only cancel pending or processing orders',
      );
    }

    await this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
    });

    return this.findOne(id);
  }

  async createPaymentRecord(
    orderId: string,
    paymentMethod: string,
    amount: number,
  ): Promise<PaymentRecord> {
    const paymentRecord = this.paymentRecordRepository.create({
      orderId,
      paymentMethod,
      amount,
    });

    return this.paymentRecordRepository.save(paymentRecord);
  }

  async updatePaymentRecord(
    id: string,
    data: Partial<PaymentRecord>,
  ): Promise<PaymentRecord> {
    await this.paymentRecordRepository.update(id, data);
    return this.paymentRecordRepository.findOne({ where: { id } });
  }
}
