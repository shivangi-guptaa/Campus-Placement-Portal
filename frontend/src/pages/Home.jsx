import React from "react";
import Navbar from "../components/shared/Navbar";
import HeroSection from "../components/HeroSection";
import CategoryCarousel from "../components/CategoryCarousel";
import LatestJobs from "../components/LatestJobs";
import PlacementCalendar from "../components/PlacementCalendar";
import Footer from "../components/shared/Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";

const Home = () => {
  useGetAllJobs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      <Navbar />
      <HeroSection />
      <CategoryCarousel />
      <LatestJobs />
      <PlacementCalendar />
      <Footer />
    </div>
  );
};

export default Home;
