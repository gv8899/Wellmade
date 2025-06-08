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
      <div className="flex flex-col divide-y divide-gray-200">
        {variants.map((variant, idx) => {
          // 取得目前這個 variant 的規格預設值
          const isSelected = Object.entries(selectedSpecs).every(
            ([k, vOpt]) => variant.specs[k] === vOpt
          );
          return (
            <div key={variant.id} className="flex flex-col md:flex-row items-center py-6 md:py-8 px-0 md:px-2 gap-6 md:gap-8 bg-transparent">
              {/* 手機版：圖左文右，桌機維持原本 */}
              <div className="w-full flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0">
                {/* 商品圖 */}
                <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center">
                  <img src={variant.image} alt="商品圖" className="w-24 h-24 object-cover rounded-lg" />
                </div>
                {/* 名稱與價格，手機版顯示在圖片右側 */}
                <div className="flex flex-col justify-center md:justify-start md:ml-0 ml-4">
                  <div className="text-base md:text-lg font-semibold text-black mb-1">{variant.variantTitle || title}</div>
                  <div className="text-lg font-bold text-black mb-1">${variant.price}</div>
                </div>
              </div>
              {/* 內容區 */}
              <div className="flex-1 w-full flex flex-col gap-2 mt-4 md:mt-0">
                {/* 規格選單與數量選擇器區塊（無外框） */}
                <div className="p-4 flex flex-col gap-4 w-fit bg-transparent">
                  <div className="flex flex-wrap items-center gap-6 mb-2">
                    {specOptions.map(spec => (
                      <div key={spec.name} className="flex items-center gap-2">
                        <span className="text-black text-sm font-medium">{spec.name}</span>
                        <select
                          className="border border-gray-400 rounded px-3 py-1 focus:ring-1 focus:ring-gray-400 text-sm text-black bg-white"
                          value={variant.specs[spec.name]}
                          onChange={e => {
                            setSelectedSpecs({ ...selectedSpecs, [spec.name]: e.target.value });
                          }}
                        >
                          {spec.options.map(opt => (
                            <option key={opt} value={opt} className="text-black">{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-black text-sm font-medium">數量</span>
                    <button
                      className="w-8 h-8 rounded-full border border-gray-400 text-black flex items-center justify-center disabled:opacity-30"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-black font-semibold">{quantity}</span>
                    <button
                      className="w-8 h-8 rounded-full border border-gray-400 text-black flex items-center justify-center"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              {/* 右側按鈕區：手機置中，桌機靠右 */}
              <div className="flex flex-col w-full md:w-48 mt-4 md:mt-0 items-center md:items-end justify-center md:justify-end">
                {/* 行動按鈕 */}
                {variant.stockStatus === "in_stock" && (
                  <button className="w-32 py-2 rounded-full border border-black text-black font-semibold hover:bg-gray-100 transition">加入購物車</button>
                )}
                {variant.stockStatus === "preorder" && (
                  <button className="w-32 py-2 rounded-full border border-blue-500 text-blue-700 font-semibold hover:bg-blue-50 transition">立即預購</button>
                )}
                {variant.stockStatus === "out_of_stock" && (
                  <button className="w-32 py-2 rounded-full border border-gray-300 text-gray-400 font-semibold cursor-not-allowed" disabled>貨到通知</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPurchaseOptions;
