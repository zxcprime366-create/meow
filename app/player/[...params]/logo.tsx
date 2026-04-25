
import { motion } from "framer-motion";

export default function LoadingMetadata({ logo }: { logo: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0   overflow-hidden pointer-events-none"
    >
      <div className="absolute left-[5%] -translate-x-[5%] sm:bottom-[10%] top-[50%] lg:top-[unset] sm:-translate-y-[10%] -translate-y-[50%]   spect-video   flex justify-center items-center ">
        <img
          className="object-contain a object-left lg:max-w-md max-w-sm max-h-30 lg:max-h-50 drop-shadow-sm"
          src={`https://image.tmdb.org/t/p/w780/${logo}`}
          alt=""
        />
      </div>
    </motion.div>
  );
}
