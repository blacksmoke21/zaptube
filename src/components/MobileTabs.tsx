"use client";

import { Home, TrendingUp, Subscript } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { icon: Home, label: "Home", href: "/" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Subscript, label: "Subs", href: "/subscriptions" },
];

export function MobileTabs() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-gray-900 border-t border-gray-700 sm:hidden">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className="flex-1">
            <div
              className={clsx(
                "flex flex-col items-center justify-center py-2",
                isActive ? "text-purple-400" : "text-gray-400"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
