"use client";

import { useState } from "react";
import PackageModal from "./PackageModal";
import PackageCard from "./PackageCard";
import PackageData from "./PackageData";
import PackageSidebar from "./PackageSidebar";
import PackageFilter from "./PackageFilter";

const PackageCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const filteredProducts = PackageData.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "All" || product.category === selectedCategory)
  );

  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Sidebar de Categorías */}
      <PackageSidebar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Sección Principal */}
      <div className="w-full md:w-3/4 p-6">
        <PackageFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <PackageCard
              key={product.id}
              product={product}
              onClick={() => openModal(product)}
            />
          ))}
        </div>
      </div>

      {/* Modal de Producto */}
      {isModalOpen && (
        <PackageModal product={selectedProduct} onClose={closeModal} />
      )}
    </div>
  );
};

export default PackageCatalog;
