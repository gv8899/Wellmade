"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaTachometerAlt, 
  FaBoxes, 
  FaTags, 
  FaUsers, 
  FaChartBar,
  FaHome,
  FaSitemap,
  FaImage,
  FaBlog
} from "react-icons/fa";

const navigationItems = [
  {
    name: "總覽",
    href: "/admin",
    icon: FaTachometerAlt,
  },
  {
    name: "產品管理",
    href: "/admin/products",
    icon: FaBoxes,
  },
  {
    name: "分類管理",
    href: "/admin/categories",
    icon: FaSitemap,
  },
  {
    name: "品牌管理",
    href: "/admin/brands",
    icon: FaTags,
  },
  {
    name: "Banner 管理",
    href: "/admin/banners",
    icon: FaImage,
  },
  {
    name: "Blog 管理",
    href: "/admin/blog",
    icon: FaBlog,
  },
  {
    name: "用戶管理",
    href: "/admin/users",
    icon: FaUsers,
  },
  {
    name: "統計報表",
    href: "/admin/analytics",
    icon: FaChartBar,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="p-4">
        {/* 返回前台 */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mb-4 border-b pb-4"
        >
          <FaHome className="w-5 h-5" />
          <span>返回前台</span>
        </Link>

        {/* 導航選單 */}
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname?.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}