import Image from 'next/image'

interface FeatureCardProps {
  image: string
  imageAlt: string
  title: string
  description: string
  buttonText: string
  isNull?: boolean
  isActive?: boolean
  onClick: () => void
}

export function FeatureCard({
  image,
  imageAlt,
  title,
  description,
  isNull,
  buttonText,
  isActive = false,
  onClick
}: FeatureCardProps) {
  return (
    <div className="z-10 p-3 flex flex-col justify-center items-center h-[30rem] rounded-lg">
      <Image src={image} alt={imageAlt} height={200} width={250} />
      <div className="bg-white py-3 z-10 bg-opacity-10 px-4 rounded-lg">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`my-5 p-2 hover:scale-105 rounded transition-all duration-500 ${isActive
          ? 'bg-blue-500 scale-95 text-white'
          : 'bg-white text-black hover:bg-blue-500 hover:text-white'
          }`}
      >
        {buttonText}
      </button>
    </div>
  )
} 