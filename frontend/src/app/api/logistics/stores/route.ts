import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export async function POST(request: NextRequest) {
  try {
    const searchParams = await request.json();
    
    console.log('[API Proxy] Store search request:', searchParams);

    // 這裡暫時回傳模擬資料，因為實際的門市搜尋需要整合藍新金流 API
    // 未來需要呼叫後端的門市搜尋端點
    
    const mockStores = [
      {
        id: '001',
        name: `${getStoreTypeName(searchParams.storeType)} 台北車站門市`,
        address: '台北市中正區北平西路3號',
        phone: '02-2381-1234',
        businessHours: '24小時營業',
        storeType: searchParams.storeType,
        district: '中正區',
        city: '台北市',
        postalCode: '100',
        distance: 0.5
      },
      {
        id: '002',
        name: `${getStoreTypeName(searchParams.storeType)} 西門町門市`,
        address: '台北市萬華區漢中街118號',
        phone: '02-2371-5678',
        businessHours: '06:00-24:00',
        storeType: searchParams.storeType,
        district: '萬華區',
        city: '台北市',
        postalCode: '108',
        distance: 1.2
      },
      {
        id: '003',
        name: `${getStoreTypeName(searchParams.storeType)} 信義商圈門市`,
        address: '台北市信義區信義路五段7號',
        phone: '02-2722-9999',
        businessHours: '24小時營業',
        storeType: searchParams.storeType,
        district: '信義區',
        city: '台北市',
        postalCode: '110',
        distance: 2.1
      }
    ];

    // 根據關鍵字和城市篩選
    let filteredStores = mockStores;
    
    if (searchParams.keyword) {
      filteredStores = filteredStores.filter(store => 
        store.name.includes(searchParams.keyword) || 
        store.address.includes(searchParams.keyword)
      );
    }
    
    if (searchParams.city) {
      filteredStores = filteredStores.filter(store => store.city === searchParams.city);
    }
    
    if (searchParams.district) {
      filteredStores = filteredStores.filter(store => store.district === searchParams.district);
    }

    console.log('[API Proxy] Store search response:', filteredStores);

    return NextResponse.json(filteredStores);
  } catch (error) {
    console.error('[API Proxy] Store search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getStoreTypeName(storeType: string): string {
  switch (storeType) {
    case 'SEVEN_ELEVEN':
      return '7-ELEVEN';
    case 'FAMILY_MART':
      return '全家便利商店';
    case 'HI_LIFE':
      return '萊爾富';
    case 'OK_MART':
      return 'OK便利商店';
    default:
      return '便利商店';
  }
}