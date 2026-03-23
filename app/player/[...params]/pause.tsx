import { MovieTypes } from "@/types/types";
import { motion } from "framer-motion";

export default function Pause({
  metadata,
  color,
}: {
  metadata: MovieTypes;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/60 z-10 overflow-hidden pointer-events-none"
    >
      <div className="absolute left-[5%] -translate-x-[5%] sm:bottom-[10%] top-[50%] lg:top-[unset] sm:-translate-y-[10%] -translate-y-[50%] sm:max-w-3xl max-w-lg w-full p-4  max-[340px]:p-1  max-[340px]:max-w-[70%]">
        <h3 className="lg:text-xl text-muted-foreground font-medium text-sm  max-[340px]:text-[0.6rem]">
          You're watching
        </h3>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  max-[340px]:text-lg font-bold text-white mt-1  max-[340px]:mt-0 ">
          {metadata.name || metadata.title}
        </h1>
        <h1 className="lg:text-xl md:text-lg  max-[340px]:text-xs font-semibold lg:mt-4 mt-2  max-[340px]:mt-0.5 italic">
          {metadata.tagline}
        </h1>

        <div
          className="lg:w-32 w-22 max-[340px]:w-15 lg:h-0.5 h-px  mt-4  max-[340px]:mt-1.5"
          style={{ backgroundColor: `#${color}` }}
        ></div>
        <p className="lg:mt-8 mt-4  max-[340px]:mt-1.5 lg:text-xl md:text-lg sm:text-base text-sm   max-[340px]:text-[0.6rem] text-muted-foreground line-clamp-3">
          {metadata.overview}
        </p>
      </div>
      <div className="absolute lg:right-[5%] -translate-x-[5%] lg:bottom-[10%] bottom-0 right-0 lg:top-[unset] lg:-translate-y-[10%]  p-4   max-[340px]:text-xs  max-[340px]:p-2">
        <h1 className="lg:text-xl ">Paused</h1>
      </div>
    </motion.div>
  );
}
