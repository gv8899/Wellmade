import React, { useState } from "react";

export type StockStatus = "in_stock" | "out_of_stock" | "preorder";

export interface ProductSpecOption {
  name: string;            // 規格名稱，如「顏色」
  options: string[];       // 可選項目，如["白","黑"]
}

export interface ProductVariant {
  id: string;
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
    <section className="w-full max-w-2xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {currentVariant && (
        <img src={currentVariant.image} alt="商品圖" className="w-28 h-28 object-cover rounded-xl mb-4" />
      )}
      <div className="mb-2 text-lg font-semibold text-gray-900">${currentVariant?.price ?? "-"}</div>
      <div className="mb-2">
        <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${statusLabel === "現貨" ? "bg-green-100 text-green-700" : statusLabel === "預購" ? "bg-yellow-100 text-yellow-700" : statusLabel === "缺貨" ? "bg-gray-200 text-gray-500" : "bg-gray-100 text-gray-400"}`}>{statusLabel}</span>
      </div>
      {/* 規格選單 */}
      <div className="flex flex-col gap-3 mt-4">
        {specOptions.map(spec => (
          <div key={spec.name} className="flex items-center gap-3">
            <span className="text-gray-700 w-16">{spec.name}</span>
            <select
              className="border rounded-lg px-3 py-1"
              value={selectedSpecs[spec.name]}
              onChange={e => setSelectedSpecs({ ...selectedSpecs, [spec.name]: e.target.value })}
            >
              {spec.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {/* 數量選擇器 */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-gray-700 w-16">數量</span>
        <button
          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30"
          disabled={quantity <= 1}
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
        >
          -
        </button>
        <span className="w-8 text-center">{quantity}</span>
        <button
          className="w-8 h-8 rounded-full border flex items-center justify-center"
          onClick={() => setQuantity(q => q + 1)}
        >
          +
        </button>
      </div>
      {/* 行動按鈕區 */}
      {actionButtons}
    </section>
  );
};

export default ProductPurchaseOptions;
