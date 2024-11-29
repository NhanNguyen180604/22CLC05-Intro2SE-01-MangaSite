import { useStore } from "@nanostores/react";
import { createPortal } from "react-dom";
import { $showBlackLayer } from "../../stores/black-layer";

export default function BlackLayer() {
  const show = useStore($showBlackLayer);
  return createPortal(
    <div
      className={`inset-0 z-40 size-full bg-black/50 ${show ? "fixed" : "hidden"}`}
      data-testid="black-layer"
      onClickCapture={() =>
        document.dispatchEvent(new Event("blackLayerClick"))
      }
    ></div>,
    document.body,
    "black-layer",
  );
}
