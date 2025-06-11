import React, { useState, useEffect } from "react";
import { useCart } from "@/CartContext";
import RestockNotifyModal from "./RestockNotifyModal";
import { toast } from "react-hot-toast";


export type StockStatus = "in_stock" | "out_of_stock" | "preorder";

export interface ProductSpecOption {
  name: string;            // 規格名稱，例如「顏色」
  options: string[];       // 可選項目，例如["白","黑"]
}

export interface ProductVariant {
  id: string;
  variantTitle?: string; // 新增：每個品項的專屬名稱
  specs: { [specName: string]: string }; // e.g. {顏色: "白", 長度: "1.8m"}
  price: number;
  originalPrice?: number;
  image: string;
  stockStatus: StockStatus;
}

export interface ProductPurchaseOptionsProps {
  title: string;
  variants: ProductVariant[];
  specOptions: ProductSpecOption[];
  defaultQuantity?: number;
}

const ProductPurchaseOptions: React.FC<ProductPurchaseOptionsProps> = ({
  title,
  variants: initialVariants,
  specOptions: initialSpecOptions,
  defaultQuantity = 1,
}) => {
  const { addToCart, addCartClick } = useCart();
  
  // 狀態管理
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 產品變體和規格選項
  const [variants, setVariants] = useState(initialVariants);
  const [specOptions, setSpecOptions] = useState(initialSpecOptions);
  
  // 只使用第一個規格選項
  const primarySpecOption = specOptions.length > 0 ? specOptions[0] : null;
  const initialSpecs = primarySpecOption 
    ? { [primarySpecOption.name]: primarySpecOption.options[0] } 
    : {};

  const [selectedSpecs, setSelectedSpecs] = useState<{ [specName: string]: string }>(initialSpecs);
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [notifyOpen, setNotifyOpen] = useState(false);
  
  // 使用初始數據，不再嘗試加載 API 數據
  useEffect(() => {
    // 直接使用傳入的初始數據
    setIsLoading(false);
    setError(null);
    
    // 確保有選擇規格
    if (specOptions.length > 0) {
      setSelectedSpecs({ [specOptions[0].name]: specOptions[0].options[0] });
    }
  }, []);  // 只在組件渲染時執行一次

  // 根據選擇的規格找到對應 variant
  const currentVariant = primarySpecOption 
    ? variants.find(v => v.specs[primarySpecOption.name] === selectedSpecs[primarySpecOption.name])
    : variants[0]; // 如果沒有規格選項，則預設使用第一個變體

  // 狀態與按鈕文案
  let statusLabel = "現貨";
  let actionButtons: React.ReactNode = null;
  if (!currentVariant) {
    statusLabel = "無此規格";
    actionButtons = <button disabled className="w-full py-3 rounded-lg bg-gray-200 text-gray-400 font-bold mt-4">無法購買</button>;
  } else if (currentVariant.stockStatus === "in_stock") {
    statusLabel = "現貨";
    actionButtons = (
        <button
          className="w-full h-16 min-h-[64px] py-0 px-4 border-2 border-black rounded-[20px] text-xl font-bold text-black bg-white hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentVariant?.stockStatus !== "in_stock" || isAddingToCart}
          onClick={() => {
            if (!currentVariant) return;
            
            setIsAddingToCart(true);
            
            // 直接更新前端購物車狀態，不調用 API
            for (let i = 0; i < quantity; i++) {
              addToCart({
                id: currentVariant.id,
                name: currentVariant.variantTitle || title,
                price: currentVariant.price,
                cover: currentVariant.image,
                spec: selectedSpecs, // 帶入目前選擇的規格
              });
            }
            addCartClick();
            toast.success('已成功加入購物車');
            setIsAddingToCart(false);
          }}
        >
          {isAddingToCart ? '處理中...' : '加入購物車'}
        </button>
    );
  } else if (currentVariant.stockStatus === "preorder") {
    statusLabel = "預購";
    actionButtons = (
      <button
        className="w-full h-16 min-h-[64px] py-0 px-4 border-2 border-black rounded-[20px] text-xl font-bold text-black bg-white hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentVariant?.stockStatus !== "preorder"}
        onClick={() => { /* 預購功能尚未開放 */ }}
      >
        立即預購
      </button>
    );
  } else if (currentVariant.stockStatus === "out_of_stock") {
    statusLabel = "缺貨";
    actionButtons = (
      <button
        className="w-full h-16 min-h-[64px] py-0 px-4 border-2 border-black rounded-[20px] text-xl font-bold text-orange-500 bg-white hover:bg-orange-50 transition"
        onClick={() => setNotifyOpen(true)}
      >
        貨到通知
      </button>
    );
  }

  // 顯示加載狀態
  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto my-10">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 tracking-wide">購買選項</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }
  
  // 顯示錯誤狀態
  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto my-10">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 tracking-wide">購買選項</h2>
        <div className="flex justify-center items-center h-40 flex-col">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-black text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            重新整理
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-5xl mx-auto my-10">
      <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 tracking-wide">購買選項</h2>
      <div className="flex flex-col items-center w-full">
        {/* 商品圖+名稱+價格 */}
        <div className="flex flex-row items-center w-full justify-center gap-4 mb-4">
          <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            {/* 圖片容器 */}
            <img src={variants[0].image} alt="商品圖" className="w-full h-full object-cover rounded-md" />
          </div>
          <div className="flex flex-col items-start justify-center ml-2">
            <div className="text-base font-semibold text-gray-800 mb-1">{variants[0].variantTitle || title}</div>
            <div className="text-lg font-bold text-gray-800 mb-1">${variants[0].price}</div>
          </div>
        </div>
        {/* 規格選單區塊 - 只顯示第一個規格 */}
        <div className="flex flex-col gap-6 w-full max-w-xs items-center mx-auto">
          {primarySpecOption && (
            <div className="w-full">
              <div className="text-center text-gray-700 text-base font-medium mb-2">{primarySpecOption.name}</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {primarySpecOption.options.map((opt) => {
                  const isSelected = selectedSpecs[primarySpecOption.name] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`px-4 py-3 rounded-lg border text-lg font-semibold transition
                        ${isSelected 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-800 border-gray-300 hover:border-black hover:bg-gray-100'}`}
                      onClick={() => setSelectedSpecs({ [primarySpecOption.name]: opt })}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* 數量選擇器 */}
        <div className="flex flex-col items-center mt-8 mb-6">
          <div className="text-center text-gray-700 text-base font-medium mb-2">數量</div>
          <div className="flex flex-row gap-6 items-center">
            <button
              className="w-10 h-10 rounded-full border border-gray-400 text-2xl text-gray-700 flex items-center justify-center disabled:opacity-30"
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="w-8 text-center text-gray-900 font-bold text-xl">{quantity}</span>
            <button
              className="w-10 h-10 rounded-full border border-gray-400 text-2xl text-gray-700 flex items-center justify-center"
              onClick={() => setQuantity(q => q + 1)}
            >
              +
            </button>
          </div>
        </div>
        {/* 行動按鈕（加入購物車/預購/貨到通知） */}
        <div className="w-full max-w-xs mx-auto min-h-[64px] flex items-center">
      <div className="w-full">
        {actionButtons}
        <RestockNotifyModal
          open={notifyOpen}
          onClose={() => setNotifyOpen(false)}
          onSubmit={() => {
            setNotifyOpen(false);
          }}
        />
      </div>
</div>
      </div>
    </div>
  );
};

export default ProductPurchaseOptions;
