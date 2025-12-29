"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ResourceItem {
  _id: string;
  title: string;
  image: string;
  href?: string;
  order: number;
}

const Resources = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources");
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        }
      } catch (error) {
        console.error("[FETCH_RESOURCES_ERROR]", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && resources.length > 0) {
      setCurrentIndex(Math.floor(resources.length / 2) - 1);
    }
  }, [isMobile, resources.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= resources.length) {
          return 0;
        }
        return nextIndex;
      });
    }

    if (isRightSwipe) {
      setCurrentIndex((prevIndex) => {
        const prevIndexCalc = prevIndex - 1;
        if (prevIndexCalc < 0) {
          return resources.length - 1;
        }
        return prevIndexCalc;
      });
    }
  };

  if (loading) {
    return null;
  }

  if (resources.length === 0) {
    return null;
  }

  const duplicatedResources = isMobile
    ? [...resources, ...resources]
    : resources;

  return (
    <div
      style={{
        overflowX: isMobile ? "hidden" : "visible",
        position: "relative",
        width: "100%",
      }}
    >
      <section className="bg-white py-12">
        <h2 className="text-4xl font-extrabold text-center text-[#000000] mb-8">
          Resources
        </h2>
        <div
          className="max-w-6xl mx-auto px-4 md:px-6 pt-4"
          style={{ maxWidth: "1500px" }}
        >
          {isMobile && (
            <div className="relative overflow-hidden md:hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out gap-4 justify-start px-12 cursor-grab active:cursor-grabbing"
                style={{
                  transform: `translateX(calc(50vw - 150px - ${
                    currentIndex * 150
                  }px))`,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {duplicatedResources.map((resource, index) => {
                  const content = (
                    <div
                      className="min-w-[140px] max-w-[160px] h-[200px] bg-white rounded-2xl border border-[#e5e7eb] flex flex-col items-center justify-center text-center p-3 mx-1 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#27ae60] group cursor-pointer select-none"
                      style={{ flex: "0 0 150px" }}
                    >
                      <div
                        className="flex items-center justify-center h-18 w-18 mb-3 rounded-full bg-white transition-all duration-300 overflow-hidden"
                        style={{ height: "72px", width: "72px" }}
                      >
                        <Image
                          src={resource.image}
                          alt={resource.title}
                          width={64}
                          height={64}
                          className="object-contain w-12 h-12"
                          draggable={false}
                        />
                      </div>
                      <h3 className="text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                        {resource.title}
                      </h3>
                    </div>
                  );

                  return resource.href ? (
                    <Link
                      key={`${resource._id}-${index}`}
                      href={resource.href}
                      scroll={true}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={`${resource._id}-${index}`}>{content}</div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-6 gap-2">
                {resources.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-[#27ae60] w-6"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="hidden md:flex gap-6 flex-nowrap justify-center">
              {resources.map((resource) => {
                const content = (
                  <div
                    className="bg-white rounded-2xl border border-[#e5e7eb] flex flex-col items-center justify-center text-center p-3 mx-1 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#27ae60] group cursor-pointer
                               w-[clamp(120px,9vw,180px)] h-[clamp(170px,14vw,200px)]"
                    style={{ flex: "0 0 auto" }}
                  >
                    <div
                      className="flex items-center justify-center mb-3 rounded-full bg-white transition-all duration-300 overflow-hidden
                                    h-[clamp(48px,4.8vw,72px)] w-[clamp(48px,4.8vw,72px)]"
                    >
                      <Image
                        src={resource.image}
                        alt={resource.title}
                        width={72}
                        height={72}
                        className="object-contain w-[clamp(36px,3.6vw,56px)] h-[clamp(36px,3.6vw,56px)]"
                      />
                    </div>
                    <h3 className="text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                      {resource.title}
                    </h3>
                  </div>
                );

                return resource.href ? (
                  <Link key={resource._id} href={resource.href} scroll={true}>
                    {content}
                  </Link>
                ) : (
                  <div key={resource._id}>{content}</div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Resources;
