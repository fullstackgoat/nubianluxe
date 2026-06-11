import { getPriceListCategories } from "@/lib/price-list";
import { toFooterServices } from "@/lib/footer-services";
import Footer from "@/components/Footer";

export default async function FooterShell() {
  const categories = await getPriceListCategories();
  return <Footer services={toFooterServices(categories)} />;
}
