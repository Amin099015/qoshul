import { createFileRoute } from "@tanstack/react-router";
import { FeedScreen } from "@/components/qoshul/screens";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Qoshul.az — Şəhər səninlə daha maraqlıdır" },
    { name: "description", content: "Bakıda yeni dostlar tap, yaxınlıqdakı tədbirlərə qoşul və maraqlarını bölüş." },
    { property: "og:title", content: "Qoshul.az — Şəhər səninlə daha maraqlıdır" },
    { property: "og:description", content: "Yaxınlıqdakı görüşlər və yeni dostlar səni gözləyir." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FeedScreen,
});
