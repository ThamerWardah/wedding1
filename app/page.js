'use client'
import { motion } from 'framer-motion'
import { FaCat, FaMoon, FaStar } from 'react-icons/fa'
export default function Home() {
  return (
    <div className="w-full h-screen flex justify-center items-end ">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80 text-white">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100 - 50}%`,
              fontSize: `${2 + Math.random() * 14}px`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 mb-28   text-center z-20"
            >
              <div className="flex justify-center  ">
                <motion.span
                  animate={{
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 0.4,
                  }}
                >
                  <FaStar className="text-white" />
                </motion.span>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <FaMoon className="absolute top-12 left-40 text-6xl text-white" />

      <FaStar className="absolute top-22 left-70 text-sm text-white animate-pulse" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 mb-28   text-center z-20"
      >
        <div className="flex justify-center  text-lg ">
          {[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 151, 2, 3, 4, 5, 6, 7, 8,
            9, 10, 11, 12, 13, 15, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
            151, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15,
          ].map((icon, index) => (
            <motion.span
              key={index}
              animate={{
                scale: [1, 1.4, 1],
                y: [20, -9, 20],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.11,
              }}
            >
              <div className=" w-[12px] h-22 bg-blue-900 rounded-sm z-0">
                {index == 20 ? (
                  <FaCat className="z-10 text-yellow-500 text-6xl absolute top-[-54px]" />
                ) : null}
              </div>
            </motion.span>
          ))}
        </div>
      </motion.div>
      <div className="absolute bottom-0 right-0 w-screen bg-blue-900 h-40 z-2"></div>
      <div className="absolute bottom-0 left-[-10px] w-12 bg-gray-400 h-48 z-0 rounded-r-[4px]"></div>
    </div>
  )
}
