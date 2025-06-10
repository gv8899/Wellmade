import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandSectionProps {
  brandId?: string;
  name: string;
  description: string;
  logoUrl: string;
}

const BrandSection: React.FC<BrandSectionProps> = ({
  brandId,
  name,
  description,
  logoUrl,
}) => {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center p-6">
          {/* 品牌 Logo - 可點擊導向品牌產品列表 */}
          {brandId ? (
            <Link href={`/brands/${brandId}`} className="relative w-40 h-40 mb-6 cursor-pointer">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                  src={logoUrl}
                  alt={`${name} 品牌標誌`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 160px, 160px"
                />
              </div>
            </Link>
          ) : (
            <div className="relative w-40 h-40 mb-6">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                  src={logoUrl}
                  alt={`${name} 品牌標誌`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 160px, 160px"
                />
              </div>
            </div>
          )}
          
          {/* 品牌資訊 - 垂直置中排列 */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-3 text-black">{name}</h3>
            <p className="text-gray-700 max-w-lg mx-auto">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
