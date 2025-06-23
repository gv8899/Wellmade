"use client";
import React, { useRef } from "react";
import ProductHero from "./ProductHero";
import KeyFeatures from "./KeyFeatures";
import { KeyFeatureCard } from "./KeyFeatures";
import FeatureDetails from "./FeatureDetails";
import { FeatureDetail } from "../../../services/api";
import FAQSection, { FAQItem } from "./FAQSection";
import ProductPurchaseOptions, { ProductVariant, ProductSpecOption } from "./ProductPurchaseOptions";
import GoodProductsSection from "./GoodProductsSection";
import BrandSection from "./BrandSection";
import { FaBolt, FaTint, FaBatteryFull, FaRegLightbulb } from "react-icons/fa";
import { useCart } from '@/CartContext';
import { Product as ApiProduct, getProductById, getProductCategoryName, FAQItem as ApiFAQItem } from '@/services/api';

// 前端顯示用的產品類型
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  cover: string;
  category: string;
  style?: string;
  media: {
    type: "image" | "video";
    src: string;
    alt?: string;
  }[];
  brandId?: string;
  brand?: {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
  };
  keyFeatures?: KeyFeatureCard[];
  featureDetails?: FeatureDetail[];
  faqs?: FAQItem[];
}

interface ProductDetailClientProps {
  id: string;
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ id }) => {
  // KeyFeatures 橫向滾動區塊的 scrollRef
  const keyFeaturesScrollRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [collected, setCollected] = React.useState(false);
  const [variants, setVariants] = React.useState<ProductVariant[]>([]);
  const [specOptions, setSpecOptions] = React.useState<ProductSpecOption[]>([]);
  const [currentImage, setCurrentImage] = React.useState<string>("");
  const { cartItems, addToCart, removeFromCart, addCartClick } = useCart();

  // 準備變體圖片列表 - 移到組件頂部
  const variantImages = React.useMemo(() => {
    const images = [product?.cover].filter(Boolean) as string[];
    
    // 添加變體圖片
    variants.forEach(variant => {
      if (variant.image && !images.includes(variant.image)) {
        images.push(variant.image);
      }
    });
    
    return images;
  }, [product, variants]);

  // 生命週期，localStorage與資料讀取
  React.useEffect(() => {
    // 讀取產品資料
    const loadProductData = async () => {
      try {
        // 從實際 API 獲取資料
        const apiProduct = await getProductById(id);
        
        // 轉換為前端顯示格式
        const displayProduct: Product = {
          id: apiProduct.id,
          name: apiProduct.name,
          price: apiProduct.price,
          description: apiProduct.description,
          cover: apiProduct.imageUrl, // 使用主圖作為封面
          category: getProductCategoryName(apiProduct),
          // 將所有圖轉換為媒體列表
          media: [
            {
              type: "image",
              src: apiProduct.imageUrl,
              alt: apiProduct.name
            },
            ...(apiProduct.images || []).map(img => ({
              type: "image" as const,
              src: img,
              alt: apiProduct.name
            }))
          ],
          // 添加品牌資訊
          brandId: apiProduct.brandId,
          brand: apiProduct.brand ? {
            id: apiProduct.brand.id,
            name: apiProduct.brand.name,
            description: apiProduct.brand.description,
            logoUrl: apiProduct.brand.logoUrl
          } : undefined,
          // 添加關鍵特性
          keyFeatures: apiProduct.keyFeatures || [],
          // 添加特性詳情
          featureDetails: apiProduct.featureDetails || [],
          // 添加常見問答
          faqs: apiProduct.faqs || []
        };
        
        setProduct(displayProduct);
        setCurrentImage(displayProduct.cover); // 設置初始圖片
        
        // 載入產品變體
        await loadProductVariants(apiProduct);
        
      } catch (error) {
        console.error('無法載入產品資料:', error);
        // 設置錯誤狀態或重導至錯誤頁面
        setProduct(null);
      }
    };
    
    // 載入產品變體資料
    const loadProductVariants = async (apiProduct: ApiProduct) => {
      try {
        // 檢查產品是否有實際的變體
        if (apiProduct.variants && apiProduct.variants.length > 0) {
          // 轉換為前端顯示格式
          const displayVariants: ProductVariant[] = apiProduct.variants.map(variant => ({
            id: variant.id,
            variantTitle: variant.variantTitle || `${variant.specs ? Object.values(variant.specs).join(' - ') : ''}`,
            specs: variant.specs || {},
            price: Number(variant.price),
            compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
            image: variant.imageUrl || apiProduct.imageUrl,
            stockStatus: variant.status === 'IN_STOCK' ? 'in_stock' : 
                        variant.status === 'PREORDER' ? 'preorder' : 'out_of_stock',
            // 保留新架構的欄位
            stock: variant.stock,
            status: variant.status,
            inventoryType: variant.inventoryType,
            isActive: variant.isActive,
            preorderLimit: variant.preorderLimit,
            preorderSold: variant.preorderSold
          }));
          
          setVariants(displayVariants);
          
          // 生成規格選項
          const specMap = new Map<string, Set<string>>();
          apiProduct.variants.forEach(variant => {
            if (variant.specs) {
              Object.entries(variant.specs).forEach(([key, value]) => {
                if (!specMap.has(key)) {
                  specMap.set(key, new Set());
                }
                specMap.get(key)!.add(value);
              });
            }
          });
          
          const generatedSpecOptions: ProductSpecOption[] = Array.from(specMap.entries()).map(([name, values]) => ({
            name,
            options: Array.from(values)
          }));
          
          setSpecOptions(generatedSpecOptions);
        } else {
          // 產品沒有變體，生成單一變體
          const singleVariant: ProductVariant[] = [{
            id: apiProduct.id,
            variantTitle: "標準版",
            specs: {},
            price: Number(apiProduct.price),
            image: apiProduct.imageUrl,
            stockStatus: apiProduct.status === 'IN_STOCK' ? 'in_stock' : 
                        apiProduct.status === 'PREORDER' ? 'preorder' : 'out_of_stock',
            stock: apiProduct.stock,
            status: apiProduct.status,
            isActive: apiProduct.isActive
          }];
          
          setVariants(singleVariant);
          setSpecOptions([]); // 沒有規格選項
        }
      } catch (error) {
        console.error('載入變體失敗:', error);
        // 生成預設變體
        generateDefaultVariant(apiProduct);
      }
    };
    
    // 生成預設變體
    const generateDefaultVariant = (product: Product | ApiProduct) => {
      const defaultVariants: ProductVariant[] = [
        { 
          id: `${product.id}_default`,
          variantTitle: "標準版",
          specs: {},
          price: typeof product.price === 'string' ? Number(product.price) : product.price,
          image: 'cover' in product ? product.cover : product.imageUrl,
          stockStatus: "in_stock"
        }
      ];
      setVariants(defaultVariants);
      setSpecOptions([]);
    };
    
    loadProductData();
    
    // 讀取本地狀態
    setCollected(localStorage.getItem(`collected_${id}`) === '1');
  }, [id]);

  // 收藏功能
  const handleCollect = () => {
    const newState = !collected;
    setCollected(newState);
    localStorage.setItem(`collected_${id}`, newState ? '1' : '0');
  };

  // 處理加入購物車
  const handleCart = () => {
    if (!isInCart && product && variants.length > 0) {
      // 使用第一個可用變體
      const firstVariant = variants[0];
      const item = {
        id: product.id,
        name: product.name,
        price: firstVariant.price,
        cover: product.cover,
        specs: firstVariant.specs,
        quantity: 1
      };
      addToCart(item);
      addCartClick();
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 產品特性詳細資訊 - 如果 API 返回的資料中有 featureDetails，則使用 API 資料，否則使用預設資料
  const defaultFeatureDetails: FeatureDetail[] = [
    {
      type: "image",
      src: "https://placehold.co/600x400/FFDD4A/333333?text=高效能",
      title: "高效能",
      description: "最新技術帶來無與倫比的使用體驗，能效提升40%",
      direction: "left"
    },
    {
      type: "image",
      src: "https://placehold.co/600x400/4AA3F7/FFFFFF?text=防水設計",
      title: "防水設計",
      description: "IP68防水等級，水深1.5公尺可持續30分鐘不受損",
      direction: "right"
    },
    {
      type: "image",
      src: "https://placehold.co/600x400/4CAF50/FFFFFF?text=長效電池",
      title: "長效電池",
      description: "單次充電可持續使用長達36小時，遠超同類產品",
      direction: "left"
    },
    {
      type: "image",
      src: "https://placehold.co/600x400/FFA726/FFFFFF?text=智能感應",
      title: "智能感應",
      description: "內置先進感測器，根據環境自動調整最佳運作模式",
      direction: "right"
    }
  ];

  // 常見問題 - 如果 API 返回的資料中有 faqs，則使用 API 資料，否則使用預設資料
  const defaultFaqs: FAQItem[] = [
    {
      question: "產品保固期是多久？",
      answer: "我們提供兩年的全球保固服務，若產品出現功能性問題可免費維修或更換。"
    },
    {
      question: "如何正確清潔和保養產品？",
      answer: "建議使用微濕的軟布輕輕擦拭，避免使用含酒精或腐蝕性的清潔劑，定期清潔可延長產品壽命。"
    },
    {
      question: "產品支援哪些配件？",
      answer: "我們提供多種專用配件，包括保護套、專用充電器及連接線，全部通過嚴格品質測試，完美兼容。"
    },
    {
      question: "如何聯絡客服支援？",
      answer: "您可透過官網的線上客服、客服電子郵件或撥打服務熱線獲得協助，我們的專業團隊會盡快回應您的問題。"
    }
  ];

  // 變體和規格選項現在從 state 中獲取

  // 格式化價格
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const isInCart = cartItems.some(item => item.id === id);

  // 處理圖片切換
  const handleImageChange = (imageUrl: string) => {
    setCurrentImage(imageUrl);
  };

  return (
    <div className="min-h-screen bg-white">
      <ProductHero
        subtitle={product.categoryRelation?.name || "精品科技"}
        title={product.name}
        description={product.description}
        imageUrl={currentImage || product.cover}
        primaryText="立即購買"
        secondaryText={isInCart ? "已加入購物車" : "加入購物車"}
        onPrimaryAction={() => window.scrollTo({top: document.getElementById('purchase')?.offsetTop, behavior: 'smooth'})}
        onSecondaryAction={handleCart}
        variantImages={variantImages}
        onImageChange={handleImageChange}
      />
      
      <KeyFeatures
        scrollRef={keyFeaturesScrollRef}
        features={(product?.keyFeatures && product.keyFeatures.length > 0) 
          ? product.keyFeatures 
          : [
            { image: "https://placehold.co/100x100/FF9800/FFFFFF?text=💪", title: "高品質", description: "精選優質材料，嚴格品控" },
            { image: "https://placehold.co/100x100/4CAF50/FFFFFF?text=🛡️", title: "安全可靠", description: "多重安全認證，使用無顧慮" },
            { image: "https://placehold.co/100x100/2196F3/FFFFFF?text=🔋", title: "續航持久", description: "長效電池，持久耐用" },
            { image: "https://placehold.co/100x100/9C27B0/FFFFFF?text=🔄", title: "售後保障", description: "兩年保固，終身技術支援" }
          ]}
      />
      
      <FeatureDetails details={product?.featureDetails?.length ? product.featureDetails : defaultFeatureDetails} />
      
      {variants.length > 0 && (
        <ProductPurchaseOptions
          title={product.name}
          variants={variants}
          specOptions={specOptions.map(option => ({
            name: option.name,
            options: option.options.length > 0 ? option.options : ['預設值'] // 確保 options 至少有一個預設值
          }))}
          defaultQuantity={1}
        />
      )}

      {product.brand && 
        <BrandSection 
          brandId={product.brand.id}
          name={product.brand.name}
          description={product.brand.description}
          logoUrl={product.brand.logoUrl || ''}
        />
      }
      
      <FAQSection faqs={product?.faqs?.length ? product.faqs : defaultFaqs} />
      
      <GoodProductsSection excludeId={id} />
    </div>
  );
};

export default ProductDetailClient;
