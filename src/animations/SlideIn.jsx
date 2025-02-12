/**
 * @description 滑入动画组件 - 当元素进入视图时触发从左向右滑入效果
 * @param {Object} props
 * @param {React.ReactNode} props.children - 需要添加动画的子元素
 * @param {number} props.duration - 动画持续时间(秒)
 * @param {number} props.delay - 动画延迟时间(秒)
 * @param {string} props.className - 自定义CSS类名
 */
import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export default function SlideIn({ children, duration, delay, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -60 },
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}