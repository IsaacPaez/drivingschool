import React from "react";

interface Product {
  image: string;
  name: string;
  price: string;
}

interface PackageModalProps {
  product: Product | null;
  onClose: () => void;
}

const PackageModal: React.FC<PackageModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-3/4 md:w-1/2 p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-60 object-cover rounded-md mb-4"
        />
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-lg text-blue-500 font-semibold mt-4">
          {product.price}
        </p>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-md mt-4 w-full">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default PackageModal;
