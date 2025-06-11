import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany('CartItem', 'cart', { 
    cascade: true,
    eager: true 
  })
  items: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 計算總金額
  get total(): number {
    if (!this.items || this.items.length === 0) {
      return 0;
    }
    return this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  // 計算商品總數量
  get itemCount(): number {
    if (!this.items || this.items.length === 0) {
      return 0;
    }
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
