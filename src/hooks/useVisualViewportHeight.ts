import { useEffect, useState } from "react";

function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

export function useVisualViewportHeight(): number {
  const [height, setHeight] = useState(getViewportHeight);

  useEffect(() => {
    const handleResize = () => {
      setHeight(getViewportHeight());
    };

    handleResize();
    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return height;
}
