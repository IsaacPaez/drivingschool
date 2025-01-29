interface Product {
  image: string;
  name: string;
  price: string;
}

interface PackageCardProps {
  product: Product;
  onClick: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ product, onClick }) => {
  return (
    <div
      className="bg-white border rounded-lg p-4 shadow-md hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-bold">{product.name}</h3>
      <p className="text-blue-500 font-semibold">{product.price}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3 w-full">
        Add to Cart
      </button>
    </div>
  );
};

export default PackageCard;
