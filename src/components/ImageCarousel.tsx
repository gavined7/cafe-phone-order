import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroImage1 from '@/assets/cafe-hero-1.jpg';
import heroImage2 from '@/assets/cafe-hero-2.jpg';
import heroImage3 from '@/assets/cafe-hero-3.jpg';

const carouselImages = [
  {
    src: heroImage1,
    title: "Welcome to Login Cafe",
    subtitle: "Where every sip tells a story"
  },
  {
    src: heroImage2,
    title: "Artisanal Coffee",
    subtitle: "Crafted with passion, served with love"
  },
  {
    src: heroImage3,
    title: "Fresh Pastries",
    subtitle: "Baked daily with the finest ingredients"
  }
];

export const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? carouselImages.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-coffee">
      {/* Images */}
      <div className="relative h-full">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  {image.title}
                </h2>
                <p className="text-sm md:text-lg opacity-90 drop-shadow-lg">
                  {image.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};