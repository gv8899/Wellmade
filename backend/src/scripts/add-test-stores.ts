import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConvenienceStore } from '../logistics/entities/convenience-store.entity';
import { ConvenienceStoreType } from '../logistics/interfaces/newebpay-logistics.interface';

async function addTestStores() {
  console.log('開始新增全家便利商店測試資料...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const storeRepository = app.get<Repository<ConvenienceStore>>(
    getRepositoryToken(ConvenienceStore)
  );

  const testStores = [
    {
      storeId: 'FM001',
      storeName: '全家台北車站店',
      storeType: ConvenienceStoreType.FAMILY_MART,
      storeAddress: '北平西路3號',
      latitude: 25.0478,
      longitude: 121.5170,
      address: '台北市中正區北平西路3號',
      phone: '02-2361-1234',
      storeTelephone: '02-2361-1234',
      city: '台北市',
      district: '中正區',
      area: '中正區',
      services: ['ATM', '影印', '咖啡'],
      businessHours: '24小時',
      operatingHours: '24小時',
      lastUpdated: new Date()
    },
    {
      storeId: 'FM002',
      storeName: '全家信義威秀店',
      storeType: ConvenienceStoreType.FAMILY_MART,
      storeAddress: '松壽路20號',
      latitude: 25.0369,
      longitude: 121.5645,
      address: '台北市信義區松壽路20號',
      phone: '02-2723-5678',
      storeTelephone: '02-2723-5678',
      city: '台北市',
      district: '信義區',
      area: '信義區',
      services: ['ATM', '影印', '代收'],
      businessHours: '24小時',
      operatingHours: '24小時',
      lastUpdated: new Date()
    },
    {
      storeId: 'FM003',
      storeName: '全家西門町店',
      storeType: ConvenienceStoreType.FAMILY_MART,
      storeAddress: '成都路10號',
      latitude: 25.0421,
      longitude: 121.5067,
      address: '台北市萬華區成都路10號',
      phone: '02-2311-9876',
      storeTelephone: '02-2311-9876',
      city: '台北市',
      district: '萬華區',
      area: '萬華區',
      services: ['ATM', '咖啡'],
      businessHours: '06:00-24:00',
      operatingHours: '06:00-24:00',
      lastUpdated: new Date()
    },
    {
      storeId: 'FM004',
      storeName: '全家師大店',
      storeType: ConvenienceStoreType.FAMILY_MART,
      storeAddress: '師大路93號',
      latitude: 25.0259,
      longitude: 121.5270,
      address: '台北市大安區師大路93號',
      phone: '02-2363-4567',
      storeTelephone: '02-2363-4567',
      city: '台北市',
      district: '大安區',
      area: '大安區',
      services: ['ATM', '影印', '咖啡', '宅配'],
      businessHours: '24小時',
      operatingHours: '24小時',
      lastUpdated: new Date()
    },
    {
      storeId: 'FM005',
      storeName: '全家忠孝復興店',
      storeType: ConvenienceStoreType.FAMILY_MART,
      storeAddress: '忠孝東路四段181號',
      latitude: 25.0417,
      longitude: 121.5430,
      address: '台北市大安區忠孝東路四段181號',
      phone: '02-2721-8888',
      storeTelephone: '02-2721-8888',
      city: '台北市',
      district: '大安區',
      area: '大安區',
      services: ['ATM', '影印', '代收', 'ibon'],
      businessHours: '24小時',
      operatingHours: '24小時',
      lastUpdated: new Date()
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const storeData of testStores) {
    try {
      const existingStore = await storeRepository.findOne({
        where: { storeId: storeData.storeId }
      });

      if (existingStore) {
        console.log(`門市 ${storeData.storeId} (${storeData.storeName}) 已存在，跳過`);
        continue;
      }

      const store = storeRepository.create(storeData);
      await storeRepository.save(store);
      
      console.log(`✅ 成功新增門市: ${storeData.storeId} (${storeData.storeName})`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ 新增門市 ${storeData.storeId} 失敗:`, error);
      errorCount++;
    }
  }

  console.log(`\n新增完成！成功: ${successCount}, 失敗: ${errorCount}`);
  
  // 查詢總數確認
  const totalStores = await storeRepository.count({ 
    where: { storeType: ConvenienceStoreType.FAMILY_MART } 
  });
  console.log(`目前資料庫中全家便利商店總數: ${totalStores}`);

  await app.close();
}

// 執行腳本
addTestStores()
  .then(() => {
    console.log('腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('腳本執行失敗:', error);
    process.exit(1);
  });