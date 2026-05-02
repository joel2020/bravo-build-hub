import { useParams } from "react-router-dom";
import NYSystem from "./NYSystem";
import HighIntentServicePage from "./HighIntentServicePage";
import { getHighIntentService } from "@/lib/highIntentServices";

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  if (getHighIntentService(slug)) return <HighIntentServicePage />;
  return <NYSystem />;
};

export default ServiceDetail;
