"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import throttle from "lodash.throttle";
import "swiper/css";

import CategoryBox from "./CategoryBox";
import { categories } from "@/utils/constants";
import { Category } from "@/types";

const Categories = () => {
  const [isActive, setIsActive] = useState(false);
  const params = useSearchParams();
  const pathname = usePathname();
  const category = params?.get("category");

  const isMainPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 150);
    window.addEventListener("scroll", throttledHandleScroll);

    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, []);

  if (!isMainPage) {
    return null;
  }

  return (
    <div
      className={` ${
        isActive ? "shadow-md shadow-[rgba(0,0,0,.045)] dark:shadow-md dark:shadow-black/20" : ""
      } transition-all duration-150 bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700`}
    >
      <div className="w-full px-4 md:px-8 lg:px-12 overflow-x-auto">
        <Swiper
          slidesPerView="auto"
          pagination={{
            clickable: true,
          }}
          className="mt-2"
        >
          {categories.map((item: Category) => (
            <SwiperSlide className="max-w-fit" key={item.label}>
              <CategoryBox
                label={item.label}
                icon={item.icon}
                selected={category === item.label}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Categories;
