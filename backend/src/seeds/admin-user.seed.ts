import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user.enum';
import * as bcrypt from 'bcrypt';

export async function seedAdminUser(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // 檢查是否已存在管理員用戶
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@wellmade.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // 創建管理員用戶（不手動加密，讓 Entity 的 @BeforeInsert 處理）
  const adminUser = userRepository.create({
    username: 'admin',
    email: 'admin@wellmade.com',
    password: 'admin123', // 原始密碼，讓 Entity 自動加密
    firstName: 'System',
    lastName: 'Admin',
    roles: [UserRole.ADMIN, UserRole.USER], // 管理員也有用戶權限
    isActive: true,
  });

  await userRepository.save(adminUser);
  console.log('Admin user created:', {
    email: 'admin@wellmade.com',
    password: 'admin123',
    roles: [UserRole.ADMIN, UserRole.USER],
  });
}