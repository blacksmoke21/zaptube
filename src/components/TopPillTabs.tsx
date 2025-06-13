"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

const tabs = [
  { label: "Home", href: "/" },
  { label: "Trending", href: "/trending" },
  { label: "Subs", href: "/subscriptions" },
];

export function TopPillTabs() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden mb-4 flex justify-start gap-2  px-4">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href}>
            <span
              className={clsx(
                "px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition",
                isActive
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              )}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
