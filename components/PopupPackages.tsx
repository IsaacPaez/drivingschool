"use client";

import React from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import AuthenticatedButton from "@/components/AuthenticatedButton";

/** 
 * Interfaz con los campos que realmente reciba "item". 
 * Todos son opcionales salvo `_id`, pues depende de tu API si son obligatorios.
 */
interface PopupPackageItem {
  _id: string;
  title?: string;
  price?: number;
  description?: string;
  media?: string[];
}

interface PopupPackagesProps {
  item: PopupPackageItem;
  onClose: () => void;
}

const PopupPackages: React.FC<PopupPackagesProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        {/* Botón de Cerrar */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        {/* Imagen principal */}
        {item.media && item.media.length > 0 && (
          <Image
            src={item.media[0]}
            alt={item.title || "Package Image"}
            width={400}
            height={250}
            className="rounded-lg object-cover w-full"
          />
        )}

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          {item.title || "Untitled Package"}
        </h2>

        {/* Precio (uso de optional chaining para evitar error si price es undefined) */}
        <p className="text-lg text-blue-600 font-semibold mt-2">
          ${item.price?.toFixed(2) ?? "0.00"}
        </p>

        {/* Descripción */}
        <div className="text-gray-700 mt-2 max-h-[40vh] overflow-y-auto pr-2 whitespace-pre-line">
          {item.description || "No description available."}
        </div>

        {/* Botón de Compra */}
        <AuthenticatedButton
          type="buy"
          actionData={{
            itemId: item._id,
            title: item.title,
            price: item.price,
          }}
          label="Add to Cart"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 text-lg mt-4"
        />
      </div>
    </div>
  );
};

export default PopupPackages;
