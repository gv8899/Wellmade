import React, { useState } from "react";

export type StockStatus = "in_stock" | "out_of_stock" | "preorder";

export interface ProductSpecOption {
  name: string;            // 規格名稱，如「顏色」
  options: string[];       // 可選項目，如["白","黑"]
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
  variants,
  specOptions,
  defaultQuantity = 1,
}) => {
  // 預設選第一個規格
  const initialSpecs = specOptions.reduce((acc, cur) => {
    acc[cur.name] = cur.options[0];
    return acc;
  }, {} as { [specName: string]: string });

  const [selectedSpecs, setSelectedSpecs] = useState<{ [specName: string]: string }>(initialSpecs);
  const [quantity, setQuantity] = useState(defaultQuantity);

  // 根據選擇的規格找到對應 variant
  const currentVariant = variants.find(v =>
    Object.entries(selectedSpecs).every(([k, vOpt]) => v.specs[k] === vOpt)
  );

  // 狀態與按鈕文案
  let statusLabel = "現貨";
  let actionButtons: React.ReactNode = null;
  if (!currentVariant) {
    statusLabel = "無此規格";
    actionButtons = <button disabled className="w-full py-3 rounded-lg bg-gray-200 text-gray-400 font-bold mt-4">無法購買</button>;
  } else if (currentVariant.stockStatus === "in_stock") {
    statusLabel = "現貨";
    actionButtons = (
      <div className="flex gap-3 mt-4">
        <button className="flex-1 py-3 rounded-lg bg-black text-white font-bold hover:bg-gray-800 transition">加入購物車</button>
        <button className="flex-1 py-3 rounded-lg border border-black text-black font-bold hover:bg-gray-100 transition">立即購買</button>
      </div>
    );
  } else if (currentVariant.stockStatus === "preorder") {
    statusLabel = "預購";
    actionButtons = (
      <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition mt-4">立即預購</button>
    );
  } else if (currentVariant.stockStatus === "out_of_stock") {
    statusLabel = "缺貨";
    actionButtons = (
      <button className="w-full py-3 rounded-lg bg-gray-300 text-gray-500 font-bold mt-4">貨到通知</button>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-10">
      <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 tracking-wide">購買方案</h2>
      <div className="flex flex-col items-center w-full">
        {/* 商品圖＋名稱＋價格 */}
        <div className="flex flex-row items-center w-full justify-center gap-4 mb-4">
          <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            {/* 圖片填滿容器 */}
            <img src={variants[0].image} alt="商品圖" className="w-full h-full object-cover rounded-md" />
          </div>
          <div className="flex flex-col items-start justify-center ml-2">
            <div className="text-base font-semibold text-gray-800 mb-1">{variants[0].variantTitle || title}</div>
            <div className="text-lg font-bold text-gray-800 mb-1">${variants[0].price}</div>
          </div>
        </div>
        {/* 規格選單區塊 */}
        <div className="flex flex-col gap-6 w-full max-w-xs items-center">
          {specOptions.map(spec => (
            <div key={spec.name} className="w-full">
              <div className="text-center text-gray-700 text-base font-medium mb-2">{spec.name}</div>
              <div className="flex flex-row gap-4 w-full justify-center">
                {spec.options.map(opt => {
                  const isSelected = selectedSpecs[spec.name] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={
                        `w-32 py-3 rounded border text-lg font-semibold transition ` +
                        (isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-800 border-gray-400 hover:border-black hover:bg-gray-100')
                      }
                      onClick={() => setSelectedSpecs({ ...selectedSpecs, [spec.name]: opt })}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
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
        {/* 加入購物車按鈕 */}
        <div className="w-full flex justify-center">
          <button className="w-56 py-3 rounded-full border border-black text-black font-semibold text-lg bg-white hover:bg-gray-100 transition">
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseOptions;
