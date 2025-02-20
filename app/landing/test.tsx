"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import founderImage from "@/public/static/landing/founder.webp";
import investorImage from "@/public/static/landing/investor.webp";
import bg from '@/public/static/landing/home.webp'

export default function HomePage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const Card = ({ title, description, image, onClick }: {
    title: string;
    description: string;
    image: any;
    onClick: () => void;
  }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [30, -30]);
    const rotateY = useTransform(x, [-100, 100], [-30, 30]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct * 100);
      y.set(yPct * 100);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        initial="initial"
        whileHover="hover"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          transformStyle: "preserve-3d",
        }}
        className="relative group cursor-pointer perspective-1000"
      >
        <motion.div
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.08 }
          }}
          transition={{ duration: 0.5 }}
          className="bg-[#1f1f1f] rounded-[0.35rem] p-5 transform-style-3d"
          onClick={onClick}
        >
          <div className="relative h-52  mb-2 overflow-hidden rounded-[0.35rem] transform-style-3d">
            <motion.div
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            <motion.div
              variants={{
                initial: { opacity: 0 },
                hover: { opacity: 0.5 }
              }}
              className="absolute inset-0 "
            />
          </div>

          <motion.div
            style={{
              transform: "translateZ(50px)",
            }}
            className="space-y-3 h-20"
          >


          </motion.div>

          <motion.div
            variants={{
              initial: { opacity: 0.4, y: 10 },
              hover: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-5 pr-5"
          >
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <div className="flex border w-full justify-between">  <p className="text-muted-foreground">{description}</p> 
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </motion.svg>
          </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-[90vh] bg-[#0e0e0e] py-10  `}>
      <motion.div
        className="px-20 mx-auto "
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-center mb-16 space-y-4"
          variants={{
            hidden: { opacity: 0, y: -20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <motion.h1
            className="text-5xl  font-bold mb-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-blue-500">Daftar </span>
            <span className="text-white">Operating System</span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Whether you're a founder pitching your startup idea to the world or an investor scouting opportunities globally, Daftar Operating System supports you in making more informed decisions with storytelling that hyper focuses on intent and data driven insights.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-10">
          <Card
            title="For Founders"
            description="Build the next big thing. Connect with investors who believe in your vision."
            image={founderImage}
            onClick={() => router.push('/login/founder')}
          />
          <Card
            title="For Investors"
            description="Discover groundbreaking startups. Shape the future of innovation."
            image={investorImage}
            onClick={() => router.push('/login/investor')}
          />
        </div>
      </motion.div>
    </div>
  );
}
