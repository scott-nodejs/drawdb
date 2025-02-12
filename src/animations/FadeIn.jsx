/**
 * @description 淡入动画组件 - 当元素进入视图时触发淡入效果
 * @param {Object} props
 * @param {React.ReactNode} props.children - 需要添加动画的子元素
 * @param {number} props.duration - 动画持续时间(秒)
 */
import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export default function FadeIn({ children, duration }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref}>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </div>
  );
}