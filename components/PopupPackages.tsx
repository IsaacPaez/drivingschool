"use client";

import React from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import AuthenticatedButton from "@/components/AuthenticatedButton";

interface PopupPackagesProps {
    item: any;
    onClose: () => void;
}

const PopupPackages: React.FC<PopupPackagesProps> = ({ item, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                {/* 📌 Botón de Cerrar */}
                <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl" onClick={onClose}>
                    <FaTimes />
                </button>

                {/* 📌 Imagen */}
                {item.media && item.media.length > 0 && (
                    <Image src={item.media[0]} alt={item.title} width={400} height={250} className="rounded-lg object-cover w-full" />
                )}

                {/* 📌 Título */}
                <h2 className="text-2xl font-bold text-gray-900 mt-4">{item.title}</h2>

                {/* 📌 Precio */}
                <p className="text-lg text-blue-600 font-semibold mt-2">${item.price.toFixed(2)}</p>

                {/* 📌 Descripción con Scroll si es necesario */}
                <div className="text-gray-700 mt-2 max-h-[40vh] overflow-y-auto pr-2 whitespace-pre-line">
                    {item.description}
                </div>


                {/* 📌 Botón de Compra */}
                <AuthenticatedButton
                    type="buy"
                    actionData={{ itemId: item._id, title: item.title, description: item.description, price: item.price }}
                    label="Add to Cart"
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 text-lg mt-4"
                />
            </div>
        </div>
    );
};

export default PopupPackages;
