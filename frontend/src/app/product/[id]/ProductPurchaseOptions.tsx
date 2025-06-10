import React, { useState } from "react";
import { useCart } from "@/CartContext";
import RestockNotifyModal from "./RestockNotifyModal";


export type StockStatus = "in_stock" | "out_of_stock" | "preorder";

export interface ProductSpecOption {
  name: string;            // è¦æ ¼åç¨±ï¼å¦ãé¡è²ã
  options: string[];       // å¯é¸é ç®ï¼å¦["ç½","é»"]
}

export interface ProductVariant {
  id: string;
  variantTitle?: string; // æ°å¢ï¼æ¯ååé çå°å±¬åç¨±
  specs: { [specName: string]: string }; // e.g. {é¡è²: "ç½", é·åº¦: "1.8m"}
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
  const { addToCart, addCartClick } = useCart();
  // é è¨­é¸ç¬¬ä¸åè¦æ ¼
  const initialSpecs = specOptions.reduce((acc, cur) => {
    acc[cur.name] = cur.options[0];
    return acc;
  }, {} as { [specName: string]: string });

  const [selectedSpecs, setSelectedSpecs] = useState<{ [specName: string]: string }>(initialSpecs);
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [notifyOpen, setNotifyOpen] = useState(false);

  // æ ¹æé¸æçè¦æ ¼æ¾å°å°æ variant
  const currentVariant = variants.find(v =>
    Object.entries(selectedSpecs).every(([k, vOpt]) => v.specs[k] === vOpt)
  );

  // çæèæéææ¡
  let statusLabel = "ç¾è²¨";
  let actionButtons: React.ReactNode = null;
  if (!currentVariant) {
    statusLabel = "ç¡æ­¤è¦æ ¼";
    actionButtons = <button disabled className="w-full py-3 rounded-lg bg-gray-200 text-gray-400 font-bold mt-4">ç¡æ³è³¼è²·</button>;
  } else if (currentVariant.stockStatus === "in_stock") {
    statusLabel = "ç¾è²¨";
    actionButtons = (
        <button
          className="w-full h-16 min-h-[64px] py-0 px-4 border-2 border-black rounded-[20px] text-xl font-bold text-black bg-white hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentVariant?.stockStatus !== "in_stock"}
          onClick={() => {
            if (!currentVariant) return;
            for (let i = 0; i < quantity; i++) {
              addToCart({
                id: currentVariant.id,
                name: currentVariant.variantTitle || title,
                price: currentVariant.price,
                cover: currentVariant.image,
                spec: selectedSpecs, // å¸¶å¥ç®åé¸å®çè¦æ ¼
              });
            }
            addCartClick();
          }}
        >
          å å¥è³¼ç©è»
        </button>
    );
  } else if (currentVariant.stockStatus === "preorder") {
    statusLabel = "é è³¼";
    actionButtons = (
      <button
        className="w-full h-16 min-h-[64px] py-0 px-4 border-2 border-black rounded-[20px] text-xl font-bold text-black bg-white hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentVariant?.stockStatus !== "preorder"}
        onClick={() => { /* é è³¼åè½å°æªéæ¾ */ }}
      >
        ç«å³é è³¼
      </button>
    );
  } else if (currentVariant.stockStatus === "out_of_stock") {
    statusLabel = "ç¼ºè²¨";
    actionButtons = (
      <button
        className="w-full h-16 min-h-[64px] py-0 px-4 border-2 border-black rounded-[20px] text-xl font-bold text-orange-500 bg-white hover:bg-orange-50 transition"
        onClick={() => setNotifyOpen(true)}
      >
        è²¨å°éç¥
      </button>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-10">
      <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 tracking-wide">è³¼è²·ç¢å</h2>
      <div className="flex flex-col items-center w-full">
        {/* åååï¼åç¨±ï¼å¹æ ¼ */}
        <div className="flex flex-row items-center w-full justify-center gap-4 mb-4">
          <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            {/* åçå¡«æ»¿å®¹å¨ */}
            <img src={variants[0].image} alt="ååå" className="w-full h-full object-cover rounded-md" />
          </div>
          <div className="flex flex-col items-start justify-center ml-2">
            <div className="text-base font-semibold text-gray-800 mb-1">{variants[0].variantTitle || title}</div>
            <div className="text-lg font-bold text-gray-800 mb-1">${variants[0].price}</div>
          </div>
        </div>
        {/* è¦æ ¼é¸å®åå¡ */}
        <div className="flex flex-col gap-6 w-full max-w-xs items-center mx-auto">
          {specOptions.map(spec => (
            <div key={spec.name} className="w-full">
              <div className="text-center text-gray-700 text-base font-medium mb-2">{spec.name}</div>
              <div className="flex flex-row w-full justify-center">
                {spec.options.map((opt, idx) => {
  const isFirst = idx === 0;
  const isLast = idx === spec.options.length - 1;
  const isSelected = selectedSpecs[spec.name] === opt;
  return (
    <button
      key={opt}
      type="button"
      className={`flex-1 min-w-0 py-3 border text-lg font-semibold transition
        ${isFirst ? 'rounded-l-[12px]' : ''}
        ${isLast ? 'rounded-r-[12px]' : ''}
        ${!isFirst && !isLast ? 'rounded-none' : ''}
        ${!isLast ? 'border-r-0' : ''}
        ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-400 hover:border-black hover:bg-gray-100'}`}
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
        {/* æ¸éé¸æå¨ */}
        <div className="flex flex-col items-center mt-8 mb-6">
          <div className="text-center text-gray-700 text-base font-medium mb-2">æ¸é</div>
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
        {/* åæè¡åæéï¼è³¼ç©è»/é è³¼/è²¨å°éç¥ï¼ */}
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
