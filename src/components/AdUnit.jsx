import { useEffect } from "react";

export default function AdUnit() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6776099675896233"
      data-ad-slot="3020060326"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}